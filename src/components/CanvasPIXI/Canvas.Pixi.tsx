import * as React from 'react';
import {
  BASE, BOX_INFO, ERROR_MESSAGE, IOPERATOR_MODE, ISPRITE_COLOR, IUSAGE_MODE,
  MAX_DOT, OPERATOR_MODE, POSITION_INFO, SETTINGS, SPRITE_COLOR, USAGE_MODE,
} from '../../Constants';
import { Component } from 'react';
import { DotVO } from '../../VO/DotVO';
import { PowerZoneManager } from './PowerZoneManager';
import { SoundManager } from '../../utils/SoundManager';
import { SpritePool } from '../../utils/SpritePool';
import { makeBothArrayTheSameLength } from '../../utils/ArrayUtils';
import { randomFromTo } from '../../utils/MathUtils';
import {removeLeadingZero, replaceAt, superscriptToNormal} from '../../utils/StringUtils';
import { TweenMax } from 'gsap';
import VisibilitySensor from 'react-visibility-sensor';
import TextureDictionary = PIXI.loaders.TextureDictionary;
import {DividerDotVO} from '../../VO/DividerDotVO';
import Point = PIXI.Point;
import ObservablePoint = PIXI.ObservablePoint;
import styled from 'styled-components';
import ApplicationOptions = PIXI.ApplicationOptions;

interface IOperantProcessedArray {
  dotsPerZoneA: string[];
  dotsPerZoneB: string[];
}

export interface ICanvasPixiProps {
  readonly title: string;
  readonly addDot: (zoneId: number,
                    position: number[],
                    isPositive: boolean,
                    color?: string,
                    actionType?: string) => any;
  readonly removeDot: (zoneId: number,
                       dotId: string) => any;
  readonly removeMultipleDots: (zoneId: number,
                                dots: DotVO[],
                                updateValue: boolean) => any;
  readonly rezoneDot: (zoneId: number,
                       dot: DotVO,
                       updateValue: boolean) => any;
  readonly addMultipleDots: (zoneId: number,
                             dotsPos: Point[],
                             isPositive: boolean,
                             color: string,
                             dropPosition: Point | ObservablePoint) => any;
  readonly setDivisionResult: (zoneId: number,
                               divisionValue: number,
                               isPositive: boolean) => any;
  readonly activateMagicWand: (active: boolean) => any;
  readonly startActivityFunc: () => any;
  readonly startActivityDoneFunc: (dotsInfo: DotVO[],
                                   totalA: string,
                                   totalB?: string,
                                   divider?: DotVO[]) => any;
  readonly activitySuccessFunc: () => any;
  readonly error: () => any;
  readonly positivePowerZoneDots: Array<IDotVOHash<DotVO>>;
  readonly negativePowerZoneDots: Array<IDotVOHash<DotVO>>;
  readonly positiveDividerDots: Array<IDividerDotVOHash<DividerDotVO>>;
  readonly negativeDividerDots: Array<IDividerDotVOHash<DividerDotVO>>;
  readonly positiveDividerResult: number[];
  readonly negativeDividerResult: number[];
  readonly base: Array<number | string>;
  readonly operator_mode: IOPERATOR_MODE;
  readonly usage_mode: IUSAGE_MODE;
  readonly placeValueOn: boolean;
  readonly cdnBaseUrl: string;
  readonly totalZoneCount: number;
  readonly magicWandIsActive: boolean;
  readonly startActivity: boolean;
  readonly activityStarted: boolean;
  readonly operandA: string;
  readonly operandB: string;
  readonly muted: boolean;
  readonly wantedResult: IWantedResult;
  readonly successAction: (name: string) => any;
  readonly success: boolean;
  readonly displayUserMessageAction: (message: string) => any;
}

class CanvasPIXI extends Component<ICanvasPixiProps, {}> {
  // eslint-disable-next-line no-unused-vars
  private static onAssetsError(loader?): void {
    // TODO Do something
    // console.log('onAssetsError', loader);
    // loader.onStart = null;
  }

  private static removeTrailingSign(str: string): string {
    let aString: string = str;
    if (aString.lastIndexOf('-') === aString.length - 1 || aString.lastIndexOf('+') === aString.length - 1) {
      aString = aString.substring(0, aString.length - 1);
    }
    return aString;
  }

