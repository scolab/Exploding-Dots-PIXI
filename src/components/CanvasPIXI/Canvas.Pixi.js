import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { TweenMax } from 'gsap';
import { randomFromTo } from '../../utils/MathUtils';
import { makeBothArrayTheSameLength } from '../../utils/ArrayUtils';
import { superscriptToNormal, replaceAt } from '../../utils/StringUtils';
import { BASE, OPERATOR_MODE, USAGE_MODE, SETTINGS, POSITION_INFO, ERROR_MESSAGE, BOX_INFO, MAX_DOT, SPRITE_COLOR } from '../../Constants';
import { SpritePool } from '../../utils/SpritePool';
import { PowerZoneManager } from './PowerZoneManager';
import { SoundManager } from '../../utils/SoundManager';

class CanvasPIXI extends Component {
  static propTypes = {
    addDot: PropTypes.func.isRequired,
    addMultipleDots: PropTypes.func.isRequired,
    rezoneDot: PropTypes.func.isRequired,
    removeDot: PropTypes.func.isRequired,
    removeMultipleDots: PropTypes.func.isRequired,
    setDivisionResult: PropTypes.func.isRequired,
    activateMagicWand: PropTypes.func.isRequired,
    startActivityFunc: PropTypes.func.isRequired,
    startActivityDoneFunc: PropTypes.func.isRequired,
    positivePowerZoneDots: PropTypes.arrayOf(React.PropTypes.objectOf(React.PropTypes.shape({
      x: PropTypes.number.isRequired, // eslint-disable-line react/no-unused-prop-types
      y: PropTypes.number.isRequired, // eslint-disable-line react/no-unused-prop-types
      powerZone: PropTypes.number.isRequired, // eslint-disable-line react/no-unused-prop-types
      id: PropTypes.string.isRequired, // eslint-disable-line react/no-unused-prop-types
      isPositive: PropTypes.bool.isRequired, // eslint-disable-line react/no-unused-prop-types
    }))).isRequired,
    negativePowerZoneDots: PropTypes.arrayOf(React.PropTypes.objectOf(React.PropTypes.shape({
      x: PropTypes.number.isRequired, // eslint-disable-line react/no-unused-prop-types
      y: PropTypes.number.isRequired, // eslint-disable-line react/no-unused-prop-types
      powerZone: PropTypes.number.isRequired, // eslint-disable-line react/no-unused-prop-types
      id: PropTypes.string.isRequired, // eslint-disable-line react/no-unused-prop-types
      isPositive: PropTypes.bool.isRequired, // eslint-disable-line react/no-unused-prop-types
    }))).isRequired,
    positiveDividerDots: PropTypes.arrayOf(React.PropTypes.objectOf(React.PropTypes.shape({
      powerZone: PropTypes.number.isRequired, // eslint-disable-line react/no-unused-prop-types
      id: PropTypes.string.isRequired, // eslint-disable-line react/no-unused-prop-types
      isPositive: PropTypes.bool.isRequired, // eslint-disable-line react/no-unused-prop-types
    }))).isRequired,
    negativeDividerDots: PropTypes.arrayOf(React.PropTypes.objectOf(React.PropTypes.shape({
      powerZone: PropTypes.number.isRequired, // eslint-disable-line react/no-unused-prop-types
      id: PropTypes.string.isRequired, // eslint-disable-line react/no-unused-prop-types
      isPositive: PropTypes.bool.isRequired, // eslint-disable-line react/no-unused-prop-types
    }))).isRequired,
    positiveDividerResult: PropTypes.array.isRequired,
    negativeDividerResult: PropTypes.array.isRequired,
    base: PropTypes.array.isRequired,
    operator_mode: PropTypes.oneOf([
      OPERATOR_MODE.DISPLAY,
      OPERATOR_MODE.ADD,
      OPERATOR_MODE.SUBTRACT,
      OPERATOR_MODE.MULTIPLY,
      OPERATOR_MODE.DIVIDE]).isRequired,
    usage_mode: PropTypes.oneOf([
      USAGE_MODE.FREEPLAY,
      USAGE_MODE.OPERATION,
      USAGE_MODE.EXERCISE]),
    placeValueOn: PropTypes.bool.isRequired,
    cdnBaseUrl: PropTypes.string.isRequired,
    totalZoneCount: PropTypes.number.isRequired,
    magicWandIsActive: PropTypes.bool.isRequired,
    startActivity: PropTypes.bool.isRequired,
    activityStarted: PropTypes.bool.isRequired,
    operandA: PropTypes.string.isRequired,
    operandB: PropTypes.string.isRequired,
    error: PropTypes.func.isRequired,
    displayUserMessage: PropTypes.func.isRequired,
    userMessage: PropTypes.string.isRequired, // eslint-disable-line react/no-unused-prop-types
    muted: PropTypes.bool.isRequired,
    wantedResult: PropTypes.object.isRequired,
  };

