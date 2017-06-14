 // @flow
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import VisibilitySensor from 'react-visibility-sensor';
import { TweenMax } from 'gsap';
import { randomFromTo } from '../../utils/MathUtils';
import { makeBothArrayTheSameLength } from '../../utils/ArrayUtils';
import { superscriptToNormal, replaceAt } from '../../utils/StringUtils';
import { BASE, OPERATOR_MODE, USAGE_MODE, SETTINGS, POSITION_INFO, ERROR_MESSAGE, BOX_INFO, MAX_DOT, SPRITE_COLOR } from '../../Constants';
import { SpritePool } from '../../utils/SpritePool';
import { PowerZoneManager } from './PowerZoneManager';
import { SoundManager } from '../../utils/SoundManager';
import DotVO from '../../VO/DotVO';

import img from './images/placeholder.gif';

type PropsType = {
  addDot: PropTypes.func.isRequired,
  addMultipleDots: PropTypes.func.isRequired,
  rezoneDot: PropTypes.func.isRequired,
  removeDot: PropTypes.func.isRequired,
  removeMultipleDots: PropTypes.func.isRequired,
  setDivisionResult: PropTypes.func.isRequired,
  activateMagicWand: PropTypes.func.isRequired,
  startActivityFunc: PropTypes.func.isRequired,
  startActivityDoneFunc: PropTypes.func.isRequired,
  positivePowerZoneDots: Array<DotVO>,
  negativePowerZoneDots: Array<DotVO>,
  positiveDividerDots: Array<mixed>,
  negativeDividerDots: Array<mixed>,
  positiveDividerResult: Array<number>,
  negativeDividerResult: Array<number>,
  base: Array<number | string>,
  operator_mode: string,
  usage_mode: string,
  placeValueOn: boolean,
  cdnBaseUrl: string,
  totalZoneCount: number,
  magicWandIsActive: boolean,
  startActivity: boolean,
  activityStarted: boolean,
  operandA: string,
  operandB: string,
  error: PropTypes.func.isRequired,
  displayUserMessage: PropTypes.func.isRequired,
  userMessage: string, // eslint-disable-line react/no-unused-prop-types
  muted: boolean,
  wantedResult: {
    positiveDots: Array<number>, // eslint-disable-line react/no-unused-prop-types
    negativeDots: Array<number>, // eslint-disable-line react/no-unused-prop-types
    positiveDivider: Array<number>, // eslint-disable-line react/no-unused-prop-types
    negativeDivider: Array<number> // eslint-disable-line react/no-unused-prop-types
  },
  title: string,
  guideFeedback: string,
  guideReminder: string
};

class CanvasPIXI extends Component<void, PropsType, void> {

  // eslint-disable-next-line no-unused-vars
  static onAssetsError(loader: window.PIXI.loader) {
    // TODO Do something
    // console.log('onAssetsError', loader);
    // loader.onStart = null;
  }

  // remove last char in the operand if it's a '-' or a '+'
  static removeTrailingSign(str: string): string {
    let string = str;
    if (string.lastIndexOf('-') === string.length - 1 || string.lastIndexOf('+') === string.length - 1) {
      string = string.substring(0, string.length - 1);
    }
    return string;
  }

  constructor(props: PropsType) {
    super(props);
    // to differenciate between WegGL and Canvas.
    this.isWebGL = false;
    // Is there negative dots in this scenario
    this.negativePresent = (props.operator_mode === OPERATOR_MODE.SUBTRACT
      || props.operator_mode === OPERATOR_MODE.DIVIDE
      || props.base[1] === BASE.BASE_X);
    this.maxDotsByZone = this.negativePresent ? MAX_DOT.MIX : MAX_DOT.ONLY_POSITIVE;
    // to accomodate for pixel padding in TexturePacker
    window.PIXI.settings.SCALE_MODE = window.PIXI.SCALE_MODES.NEAREST;
  }