  private isWebGL: boolean;
  private negativePresent: boolean;
  private maxDotsByZone: number;
  private powerZoneManager: PowerZoneManager;
  private canvas: HTMLCanvasElement;
  private app: PIXI.Application;
  private stage: PIXI.Container;
  private renderer: PIXI.WebGLRenderer | PIXI.CanvasRenderer;
  private soundManager: SoundManager;
  private loader: PIXI.loaders.Loader;
  private spritePool: SpritePool;
  private loaderName: string = 'machineAssets';
  private textures: PIXI.loaders.TextureDictionary | undefined;
  private boundOnResize: EventListenerObject;
  private canvasDiv: HTMLDivElement;
  private placeHolder: HTMLImageElement;
  private placeholderImage = require('./images/placeholder.gif');

  constructor(props: ICanvasPixiProps) {
    super(props);
    this.isWebGL = false;
    this.negativePresent = (props.operator_mode === OPERATOR_MODE.SUBTRACT
    || props.operator_mode === OPERATOR_MODE.DIVIDE
    || props.base[1] === BASE.BASE_X);
    this.maxDotsByZone = this.negativePresent ? MAX_DOT.MIX : MAX_DOT.ONLY_POSITIVE;
    // to accomodate for pixel padding in TexturePacker
    PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;
  }