  // eslint-disable-next-line no-unused-vars
  static onAssetsError(loader) {
    // TODO Do something
    // console.log('onAssetsError', loader);
    // loader.onStart = null;
  }

  static removeTrailingSign(str) {
    let string = str;
    if (string.lastIndexOf('-') === string.length - 1 || string.lastIndexOf('+') === string.length - 1) {
      string = string.substring(0, string.length - 1);
    }
    return string;
  }

  constructor(props) {
    super(props);
    this.state = {};
    this.state.isWebGL = false;
    this.state.negativePresent = (props.operator_mode === OPERATOR_MODE.SUBTRACT
    || props.operator_mode === OPERATOR_MODE.DIVIDE
    || props.base[1] === BASE.BASE_X);
    this.state.maxDotsByZone = this.state.negativePresent ? MAX_DOT.MIX : MAX_DOT.ONLY_POSITIVE;
    this.powerZoneManager = null;
        // to accomodate for pixel padding in TexturePacker
    PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;
  }

  componentDidMount() {
        // console.log('componentDidMount', this.state, this.props);
    const options = {
      view: this.canvas,
      transparent: true,
      antialias: true,
      preserveDrawingBuffer: false,
      resolution: window.devicePixelRatio,
      autoResize: true,
    };

    const preventWebGL = false;
    this.state.app = new PIXI.Application(
        SETTINGS.GAME_WIDTH,
        (this.props.operator_mode === OPERATOR_MODE.DIVIDE ?
        SETTINGS.GAME_HEIGHT_DIVIDE : SETTINGS.GAME_HEIGHT),
        options,
        preventWebGL);
    this.state.stage = this.state.app.stage;
    this.state.renderer = this.state.app.renderer;
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
            this.props.wantedResult
        );
    this.state.stage.addChild(this.powerZoneManager);
    this.state.isWebGL = this.state.renderer instanceof PIXI.WebGLRenderer;
    window.addEventListener('resize', this.resize.bind(this));