  componentDidMount() {
    // console.log('componentDidMount', this.state, this.props);
    // PIXI creation options
    const options = {
      view: this.canvas,
      transparent: true,
      antialias: true,
      preserveDrawingBuffer: false,
      clearBeforeRender: true,
      resolution: window.devicePixelRatio,
      autoResize: true,
    };
    // this PIXI creation options is appart, and I named it so I know what it is.
    const preventWebGL = false;
    // Need a greater height for division to put the divider drag object.
    this.app = new window.PIXI.Application(
        SETTINGS.GAME_WIDTH,
        (this.props.operator_mode === OPERATOR_MODE.DIVIDE ?
        SETTINGS.GAME_HEIGHT_DIVIDE : SETTINGS.GAME_HEIGHT),
        options,
        preventWebGL);
    this.stage = this.app.stage;
    this.renderer = this.app.renderer;
    this.soundManager = new SoundManager(this.props.cdnBaseUrl, this.props.muted);
    this.powerZoneManager = new PowerZoneManager(
            this.props.addDot,
            this.props.removeDot,
            this.props.addMultipleDots,
            this.props.removeMultipleDots,
            this.props.rezoneDot,
            this.props.setDivisionResult,
            this.props.displayUserMessage,
            this.soundManager,
            this.props.wantedResult,
            this.props.guideReminder,
            this.props.guideFeedback
        );
    this.stage.addChild(this.powerZoneManager);
    this.isWebGL = this.renderer instanceof window.PIXI.WebGLRenderer;
    this.boundOnResize = this.resize.bind(this);
    window.addEventListener('resize', this.boundOnResize);

    // Load the spritesheet based on screen size
    this.loaderName = 'machineAssets';
    this.loader = new window.PIXI.loaders.Loader(this.props.cdnBaseUrl);
    if (window.devicePixelRatio >= 1.50) {
      this.loader.add(this.loaderName, '/images/machine@4x.json');
    } else if (window.devicePixelRatio >= 1.25) {
      this.loader.add(this.loaderName, '/images/machine@3x.json');
    } else if (window.devicePixelRatio >= 1) {
      this.loader.add(this.loaderName, '/images/machine@2x.json');
    } else {
      this.loader.add(this.loaderName, '/images/machine@1x.json');
    }
    this.loader.once('complete', this.onAssetsLoaded.bind(this));
    this.loader.once('error', CanvasPIXI.onAssetsError());
    this.loader.load();
    this.resize();
  }

  shouldComponentUpdate(nextProps: PropsType): boolean {
    // console.log('shouldComponentUpdate', nextProps);
    // reset the machine
    if (this.props.activityStarted === true && nextProps.activityStarted === false) {
      this.powerZoneManager.reset();
    }
    // Some action can be queued after the popup is closed, check if it's the case.
    this.powerZoneManager.checkPendingAction(nextProps.userMessage);
    this.checkBaseChange(nextProps);
    // Apply the new props
    this.props = nextProps;
    this.powerZoneManager.removeDotsFromStateChange(
      this.props.positivePowerZoneDots,
      this.props.negativePowerZoneDots);
    this.powerZoneManager.addDotsFromStateChange(
      this.props.positivePowerZoneDots,
      this.props.negativePowerZoneDots);
    if (this.props.operator_mode === OPERATOR_MODE.DIVIDE) {
      this.powerZoneManager.adjustDividerDotFromStateChange(
        this.props.positiveDividerDots,
        this.props.negativeDividerDots);
      this.powerZoneManager.populateDivideResult(
        this.props.positiveDividerResult,
        this.props.negativeDividerResult);
    }
    this.powerZoneManager.checkInstability();
    this.powerZoneManager.setZoneTextAndAlphaStatus();
    this.checkMachineStateValue();
    if (this.props.usage_mode === USAGE_MODE.EXERCISE) {
      this.powerZoneManager.checkResult();
    }
    this.soundManager.muted = this.props.muted;
    return false;
  }

  componentWillUnmount() {
    TweenMax.killAll(false, true, true, true);
    if (this.soundManager) {
      this.soundManager.destroy();
    }
    this.soundManager = null;
    if (this.spritePool) {
      this.spritePool.destroy();
    }
    this.spritePool = null;
    if (this.powerZoneManager) {
      this.powerZoneManager.destroy();
    }
    if (this.loader) {
      this.loader.destroy();
    }
    // eslint-disable-next-line guard-for-in, no-restricted-syntax
    for (const key in this.textures) {
      this.textures[key].destroy(true);
    }
    const hiddenTextureName = `${this.loaderName}_image`;
    if (window.PIXI.utils.TextureCache[hiddenTextureName]) {
      window.PIXI.utils.TextureCache[hiddenTextureName].destroy(true);
    }
    if (this.app) {
      this.app.destroy(true);
    }
    window.removeEventListener('resize', this.boundOnResize);
  }