  public render(): JSX.Element {

    const PlaceHolderImg = styled.img`
      width: 100%;
      height: 1px;
     `;

    const CanvasDivStyled = styled.div`
      visibility: hidden;
      height: 1px;
      overflow: hidden;
     `;

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
          <CanvasDivStyled
            innerRef={(canvasDiv) => { this.canvasDiv = canvasDiv as HTMLDivElement; }}
          >
            <canvas
              ref={(canvas) => { this.canvas = canvas as HTMLCanvasElement; }}
            />
          </CanvasDivStyled>
          <PlaceHolderImg
            innerRef={(placeholder) => { this.placeHolder = placeholder as HTMLImageElement; }}
            src={this.placeholderImage}
            role='presentation'
          />
        </div>
        </VisibilitySensor>
      </div>
    );
  }

  public componentDidMount(): void {
    // console.log('componentDidMount', this.state, this.props);
    const options: ApplicationOptions = {
      antialias: true,
      autoResize: true,
      preserveDrawingBuffer: false,
      clearBeforeRender: true,
      resolution: window.devicePixelRatio,
      transparent: true,
      view: this.canvas,
    };

    const preventWebGL: boolean = false;
    this.app = new PIXI.Application(
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
            this.props.displayUserMessageAction,
            this.soundManager,
            this.props.wantedResult,
            this.props.successAction,
            this.props.title,
            this.props.activitySuccessFunc,
        );
    this.stage.addChild(this.powerZoneManager);
    this.isWebGL = this.renderer instanceof PIXI.WebGLRenderer;
    this.boundOnResize = this.resize.bind(this);
    window.addEventListener('resize', this.boundOnResize);
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
    this.loader.once('error', CanvasPIXI.onAssetsError);
    this.loader.load();
    this.resize();
  }

  public shouldComponentUpdate(nextProps: ICanvasPixiProps): boolean {
    if (this.props.activityStarted === true && nextProps.activityStarted === false) {
      this.powerZoneManager.reset();
    }
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
    if (nextProps.success === false) {
      this.powerZoneManager.checkResult();
    }
    this.soundManager.muted = this.props.muted;
    return false;
  }

  public componentWillUnmount(): void {
    TweenMax.killAll(false, true, true, true);
    if (this.soundManager) {
      this.soundManager.destroy();
    }
    if (this.spritePool) {
      this.spritePool.destroy();
    }
    if (this.powerZoneManager) {
      this.powerZoneManager.destroy();
    }
    if (this.loader) {
      this.loader.destroy();
    }
    if (this.textures) {
      for (const key in this.textures) {
        if (this.textures[key]) {
          this.textures[key].destroy(true);
        }
      }
    }
    const hiddenTextureName = `${this.loaderName}_image`;
    if (PIXI.utils.TextureCache[hiddenTextureName]) {
      PIXI.utils.TextureCache[hiddenTextureName].destroy(true);
    }
    this.app.destroy(true);
    window.removeEventListener('resize', this.boundOnResize);
  }

  private onVisibilityChange(isVisible): void {
    if (this.app) {
      if (isVisible) {
        this.app.ticker.start();
        if (this.renderer && this.isWebGL) {
          (this.renderer as PIXI.WebGLRenderer).currentRenderer.start();
        }
      } else {
        this.app.ticker.stop();
        if (this.renderer && this.isWebGL) {
          (this.renderer as PIXI.WebGLRenderer).currentRenderer.stop();
        }
      }
    } else if (isVisible === false) {
      setTimeout(this.onVisibilityChange.bind(this, isVisible), 500);
    }
  }

  private onAssetsLoaded(loader: PIXI.loaders.Loader): void {
    if (loader.resources.machineAssets.error === null) {
      this.textures = loader.resources.machineAssets.textures;
      this.spritePool = new SpritePool(this.textures as TextureDictionary);
      this.powerZoneManager.init(
                this.textures as TextureDictionary,
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
      this.canvasDiv.style.height = this.props.operator_mode ===
        OPERATOR_MODE.DIVIDE ?
          `${SETTINGS.GAME_HEIGHT_DIVIDE}px`
          :
          `${SETTINGS.GAME_HEIGHT}px`;
      this.canvasDiv.style.overflow = 'visible';
      this.placeHolder.style.display = 'none';
      if (this.props.usage_mode === USAGE_MODE.EXERCISE) {
        this.props.startActivityFunc();
      }
    }
  }

  private getDot(zone: number,
                 isPositive: boolean,
                 color: ISPRITE_COLOR = SPRITE_COLOR.RED): DotVO {
        // console.log('getDot', zone, isPositive, color);
    const dot: DotVO = new DotVO();
    dot.x = randomFromTo(
      POSITION_INFO.DOT_RAYON,
      BOX_INFO.BOX_WIDTH - POSITION_INFO.DOT_RAYON,
    );
    if (this.negativePresent) {
      dot.y = randomFromTo(
        POSITION_INFO.DOT_RAYON,
        BOX_INFO.HALF_BOX_HEIGHT - POSITION_INFO.DOT_RAYON,
      );
    } else {
      dot.y = randomFromTo(
        POSITION_INFO.DOT_RAYON,
        BOX_INFO.BOX_HEIGHT - POSITION_INFO.DOT_RAYON,
      );
    }
    dot.zoneId = zone;
    dot.isPositive = isPositive;
    dot.color = color;
    return dot;
  }

  private checkMachineStateValue(): void {
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
        let dotsPerZoneA: string[];
        let dotsPerZoneB: string[];
        // if there is no operand B value and one is displayed
        // (OPERATOR_MODE.DISPLAY hide operand B)
        if (this.props.operator_mode !== OPERATOR_MODE.DISPLAY &&
          this.props.operandB.length === 0) {
          this.soundManager.playSound(SoundManager.GO_INVALID);
          if (this.props.displayUserMessageAction) {
            this.props.displayUserMessageAction(ERROR_MESSAGE.INVALID_ENTRY);
          }
          this.props.error();
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
          const populatedArrays: IOperantProcessedArray | null = this.populateDotPerZoneArrayBaseX();
          if (populatedArrays === null) {
            return;
          }
          dotsPerZoneA = populatedArrays.dotsPerZoneA;
          dotsPerZoneB = populatedArrays.dotsPerZoneB;
          // validate that the sum of the value isn't 0
          if (dotsPerZoneA.reduce((acc, val) => acc + Math.abs(Number(val)), 0) === 0) {
            this.soundManager.playSound(SoundManager.GO_INVALID);
            if (this.props.displayUserMessageAction) {
              this.props.displayUserMessageAction(ERROR_MESSAGE.INVALID_ENTRY);
            }
            this.props.error();
            return;
          }
          if (dotsPerZoneB.reduce((acc, val) => acc + Math.abs(Number(val)), 0) === 0) {
            this.soundManager.playSound(SoundManager.GO_INVALID);
            if (this.props.displayUserMessageAction) {
              this.props.displayUserMessageAction(ERROR_MESSAGE.INVALID_ENTRY);
            }
            this.props.error();
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
              this.createSubtractDots(dotsPerZoneA, dotsPerZoneB);
            } else {
              this.soundManager.playSound(SoundManager.GO_INVALID);
              if (this.props.displayUserMessageAction) {
                this.props.displayUserMessageAction(ERROR_MESSAGE.INVALID_ENTRY);
              }
              this.props.error();
              return;
            }
            break;
          case OPERATOR_MODE.DIVIDE:
            if (dotsPerZoneA.length !== 0 && dotsPerZoneB.length !== 0) {
              this.createDivideDots(dotsPerZoneA, dotsPerZoneB);
            } else {
              this.soundManager.playSound(SoundManager.GO_INVALID);
              if (this.props.displayUserMessageAction) {
                this.props.displayUserMessageAction(ERROR_MESSAGE.INVALID_ENTRY);
              }
              this.props.error();
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

  private populateDotPerZoneArrayAdvancedMode(): IOperantProcessedArray {
    let dotsPerZoneA: string[];
    let dotsPerZoneB: string[];
    if (this.props.operandA.indexOf('|') !== -1) {
      dotsPerZoneA = this.props.operandA.split('|');
    } else {
      dotsPerZoneA = this.props.operandA.split('');
    }
    // Verify that we don't have a single minus sign in a zone
    dotsPerZoneA.forEach((entry) => {
      if (entry === '-') {
        dotsPerZoneA[dotsPerZoneA.indexOf(entry)] = '0';
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
        dotsPerZoneB[dotsPerZoneB.indexOf(entry)] = '0';
      }
    });
    return { dotsPerZoneA, dotsPerZoneB };
  }

  private populateDotPerZoneArrayNormalMode(): IOperantProcessedArray {
    const dotsPerZoneA = this.props.operandA.split('');
    let dotsPerZoneB: string[];
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

  private populateDotPerZoneArrayBaseX(): IOperantProcessedArray | null {
    const dotsPerZoneA: string[] = new Array(this.props.totalZoneCount);
    const dotsPerZoneB: string[] = new Array(this.props.totalZoneCount);
    for (let i = 0; i < this.props.totalZoneCount; i += 1) {
      dotsPerZoneA[i] = '0';
      dotsPerZoneB[i] = '0';
    }
    let cleandedOperandA: string = superscriptToNormal(this.props.operandA);
    let cleandedOperandB: string = superscriptToNormal(this.props.operandB);
    let indices: number[] = [];
    for (let i = 0; i < cleandedOperandA.length; i += 1) {
      if (cleandedOperandA[i] === '-') {
        indices.push(i);
      }
    }
    let added: number = 0;
    indices.forEach((indice: number) => {
      cleandedOperandA = replaceAt(cleandedOperandA, indice + added, '+-');
      added += 1;
    });
    indices = [];
    for (let i = 0; i < cleandedOperandB.length; i += 1) {
      if (cleandedOperandB[i] === '-') {
        indices.push(i);
      }
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
    let inError: boolean = false;
    splitZoneA.forEach((val: string) => {
      if (inError === false) {
        let value = val;
        // in case of entries like -2-, where the second - will be split in a zone value
        if (value === '-' || value === '+') {
          value = '0';
        }
        const xIndex = value.indexOf('x');
        // No x in the zone value, this is an number only
        if (xIndex === -1) {
          dotsPerZoneA[0] += Number(value);
        } else {
          let pos: number = 0;
          if (isNaN(Number(value[xIndex + 1]))) {
            // x only, no exponent
            pos = 1;
          } else {
            if (Number(value[xIndex + 1]) > this.props.totalZoneCount - 1) {
              // the exponent is higher than the amount of zone
              inError = true;
              return null;
            }
            pos = Number(value[xIndex + 1]);
          }
          if (xIndex === 0) {
            // positive x only
            dotsPerZoneA[pos] = (Number(dotsPerZoneA[pos]) + 1).toString();
          } else if (xIndex === 1 && value[0] === '-') {
            // negative x only
            dotsPerZoneA[pos] = (Number(dotsPerZoneA[pos]) - 1).toString();
          } else {
            const zoneValue: number = Number(dotsPerZoneA[pos]);
            dotsPerZoneA[pos] = (zoneValue + Number(value.substring(0, xIndex))).toString();
          }
        }
      }
    });
    splitZoneB.forEach((val: string) => {
      let value = val;
      // in case of entries like -2-, where the second - will be split in a zone value
      if (value === '-' || value === '+') {
        value = '0';
      }
      const xIndex = value.indexOf('x');
      // No x in the zone value, this is an number only
      if (xIndex === -1) {
        dotsPerZoneB[0] += Number(value);
      } else {
        let pos = 0;
        if (isNaN(Number(value[xIndex + 1]))) {
          // x only, no exponent
          pos = 1;
        } else {
          if (Number(value[xIndex + 1]) > this.props.totalZoneCount - 1) {
            // the exponent is higher than the amount of zone
            inError = true;
            return null;
          }
          pos = Number(value[xIndex + 1]);
        }
        if (xIndex === 0) {
          // positive x only
          dotsPerZoneB[pos] = (Number(dotsPerZoneB[pos]) + 1).toString();
        } else if (xIndex === 1 && value[0] === '-') {
          // negative x only
          dotsPerZoneB[pos] = (Number(dotsPerZoneB[pos]) - 1).toString();
        } else {
          const zoneValue: number = Number(dotsPerZoneB[pos]);
          dotsPerZoneB[pos] = (zoneValue + Number(value.substring(0, xIndex))).toString();
        }
      }
    });
    if (inError === false) {
      // remove leading zeroes in the string in Base X
      for (let i: number = 0; i < dotsPerZoneA.length; i++) {
        dotsPerZoneA[i] = removeLeadingZero(dotsPerZoneA[i]);
      }
      for (let i: number = 0; i < dotsPerZoneB.length; i++) {
        dotsPerZoneB[i] = removeLeadingZero(dotsPerZoneB[i]);
      }
      return {dotsPerZoneA, dotsPerZoneB};
    }else {
      this.soundManager.playSound(SoundManager.GO_INVALID);
      if (this.props.displayUserMessageAction) {
        this.props.displayUserMessageAction(ERROR_MESSAGE.INVALID_ENTRY);
      }
      this.props.error();
    }
    return null;
  }

  private createDisplayDots(dotsPerZoneA: string[]): void {
    let totalDot: number = 0;
    const dotsPos: DotVO[] = new Array<DotVO>();
    for (let i = 0; i < dotsPerZoneA.length; i += 1) {
      // tslint:disable-next-line
      totalDot += Number(dotsPerZoneA[i]) * Math.pow(Number(this.props.base[1]) / Number(this.props.base[0]), i);
      for (let j = 0; j < Number(dotsPerZoneA[i]); j += 1) {
        dotsPos.push(this.getDot(i, true));
      }
    }
    this.soundManager.playSound(SoundManager.GO_SUCCESS);
    this.props.startActivityDoneFunc(dotsPos, totalDot.toString());
  }

  private createAddDots(dotsPerZoneA: string[], dotsPerZoneB: string[]): void {
    const dotsPos: DotVO[] = new Array<DotVO>();
    makeBothArrayTheSameLength(dotsPerZoneA, dotsPerZoneB, 0);
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
      const operandAValue: string = this.calculateOperandRealValue(dotsPerZoneA);
      const operandBValue: string = this.calculateOperandRealValue(dotsPerZoneB);
      this.soundManager.playSound(SoundManager.GO_SUCCESS);
      this.props.startActivityDoneFunc(dotsPos, operandAValue, operandBValue);
    } else {
      // remove last char in the operand if it's a - or a +
      const operandAValue: string = CanvasPIXI.removeTrailingSign(this.props.operandA);
      const operandBValue: string = CanvasPIXI.removeTrailingSign(this.props.operandB);
      this.soundManager.playSound(SoundManager.GO_SUCCESS);
      this.props.startActivityDoneFunc(dotsPos, operandAValue, operandBValue);
    }
  }

  private createMultiplyDots(dotsPerZoneA: string[]): void {
    const dotsPos: DotVO[] = new Array<DotVO>();
    for (let i = 0; i < dotsPerZoneA.length; i += 1) {
      let totalDotInZone = 0;
      totalDotInZone = Number(dotsPerZoneA[i]) * Number(this.props.operandB);
      for (let j = 0; j < Math.abs(totalDotInZone); j += 1) {
        dotsPos.push(this.getDot(i, String(dotsPerZoneA[i]).indexOf('-') === -1));
      }
    }
    if (this.props.base[1] !== BASE.BASE_X) {
      const operandAValue: string = this.calculateOperandRealValue(dotsPerZoneA);
      this.soundManager.playSound(SoundManager.GO_SUCCESS);
      this.props.startActivityDoneFunc(dotsPos, operandAValue);
    } else {
      // remove last char in the operand if it's a - or a +
      const operandAValue: string = CanvasPIXI.removeTrailingSign(this.props.operandA);
      this.soundManager.playSound(SoundManager.GO_SUCCESS);
      this.props.startActivityDoneFunc(dotsPos, operandAValue);
    }
  }

  private createSubtractDots(dotsPerZoneA: string[], dotsPerZoneB: string[]): void {
    const dotsPos: DotVO[] = new Array<DotVO>();
    makeBothArrayTheSameLength(dotsPerZoneA, dotsPerZoneB, 0);
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
      const operandAValue: string = this.calculateOperandRealValue(dotsPerZoneA);
      const operandBValue: string = this.calculateOperandRealValue(dotsPerZoneB);
      this.soundManager.playSound(SoundManager.GO_SUCCESS);
      this.props.startActivityDoneFunc(dotsPos, operandAValue, operandBValue);
    } else {
      // remove last char in the operand if it's a - or a +
      const operandAValue: string = CanvasPIXI.removeTrailingSign(this.props.operandA);
      const operandBValue: string = CanvasPIXI.removeTrailingSign(this.props.operandB);
      this.soundManager.playSound(SoundManager.GO_SUCCESS);
      this.props.startActivityDoneFunc(dotsPos, operandAValue, operandBValue);
    }
  }

  private createDivideDots(dotsPerZoneA: string[], dotsPerZoneB: string[]): void {
    const dotsPos: DotVO[] = new Array<DotVO>();
    const dividePos: DotVO[] = new Array<DotVO>();
    makeBothArrayTheSameLength(dotsPerZoneA, dotsPerZoneB, 0);
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
      const operandAValue: string = this.calculateOperandRealValue(dotsPerZoneA);
      const operandBValue: string = this.calculateOperandRealValue(dotsPerZoneB);
      this.soundManager.playSound(SoundManager.GO_SUCCESS);
      this.props.startActivityDoneFunc(dotsPos, operandAValue, operandBValue, dividePos);
    } else {
      // remove last char in the operand if it's a - or a +
      const operandAValue: string = CanvasPIXI.removeTrailingSign(this.props.operandA);
      const operandBValue: string = CanvasPIXI.removeTrailingSign(this.props.operandB);
      this.soundManager.playSound(SoundManager.GO_SUCCESS);
      // console.log(operandAValue, operandBValue);
      this.props.startActivityDoneFunc(dotsPos, operandAValue, operandBValue, dividePos);
    }
  }

  private checkBaseChange(nextProps: ICanvasPixiProps): void {
    if (this.props.base !== nextProps.base) {
      this.powerZoneManager.doBaseChange(nextProps.base); // , nextProps.placeValueOn);
    }
  }

  private resize(): void {
    let offset: number = 0;
    if (this.canvas && this.canvas.parentElement) {
      offset = this.canvas.parentElement.offsetWidth;
    }
    const w = Math.min(window.innerWidth, offset);
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
  }

  private calculateOperandRealValue(arr: string[]): string {
    let value: number = 0;
    for (let i = 0; i < arr.length; i += 1) {
      // tslint:disable-next-line
      value += Number(arr[i]) * Math.pow(Number(this.props.base[1]), i);
    }
    return value.toString();
  }
}

export default CanvasPIXI;