    this.loaderName = 'machineAssets';
    this.loader = new PIXI.loaders.Loader(this.props.cdnBaseUrl);
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
  }

  shouldComponentUpdate(nextProps) {
    // console.log('shouldComponentUpdate', nextProps);
    if (this.props.activityStarted === true && nextProps.activityStarted === false) {
      this.powerZoneManager.reset();
    }
    this.powerZoneManager.checkPendingAction(nextProps);
    this.checkBaseChange(nextProps);
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
    this.powerZoneManager = null;
    this.loader.destroy();
    // eslint-disable-next-line guard-for-in, no-restricted-syntax
    for (const key in this.textures) {
      this.textures[key].destroy(true);
    }
    const hiddenTextureName = `${this.loaderName}_image`;
    PIXI.utils.TextureCache[hiddenTextureName].destroy(true);
    // PIXI.utils.destroyTextureCache();
    this.state.app.destroy(true);
  }

  onAssetsLoaded(loader) {
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
                this.state.negativePresent,
            );
      this.powerZoneManager.createZones();
      this.powerZoneManager.createLeftmostTestZone();
      this.resize();
      this.powerZoneManager.inititalPopulate(this.props.positivePowerZoneDots, true);
      this.powerZoneManager.inititalPopulate(this.props.negativePowerZoneDots, false);
      this.powerZoneManager.start();

      if (this.props.usage_mode === USAGE_MODE.EXERCISE) {
        this.props.startActivityFunc();
      }
    }
  }

  getDot(zone, isPositive, color = SPRITE_COLOR.RED) {
        // console.log('getDot', zone, isPositive, color);
    const dot = {};
    dot.x = randomFromTo(
      POSITION_INFO.DOT_RAYON,
      BOX_INFO.BOX_WIDTH - POSITION_INFO.DOT_RAYON
    );
    if (this.state.negativePresent) {
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
        let dotsPerZoneA;
        let dotsPerZoneB;
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
          if (dotsPerZoneA.reduce((acc, val) => acc + Math.abs(val), 0) === 0) {
            this.soundManager.playSound(SoundManager.GO_INVALID);
            this.props.error(ERROR_MESSAGE.INVALID_ENTRY);
            return;
          }
          if (dotsPerZoneB.reduce((acc, val) => acc + Math.abs(val), 0) === 0) {
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

  populateDotPerZoneArrayAdvancedMode() {
    let dotsPerZoneA;
    let dotsPerZoneB;
    if (this.props.operandA.indexOf('|') !== -1) {
      dotsPerZoneA = this.props.operandA.split('|');
    } else {
      dotsPerZoneA = this.props.operandA.split('');
    }
    // Verify that we don't have a single minus sign in a zone
    dotsPerZoneA.forEach((entry) => {
      if (entry === '-') {
        dotsPerZoneA[dotsPerZoneA.indexOf(entry)] = 0;
      }
    });
    if (this.props.operator_mode !== OPERATOR_MODE.MULTIPLY) {
      // don't split multiplication operand B
      if (this.props.operandB.indexOf('|') !== -1) {
        dotsPerZoneB = this.props.operandB.split('|');
      } else {
        dotsPerZoneB = this.props.operandB.split('');
      }
    } else {
      // there is no | possible in operandB in division,
      // but I need it as an array anyway, so split with impossible character.
      dotsPerZoneB = this.props.operandB.split('|');
    }
    // Verify that we don't have a single minus sign in a zone
    dotsPerZoneB.forEach((entry) => {
      if (entry === '-') {
        dotsPerZoneB[dotsPerZoneB.indexOf(entry)] = 0;
      }
    });
    return { dotsPerZoneA, dotsPerZoneB };
  }

  populateDotPerZoneArrayNormalMode() {
    const dotsPerZoneA = this.props.operandA.split('');
    let dotsPerZoneB;
    if (this.props.operator_mode === OPERATOR_MODE.DISPLAY) {
      dotsPerZoneB = [];
    } else {
      dotsPerZoneB = this.props.operandB.split('');
    }
    // If the value start with a minus sign, minus all the value
    if (dotsPerZoneA[0] === '-') {
      dotsPerZoneA.splice(0, 1);
      for (let i = 0; i < dotsPerZoneA.length; i += 1) {
        dotsPerZoneA[i] = `-${dotsPerZoneA[i]}`;
      }
    }
    if (dotsPerZoneB[0] === '-') {
      dotsPerZoneB.splice(0, 1);
      for (let i = 0; i < dotsPerZoneB.length; i += 1) {
        dotsPerZoneB[i] = `-${dotsPerZoneB[i]}`;
      }
    }
    return { dotsPerZoneA, dotsPerZoneB };
  }

  populateDotPerZoneArrayBaseX() {
    const dotsPerZoneA = new Array(this.props.totalZoneCount);
    const dotsPerZoneB = new Array(this.props.totalZoneCount);
    for (let i = 0; i < this.props.totalZoneCount; i += 1) {
      dotsPerZoneA[i] = 0;
      dotsPerZoneB[i] = 0;
    }

    let cleandedOperandA = superscriptToNormal(this.props.operandA);
    let cleandedOperandB = superscriptToNormal(this.props.operandB);
    let indices = [];
    for (let i = 0; i < cleandedOperandA.length; i += 1) {
      if (cleandedOperandA[i] === '-') indices.push(i);
    }
    let added = 0;
    indices.forEach((indice) => {
      cleandedOperandA = replaceAt(cleandedOperandA, indice + added, '+-');
      added += 1;
    });
    indices = [];
    for (let i = 0; i < cleandedOperandB.length; i += 1) {
      if (cleandedOperandB[i] === '-') indices.push(i);
    }
    added = 0;
    indices.forEach((indice) => {
      cleandedOperandB = replaceAt(cleandedOperandB, indice + added, '+-');
      added += 1;
    });
    // console.log(cleandedOperandA, cleandedOperandB);
    const splitZoneA = cleandedOperandA.split('+');
    const splitZoneB = cleandedOperandB.split('+');
    // console.log(splitZoneA, splitZoneB);
    splitZoneA.forEach((val) => {
      let value = val;
      if (value === '-' || value === '+') { // in case of entries like -2-, where the second - will be split in a zone value
        value = '0';
      }
      const xIndex = value.indexOf('x');
      // No x in the zone value, this is an number only
      if (xIndex === -1) {
        dotsPerZoneA[0] += Number(value);
      } else {
        let pos = 0;
        if (isNaN(value[xIndex + 1])) {
          // x only, no exponent
          pos = 1;
        } else {
          if (value[xIndex + 1] > this.props.totalZoneCount - 1) {
            // the exponent is higher than the amount of zone
            this.soundManager.playSound(SoundManager.GO_INVALID);
            this.props.error(ERROR_MESSAGE.INVALID_ENTRY);
            return;
          }
          pos = value[xIndex + 1];
        }
        if (xIndex === 0) {
          // positive x only
          dotsPerZoneA[pos] += 1;
        } else if (xIndex === 1 && value[0] === '-') {
          // negative x only
          dotsPerZoneA[pos] -= 1;
        } else {
          dotsPerZoneA[pos] += Number(value.substring(0, xIndex));
        }
      }
    });
    splitZoneB.forEach((val) => {
      let value = val;
      if (value === '-' || value === '+') { // in case of entries like -2-, where the second - will be split in a zone value
        value = '0';
      }
      const xIndex = value.indexOf('x');
      // No x in the zone value, this is an number only
      if (xIndex === -1) {
        dotsPerZoneB[0] += Number(value);
      } else {
        let pos = 0;
        if (isNaN(value[xIndex + 1])) {
          // x only, no exponent
          pos = 1;
        } else {
          if (value[xIndex + 1] > this.props.totalZoneCount - 1) {
            // the exponent is higher than the amount of zone
            this.soundManager.playSound(SoundManager.GO_INVALID);
            this.props.error(ERROR_MESSAGE.INVALID_ENTRY);
            return;
          }
          pos = value[xIndex + 1];
        }
        if (xIndex === 0) {
          // positive x only
          dotsPerZoneB[pos] += 1;
        } else if (xIndex === 1 && value[0] === '-') {
          // negative x only
          dotsPerZoneB[pos] -= 1;
        } else {
          dotsPerZoneB[pos] += Number(value.substring(0, xIndex));
        }
      }
    });
    return { dotsPerZoneA, dotsPerZoneB };
  }

  createDisplayDots(dotsPerZoneA) {
    let totalDot = 0;
    const dotsPos = [];
    for (let i = 0; i < dotsPerZoneA.length; i += 1) {
      totalDot += dotsPerZoneA[i] * Math.pow(this.props.base[1], i);
      for (let j = 0; j < Number(dotsPerZoneA[i]); j += 1) {
        dotsPos.push(this.getDot(i, true));
      }
    }
    this.soundManager.playSound(SoundManager.GO_SUCCESS);
    this.props.startActivityDoneFunc(dotsPos, totalDot);
  }

  createAddDots(dotsPerZoneA, dotsPerZoneB) {
    const dotsPos = [];
    makeBothArrayTheSameLength(dotsPerZoneA, dotsPerZoneB);
    for (let i = 0; i < dotsPerZoneA.length; i += 1) {
      let j = 0;
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

  createMultiplyDots(dotsPerZoneA) {
    const dotsPos = [];
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

  createSubtractDots(dotsPerZoneA, dotsPerZoneB) {
    const dotsPos = [];
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

  createDivideDots(dotsPerZoneA, dotsPerZoneB) {
    const dotsPos = [];
    const dividePos = [];
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

  checkBaseChange(nextProps) {
    if (this.props.base !== nextProps.base) {
      this.powerZoneManager.doBaseChange(nextProps.base, nextProps.placeValueOn);
    }
  }

  resize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const ratio = Math.min(
      w / SETTINGS.GAME_WIDTH,
      h / (this.props.operator_mode === OPERATOR_MODE.DIVIDE ?
        SETTINGS.GAME_HEIGHT_DIVIDE : SETTINGS.GAME_HEIGHT));
    this.state.stage.scale.x = this.state.stage.scale.y = ratio;
    this.state.renderer.resize(
      Math.ceil(SETTINGS.GAME_WIDTH * ratio),
      Math.ceil((this.props.operator_mode === OPERATOR_MODE.DIVIDE ?
          SETTINGS.GAME_HEIGHT_DIVIDE : SETTINGS.GAME_HEIGHT) * ratio));
  }

  calculateOperandRealValue(arr) {
    let value = 0;
    for (let i = 0; i < arr.length; i += 1) {
      value += arr[i] * Math.pow(this.props.base[1], i);
    }
    return value;
  }

  render() {
    return (
      <canvas ref={(canvas) => { this.canvas = canvas; }} />
    );
  }
}

export default CanvasPIXI;