  onVisibilityChange(isVisible: boolean) {
    if (this.app) {
      if (isVisible) {
        this.app.ticker.start();
        if (this.renderer) {
          this.renderer.currentRenderer.start();
          // eslint-disable-next-line max-len
          // this.state.renderer.plugins.interaction = new PIXI.interaction.InteractionManager(this.state.renderer)
          // console.log(`Element ${this.props.title} is visible`);
        }
      } else {
        this.app.ticker.stop();
        if (this.renderer) {
          this.renderer.currentRenderer.stop();
          // this.state.renderer.plugins.interaction.destroy();
          // console.log(`Element ${this.props.title} is hidden`);
        }
      }
    } else if (isVisible === false) {
      setTimeout(this.onVisibilityChange.bind(this, isVisible), 500);
    }
  }

  onAssetsLoaded(loader: window.PIXI.loader) {
    if (loader.resources.machineAssets.error === null) {
      this.textures = loader.resources.machineAssets.textures;
      this.spritePool = new SpritePool(this.textures);
      this.powerZoneManager.init(
                this.textures,
                this.spritePool,
                this.props.base,
                this.props.usage_mode,
                this.props.operator_mode,
                this.props.totalZoneCount,
                this.props.placeValueOn,
                this.negativePresent,
            );
      this.powerZoneManager.createZones();
      this.powerZoneManager.createLeftmostTestZone();
      this.resize();
      this.powerZoneManager.start();
      this.canvasDiv.style.visibility = 'visible';
      this.canvasDiv.style.height = this.props.operator_mode === OPERATOR_MODE.DIVIDE ? `${SETTINGS.GAME_HEIGHT_DIVIDE}px` : `${SETTINGS.GAME_HEIGHT}px`;
      this.canvasDiv.style.overflow = 'visible';
      this.placeHolder.style.display = 'none';
      if (this.props.usage_mode === USAGE_MODE.EXERCISE) {
        this.props.startActivityFunc();
      }
    }
  }

  getDot(zone: number, isPositive: boolean, color: string = SPRITE_COLOR.RED): DotVO {
        // console.log('getDot', zone, isPositive, color);
    const dot = new DotVO();
    dot.x = randomFromTo(
      POSITION_INFO.DOT_RAYON,
      BOX_INFO.BOX_WIDTH - POSITION_INFO.DOT_RAYON
    );
    if (this.negativePresent) {
      dot.y = randomFromTo(
        POSITION_INFO.DOT_RAYON,
        BOX_INFO.HALF_BOX_HEIGHT - POSITION_INFO.DOT_RAYON
      );
    } else {
      dot.y = randomFromTo(
        POSITION_INFO.DOT_RAYON,
        BOX_INFO.BOX_HEIGHT - POSITION_INFO.DOT_RAYON
      );
    }
    dot.zoneId = zone;
    dot.isPositive = isPositive;
    dot.color = color;
    return dot;
  }

  checkMachineStateValue() {
    // console.log('checkMachineStateValue', this.props.placeValueOn);
    this.powerZoneManager.setValueTextAlpha(this.props.placeValueOn);
    if (this.props.magicWandIsActive) {
      this.powerZoneManager.magicWand();
      /* var img = new Image();
       img.src = this.state.renderer.view.toDataURL();
       document.body.appendChild(img);*/
      this.props.activateMagicWand(false);
    } else if (this.props.startActivity) {
      // ************************************
      // ACTIVITY START
      // ************************************
      // We should never get a activity start in Freeplay, just in case.
      if (this.props.usage_mode !== USAGE_MODE.FREEPLAY) {
        let dotsPerZoneA: Array<number>;
        let dotsPerZoneB: Array<number>;
        // if there is no operand B value and one is displayed
        // (OPERATOR_MODE.DISPLAY hide operand B)
        if (this.props.operator_mode !== OPERATOR_MODE.DISPLAY &&
          this.props.operandB.length === 0) {
          this.soundManager.playSound(SoundManager.GO_INVALID);
          this.props.error(ERROR_MESSAGE.INVALID_ENTRY);
          return;
        }
        if (this.props.operandA.indexOf('|') !== -1 || this.props.operandB.indexOf('|') !== -1) {
          // advanced mode, if one side is split with |, split both side
          const populatedArrays = this.populateDotPerZoneArrayAdvancedMode();
          dotsPerZoneA = populatedArrays.dotsPerZoneA;
          dotsPerZoneB = populatedArrays.dotsPerZoneB;
        } else if (this.props.base[1] !== BASE.BASE_X) {
          // normal mode, split
          const populatedArrays = this.populateDotPerZoneArrayNormalMode();
          dotsPerZoneA = populatedArrays.dotsPerZoneA;
          dotsPerZoneB = populatedArrays.dotsPerZoneB;
        } else {
          // Base X parse operand
          const populatedArrays = this.populateDotPerZoneArrayBaseX();
          dotsPerZoneA = populatedArrays.dotsPerZoneA;
          dotsPerZoneB = populatedArrays.dotsPerZoneB;
          // validate that the sum of the value isn't 0
          // eslint-disable-next-line max-len
          if (dotsPerZoneA.reduce((acc: number, val: number): number => acc + Math.abs(val), 0) === 0) {
            this.soundManager.playSound(SoundManager.GO_INVALID);
            this.props.error(ERROR_MESSAGE.INVALID_ENTRY);
            return;
          }
          // eslint-disable-next-line max-len
          if (dotsPerZoneB.reduce((acc: number, val: number): number => acc + Math.abs(val), 0) === 0) {
            this.soundManager.playSound(SoundManager.GO_INVALID);
            this.props.error(ERROR_MESSAGE.INVALID_ENTRY);
            return;
          }
        }
        if (this.props.base[1] !== BASE.BASE_X) {
          // Has I build the algebra array just above, they are already in the right order
          dotsPerZoneA.reverse();
          dotsPerZoneB.reverse();
        }

        // Create dots and send info to the store
        switch (this.props.operator_mode) {
          case OPERATOR_MODE.DISPLAY:
            this.createDisplayDots(dotsPerZoneA);
            break;
          case OPERATOR_MODE.ADD:
            this.createAddDots(dotsPerZoneA, dotsPerZoneB);
            break;
          case OPERATOR_MODE.MULTIPLY:
            this.createMultiplyDots(dotsPerZoneA);
            break;
          case OPERATOR_MODE.SUBTRACT:
            if (dotsPerZoneA.length !== 0 && dotsPerZoneB.length !== 0) {
              this.createSubtractDots(dotsPerZoneA, dotsPerZoneA);
            } else {
              this.soundManager.playSound(SoundManager.GO_INVALID);
              this.props.error(ERROR_MESSAGE.INVALID_ENTRY);
              return;
            }
            break;
          case OPERATOR_MODE.DIVIDE:
            if (dotsPerZoneA.length !== 0 && dotsPerZoneB.length !== 0) {
              this.createDivideDots(dotsPerZoneA, dotsPerZoneB);
            } else {
              this.soundManager.playSound(SoundManager.GO_INVALID);
              this.props.error(ERROR_MESSAGE.INVALID_ENTRY);
              return;
            }
            this.powerZoneManager.showDividerAndResult();
            break;
          default:
            break;
        }
        this.powerZoneManager.isInteractive = true;
      }
    }
  }
  // eslint-disable-next-line max-len
  populateDotPerZoneArrayAdvancedMode(): {dotsPerZoneA: Array<number>, dotsPerZoneB: Array<number>} {
    let dotsPerZoneAString: Array<string>;
    let dotsPerZoneBString: Array<string>;
    if (this.props.operandA.indexOf('|') !== -1) {
      dotsPerZoneAString = this.props.operandA.split('|');
    } else {
      dotsPerZoneAString = this.props.operandA.split('');
    }
    // Verify that we don't have a single minus sign in a zone
    dotsPerZoneAString.forEach((entry: string) => {
      if (entry === '-') {
        dotsPerZoneAString[dotsPerZoneAString.indexOf(entry)] = '0';
      }
    });
    if (this.props.operator_mode !== OPERATOR_MODE.MULTIPLY) {
      // don't split multiplication operand B
      if (this.props.operandB.indexOf('|') !== -1) {
        dotsPerZoneBString = this.props.operandB.split('|');
      } else {
        dotsPerZoneBString = this.props.operandB.split('');
      }
    } else {
      // there is no | possible in operandB in division,
      // but I need it as an array anyway, so split with impossible character.
      dotsPerZoneBString = this.props.operandB.split('|');
    }
    // Verify that we don't have a single minus sign in a zone
    dotsPerZoneBString.forEach((entry: string) => {
      if (entry === '-') {
        dotsPerZoneBString[dotsPerZoneBString.indexOf(entry)] = '0';
      }
    });
    const dotsPerZoneA: Array<number> = dotsPerZoneAString.map((x: string): number => {
      return parseInt(x, 10);
    });
    const dotsPerZoneB: Array<number> = dotsPerZoneBString.map((x: string): number => {
      return parseInt(x, 10);
    });
    return { dotsPerZoneA, dotsPerZoneB };
  }

  populateDotPerZoneArrayNormalMode(): {dotsPerZoneA: Array<number>, dotsPerZoneB: Array<number>} {
    const dotsPerZoneAString: Array<string> = this.props.operandA.split('');
    let dotsPerZoneBString: Array<string>;
    if (this.props.operator_mode === OPERATOR_MODE.DISPLAY) {
      dotsPerZoneBString = [];
    } else {
      dotsPerZoneBString = this.props.operandB.split('');
    }
    // If the value start with a minus sign, minus all the value
    if (dotsPerZoneAString[0] === '-') {
      dotsPerZoneAString.splice(0, 1);
      for (let i = 0; i < dotsPerZoneAString.length; i += 1) {
        dotsPerZoneAString[i] = `-${dotsPerZoneAString[i]}`;
      }
    }
    if (dotsPerZoneBString[0] === '-') {
      dotsPerZoneBString.splice(0, 1);
      for (let i = 0; i < dotsPerZoneBString.length; i += 1) {
        dotsPerZoneBString[i] = `-${dotsPerZoneBString[i]}`;
      }
    }
    const dotsPerZoneA: Array<number> = dotsPerZoneAString.map((x: string): number => {
      return parseInt(x, 10);
    });
    const dotsPerZoneB: Array<number> = dotsPerZoneBString.map((x: string): number => {
      return parseInt(x, 10);
    });
    return { dotsPerZoneA, dotsPerZoneB };
  }

  populateDotPerZoneArrayBaseX(): {dotsPerZoneA: Array<number>, dotsPerZoneB: Array<number>} {
    const dotsPerZoneAString: Array<string> = new Array(this.props.totalZoneCount);
    const dotsPerZoneBString: Array<string> = new Array(this.props.totalZoneCount);
    for (let i = 0; i < this.props.totalZoneCount; i += 1) {
      dotsPerZoneAString[i] = '0';
      dotsPerZoneBString[i] = '0';
    }

    let cleanedOperandA: string = superscriptToNormal(this.props.operandA);
    let cleanedOperandB: string = superscriptToNormal(this.props.operandB);
    let indices: Array<number> = [];
    for (let i = 0; i < cleanedOperandA.length; i += 1) {
      if (cleanedOperandA[i] === '-') indices.push(i);
    }
    let added = 0;
    indices.forEach((indice: number) => {
      cleanedOperandA = replaceAt(cleanedOperandA, indice + added, '+-');
      added += 1;
    });
    indices = [];
    for (let i = 0; i < cleanedOperandB.length; i += 1) {
      if (cleanedOperandB[i] === '-') indices.push(i);
    }
    added = 0;
    indices.forEach((indice: number) => {
      cleanedOperandB = replaceAt(cleanedOperandB, indice + added, '+-');
      added += 1;
    });
    // console.log(cleandedOperandA, cleandedOperandB);
    const splitZoneA: Array<string> = cleanedOperandA.split('+');
    const splitZoneB: Array<string> = cleanedOperandB.split('+');
    // console.log(splitZoneA, splitZoneB);
    splitZoneA.forEach((val: string) => {
      let value: string = val;
      let actualValue: number;
      if (value === '-' || value === '+') { // in case of entries like -2-, where the second - will be split in a zone value
        value = '0';
      }
      const xIndex = value.indexOf('x');
      if (xIndex === -1) {
        // No x in the zone value, this is an number only
        actualValue = Number(dotsPerZoneAString[0]);
        dotsPerZoneAString[0] = (actualValue + value).toString();
      } else {
        let pos: number = 0;
        if (isNaN(value[xIndex + 1])) {
          // x only, no exponent
          pos = 1;
        } else {
          if (Number(value[xIndex + 1]) > this.props.totalZoneCount - 1) {
            // the exponent is higher than the amount of zone
            this.soundManager.playSound(SoundManager.GO_INVALID);
            this.props.error(ERROR_MESSAGE.INVALID_ENTRY);
            return;
          }
          pos = Number(value[xIndex + 1]);
        }
        if (xIndex === 0) {
          // positive x only
          actualValue = Number(dotsPerZoneAString[pos]);
          dotsPerZoneAString[pos] = (actualValue += 1).toString();
        } else if (xIndex === 1 && value[0] === '-') {
          // negative x only
          actualValue = Number(dotsPerZoneAString[pos]);
          dotsPerZoneAString[pos] = (actualValue -= 1).toString();
        } else {
          actualValue = Number(dotsPerZoneAString[pos]);
          dotsPerZoneAString[pos] = (actualValue + Number(value.substring(0, xIndex))).toString();
          // dotsPerZoneA[pos] += value.substring(0, xIndex);
        }
      }
    });
    splitZoneB.forEach((val: string) => {
      let value: string = val;
      let actualValue: number;
      if (value === '-' || value === '+') { // in case of entries like -2-, where the second - will be split in a zone value
        value = '0';
      }
      const xIndex = value.indexOf('x');
      // No x in the zone value, this is an number only
      if (xIndex === -1) {
        actualValue = Number(dotsPerZoneBString[0]);
        dotsPerZoneBString[0] = (actualValue + value).toString();
      } else {
        let pos: number = 0;
        if (isNaN(value[xIndex + 1])) {
          // x only, no exponent
          pos = 1;
        } else {
          if (Number(value[xIndex + 1]) > this.props.totalZoneCount - 1) {
            // the exponent is higher than the amount of zone
            this.soundManager.playSound(SoundManager.GO_INVALID);
            this.props.error(ERROR_MESSAGE.INVALID_ENTRY);
            return;
          }
          pos = Number(value[xIndex + 1]);
        }
        if (xIndex === 0) {
          // positive x only
          actualValue = Number(dotsPerZoneBString[pos]);
          dotsPerZoneBString[pos] = (actualValue += 1).toString();
          // dotsPerZoneB[pos] += 1;
        } else if (xIndex === 1 && value[0] === '-') {
          // negative x only
          actualValue = Number(dotsPerZoneBString[pos]);
          dotsPerZoneBString[pos] = (actualValue -= 1).toString();
          // dotsPerZoneB[pos] -= 1;
        } else {
          actualValue = Number(dotsPerZoneBString[pos]);
          dotsPerZoneBString[pos] = (actualValue + Number(value.substring(0, xIndex))).toString();
          // dotsPerZoneB[pos] += value.substring(0, xIndex);
        }
      }
    });
    const dotsPerZoneA: Array<number> = dotsPerZoneAString.map((x: string): number => {
      return parseInt(x, 10);
    });
    const dotsPerZoneB: Array<number> = dotsPerZoneBString.map((x: string): number => {
      return parseInt(x, 10);
    });
    return { dotsPerZoneA, dotsPerZoneB };
  }

  createDisplayDots(dotsPerZoneA: Array<number>) {
    let totalDot = 0;
    const dotsPos: Array<DotVO> = [];
    for (let i = 0; i < dotsPerZoneA.length; i += 1) {
      // $FlowIgnore
      totalDot += dotsPerZoneA[i] * Math.pow(this.props.base[1], i);
      for (let j = 0; j < Number(dotsPerZoneA[i]); j += 1) {
        dotsPos.push(this.getDot(i, true));
      }
    }
    this.soundManager.playSound(SoundManager.GO_SUCCESS);
    this.props.startActivityDoneFunc(dotsPos, totalDot);
  }

  createAddDots(dotsPerZoneA: Array<number>, dotsPerZoneB: Array<number>) {
    const dotsPos: Array<DotVO> = [];
    makeBothArrayTheSameLength(dotsPerZoneA, dotsPerZoneB);
    for (let i: number = 0; i < dotsPerZoneA.length; i += 1) {
      let j: number = 0;
      for (j = 0; j < Math.abs(Number(dotsPerZoneA[i])); j += 1) {
        dotsPos.push(this.getDot(i, String(dotsPerZoneA[i]).indexOf('-') === -1, SPRITE_COLOR.RED));
      }
      for (j = 0; j < Math.abs(Number(dotsPerZoneB[i])); j += 1) {
        dotsPos.push(this.getDot(i, String(dotsPerZoneB[i]).indexOf('-') === -1, SPRITE_COLOR.BLUE));
      }
    }
    if (this.props.base[1] !== BASE.BASE_X) {
      const operandAValue = this.calculateOperandRealValue(dotsPerZoneA);
      const operandBValue = this.calculateOperandRealValue(dotsPerZoneB);
      this.soundManager.playSound(SoundManager.GO_SUCCESS);
      this.props.startActivityDoneFunc(dotsPos, operandAValue, operandBValue);
    } else {
      // remove last char in the operand if it's a - or a +
      const operandAValue = CanvasPIXI.removeTrailingSign(this.props.operandA);
      const operandBValue = CanvasPIXI.removeTrailingSign(this.props.operandB);
      this.soundManager.playSound(SoundManager.GO_SUCCESS);
      this.props.startActivityDoneFunc(dotsPos, operandAValue, operandBValue);
    }
  }

  createMultiplyDots(dotsPerZoneA: Array<number>) {
    const dotsPos: Array<DotVO> = [];
    for (let i = 0; i < dotsPerZoneA.length; i += 1) {
      let totalDotInZone = 0;
      totalDotInZone = Number(dotsPerZoneA[i]) * Number(this.props.operandB);
      for (let j = 0; j < Math.abs(totalDotInZone); j += 1) {
        dotsPos.push(this.getDot(i, String(dotsPerZoneA[i]).indexOf('-') === -1));
      }
    }
    if (this.props.base[1] !== BASE.BASE_X) {
      const operandAValue = this.calculateOperandRealValue(dotsPerZoneA);
      this.soundManager.playSound(SoundManager.GO_SUCCESS);
      this.props.startActivityDoneFunc(dotsPos, operandAValue);
    } else {
      // remove last char in the operand if it's a - or a +
      const operandAValue = CanvasPIXI.removeTrailingSign(this.props.operandA);
      this.soundManager.playSound(SoundManager.GO_SUCCESS);
      this.props.startActivityDoneFunc(dotsPos, operandAValue);
    }
  }

  createSubtractDots(dotsPerZoneA: Array<number>, dotsPerZoneB: Array<number>) {
    const dotsPos: Array<DotVO> = [];
    makeBothArrayTheSameLength(dotsPerZoneA, dotsPerZoneB);
    for (let i = 0; i < dotsPerZoneA.length; i += 1) {
      let j = 0;
      for (j = 0; j < Math.abs(Number(dotsPerZoneA[i])); j += 1) {
        dotsPos.push(this.getDot(i, String(dotsPerZoneA[i]).indexOf('-') === -1));
      }
      for (j = 0; j < Math.abs(Number(dotsPerZoneB[i])); j += 1) {
        dotsPos.push(this.getDot(i, String(dotsPerZoneB[i]).indexOf('-') !== -1, SPRITE_COLOR.BLUE));
      }
    }
    if (this.props.base[1] !== BASE.BASE_X) {
      const operandAValue = this.calculateOperandRealValue(dotsPerZoneA);
      const operandBValue = this.calculateOperandRealValue(dotsPerZoneB);
      this.soundManager.playSound(SoundManager.GO_SUCCESS);
      this.props.startActivityDoneFunc(dotsPos, operandAValue, operandBValue);
    } else {
      // remove last char in the operand if it's a - or a +
      const operandAValue = CanvasPIXI.removeTrailingSign(this.props.operandA);
      const operandBValue = CanvasPIXI.removeTrailingSign(this.props.operandB);
      this.soundManager.playSound(SoundManager.GO_SUCCESS);
      this.props.startActivityDoneFunc(dotsPos, operandAValue, operandBValue);
    }
  }

  createDivideDots(dotsPerZoneA: Array<number>, dotsPerZoneB: Array<number>) {
    const dotsPos: Array<DotVO> = [];
    const dividePos: Array<DotVO> = [];
    makeBothArrayTheSameLength(dotsPerZoneA, dotsPerZoneB);
    for (let i = 0; i < dotsPerZoneA.length; i += 1) {
      let j = 0;
      for (j = 0; j < Math.abs(Number(dotsPerZoneA[i])); j += 1) {
        dotsPos.push(this.getDot(i, String(dotsPerZoneA[i]).indexOf('-') === -1));
      }
      for (j = 0; j < Math.abs(Number(dotsPerZoneB[i])); j += 1) {
        dividePos.push(this.getDot(i, String(dotsPerZoneB[i]).indexOf('-') === -1));
      }
    }
    if (this.props.base[1] !== BASE.BASE_X) {
      const operandAValue = this.calculateOperandRealValue(dotsPerZoneA);
      const operandBValue = this.calculateOperandRealValue(dotsPerZoneB);
      this.soundManager.playSound(SoundManager.GO_SUCCESS);
      this.props.startActivityDoneFunc(dotsPos, operandAValue, operandBValue, dividePos);
    } else {
      // remove last char in the operand if it's a - or a +
      const operandAValue = CanvasPIXI.removeTrailingSign(this.props.operandA);
      const operandBValue = CanvasPIXI.removeTrailingSign(this.props.operandB);
      this.soundManager.playSound(SoundManager.GO_SUCCESS);
      this.props.startActivityDoneFunc(dotsPos, operandAValue, operandBValue, dividePos);
    }
  }

  checkBaseChange(nextProps: PropsType) {
    if (this.props.base !== nextProps.base) {
      this.powerZoneManager.doBaseChange(nextProps.base, nextProps.placeValueOn);
    }
  }

  resize() {
    // $FlowIgnore:
    const w = Math.min(window.innerWidth, this.canvas.parentElement.offsetWidth);
    const ratio = w / SETTINGS.GAME_WIDTH;
    this.stage.scale.x = this.stage.scale.y = ratio;
    this.renderer.resize(
      Math.ceil(SETTINGS.GAME_WIDTH * ratio),
      Math.ceil((this.props.operator_mode === OPERATOR_MODE.DIVIDE ?
          SETTINGS.GAME_HEIGHT_DIVIDE : SETTINGS.GAME_HEIGHT) * ratio));
    if (this.placeHolder.style.visibility !== 'hidden') {
      this.placeHolder.style.height = `${Math.ceil((this.props.operator_mode === OPERATOR_MODE.DIVIDE ?
          SETTINGS.GAME_HEIGHT_DIVIDE : SETTINGS.GAME_HEIGHT) * ratio)}px`;
    }
    // console.log('resize', this.placeHolder.style.height);
  }

  calculateOperandRealValue(arr: Array<number>): number {
    let value = 0;
    for (let i = 0; i < arr.length; i += 1) {
      // $FlowIgnore
      value += arr[i] * Math.pow(this.props.base[1], i);
    }
    return value;
  }

  powerZoneManager: PowerZoneManager;
  soundManager: SoundManager;
  canvas: Element;
  loaderName: string;
  loader: window.PIXI.loaders;
  isWebGL: boolean;
  negativePresent: boolean;
  maxDotsByZone: number;
  app: window.PIXI.app;
  stage: window.PIXI.stage;
  textures: { string: window.PIXI.Texture };
  spritePool: SpritePool;
  boundOnResize: () => void;
  placeHolder: HTMLImageElement;
  canvasDiv: HTMLDivElement;
  renderer: window.PIXI.renderer;

  render(): React$Element<*> {
    return (
      <div>
        <VisibilitySensor
          onChange={this.onVisibilityChange.bind(this)}
          partialVisibility={true}
          scrollCheck={true}
          scrollDelay={250}
          intervalCheck={true}
          intervalDelay={8000}
        >
          <div>
            <div
              ref={(canvasDiv: HTMLDivElement) => { this.canvasDiv = canvasDiv; }}
              style={{
                visibility: 'hidden',
                height: '1px',
                overflow: 'hidden',
              }}
            >
              <canvas
                ref={(canvas: HTMLCanvasElement) => { this.canvas = canvas; }}
              />
            </div>
            <img
              ref={(placeholder: HTMLImageElement) => { this.placeHolder = placeholder; }}
              src={img}
              role="presentation"
              style={{
                width: '100%',
                height: '1px',
              }}
            />
          </div>
        </VisibilitySensor>
      </div>
    );
  }
}

export default CanvasPIXI;
