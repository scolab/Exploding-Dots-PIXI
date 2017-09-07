import { Point } from 'pixi.js';
import { TweenMax, Power0, Power3, Power4} from 'gsap';
import { PowerZone } from './PowerZone';
import { ParticleEmitter } from './ParticleEmitter';
import { isPointInRectangle, randomFromTo, findQuadrant } from '../../utils/MathUtils';
// tslint:disable-next-line max-line-length
import {
  BASE, USAGE_MODE, OPERATOR_MODE, POSITION_INFO, BOX_INFO, SPRITE_COLOR, ERROR_MESSAGE, IOPERATOR_MODE,
  IUSAGE_MODE, DOT_ACTIONS, MOVE_IMPOSSIBLE, TWEEN_TIME, ISPRITE_COLOR, getAColorFilter,
} from '../../Constants';
import { DividerZoneManager } from './DividerZoneManager';
import { SoundManager } from '../../utils/SoundManager';
import { SpritePool } from '../../utils/SpritePool';
import {DotVO} from '../../VO/DotVO';
import {DotSprite} from './DotSprite';
import Rectangle = PIXI.Rectangle;
import {DotsContainer} from './DotsContainer';
import Sprite = PIXI.Sprite;
import InteractionData = PIXI.interaction.InteractionData;
import InteractionEvent = PIXI.interaction.InteractionEvent;
import {DividerDotVO} from '../../VO/DividerDotVO';
import ObservablePoint = PIXI.ObservablePoint;
import TextureDictionary = PIXI.loaders.TextureDictionary;
import DisplayObjectContainer = PIXI.core.DisplayObjectContainer;
import ColorMatrixFilter = PIXI.filters.ColorMatrixFilter;

interface IZoneUnderCursor {
  droppedOnPowerZone: PIXI.Container | null;
  droppedOnPowerZoneIndex: number;
  actualZone?: PowerZone | null;
}

export class PowerZoneManager extends PIXI.Container {

  private static removeDotsAfterTween(sprite: Sprite): void {
    sprite.destroy();
  }

  public isInteractive: boolean;

  private addDot: (zoneId: number,
                   position: number[],
                   isPositive: boolean,
                   color?: string,
                   actionType?: string) => any;
  private removeDot: (zoneId: number,
                      dotId: string) => any;
  private addMultipleDots: (zoneId: number,
                            dotsPos: Point[],
                            isPositive: boolean,
                            color: string,
                            dropPosition: Point | ObservablePoint) => any;
  private removeMultipleDots: (zoneId: number,
                               dots: DotVO[],
                               updateValue: boolean) => any;
  private rezoneDot: (zoneId: number,
                      dot: DotVO,
                      updateValue: boolean) => any;
  private setDivisionResult: (zoneId: number,
                              divisionValue: number,
                              isPositive: boolean) => any;
  private displayUserMessageAction: (message: string) => any;
  private movingDotsContainer: PIXI.Container;
  private dividerZoneManager: DividerZoneManager;
//  private dividerResult: DividerResult;
  private soundManager: SoundManager;
  private wantedResult: IWantedResult;
  private ticker: PIXI.ticker.Ticker;
  private textures: PIXI.loaders.TextureDictionary;
  private spritePool: SpritePool;
  private base: Array<number | string>;
  private usageMode: IUSAGE_MODE;
  private operatorMode: IOPERATOR_MODE;
  private totalZoneCount: number;
  private placeValueOn: boolean;
  private negativePresent: boolean;
  private allZones: PowerZone[];
  private dragParticleEmitterRed: ParticleEmitter;
  private dragParticleEmitterBlue: ParticleEmitter;
  private leftMostZone: PIXI.Container;
  private redDragJSON: object;
  private blueDragJSON: object;
  private activitySuccessFunc: () => any;
  private successAction: (name: string) => any;
  private title: string;
  private isUserActionComplete: boolean; // Do not validate result in the middle of an operation

  constructor(addDot: (zoneId: number,
                       position: number[],
                       isPositive: boolean,
                       color?: string,
                       actionType?: string) => any,
              removeDot: (zoneId: number,
                          dotId: string) => any,
              addMultipleDots: (zoneId: number,
                                dotsPos: Point[],
                                isPositive: boolean,
                                color: string,
                                dropPosition: Point | ObservablePoint) => any,
              removeMultipleDots: (zoneId: number,
                                   dots: DotVO[],
                                   updateValue: boolean) => any,
              rezoneDot: (zoneId: number,
                          dot: DotVO,
                          updateValue: boolean) => any,
              setDivisionResult: (zoneId: number,
                                  divisionValue: number,
                                  isPositive: boolean) => any,
              displayUserMessageAction: (message: string) => any,
              soundManager: SoundManager,
              wantedResult: IWantedResult,
              successAction: (name: string) => any,
              title: string,
              activitySuccessFunc: () => any,
          ) {
    super();

    this.redDragJSON = require('./dot_drag_red.json');
    this.blueDragJSON = require('./dot_drag_blue.json');
    this.addDot = addDot;
    this.removeDot = removeDot;
    this.addMultipleDots = addMultipleDots;
    this.removeMultipleDots = removeMultipleDots;
    this.rezoneDot = rezoneDot;
    this.setDivisionResult = setDivisionResult;
    this.displayUserMessageAction = displayUserMessageAction;
    this.movingDotsContainer = new PIXI.Container();
    this.soundManager = soundManager;
    this.wantedResult = JSON.parse(JSON.stringify(wantedResult));
    // reverse all the wanted result so they are in the same order as our zone.
    if (this.wantedResult.positiveDots && this.wantedResult.positiveDots.length > 0) {
      this.wantedResult.positiveDots.reverse();
    }
    if (this.wantedResult.negativeDots && this.wantedResult.negativeDots.length > 0) {
      this.wantedResult.negativeDots.reverse();
    }
    if (this.wantedResult.positiveDivider && this.wantedResult.positiveDivider.length > 0) {
      this.wantedResult.positiveDivider.reverse();
    }
    if (this.wantedResult.negativeDivider && this.wantedResult.negativeDivider.length > 0) {
      this.wantedResult.negativeDivider.reverse();
    }
    this.successAction = successAction;
    this.activitySuccessFunc = activitySuccessFunc;
    this.title = title;
    this.ticker = new PIXI.ticker.Ticker();
    this.ticker.stop();
    this.isUserActionComplete = true;
  }

  public init(textures: TextureDictionary,
              spritePool: SpritePool,
              base: Array<number | string>,
              usageMode: IUSAGE_MODE,
              operatorMode: IOPERATOR_MODE,
              totalZoneCount: number,
              placeValueOn: boolean,
              negativePresent: boolean): void {
    this.textures = textures;
    this.spritePool = spritePool;
    this.base = base;
    this.usageMode = usageMode;
    this.operatorMode = operatorMode;
    this.totalZoneCount = totalZoneCount;
    this.placeValueOn = placeValueOn;
    this.negativePresent = negativePresent;
    this.allZones = [];
    this.isInteractive = usageMode === USAGE_MODE.FREEPLAY;
    /*this.explodeEmitter = new Array<ParticleEmitter>();
    this.implodeEmitter = new Array<ParticleEmitter>();*/
  }

  public createZones(): void {
    for (let i: number = this.totalZoneCount - 1; i >= 0; i -= 1) {
      const powerZone: PowerZone = new PowerZone(i,
                this.textures,
                this.base,
                this.negativePresent,
                this.usageMode,
                this.operatorMode,
                this.totalZoneCount,
                this.spritePool,
            );
      this.addChild(powerZone);
      this.allZones.push(powerZone);
      powerZone.eventEmitter.on(PowerZone.CREATE_DOT, this.createDot, this);
      powerZone.eventEmitter.on(PowerZone.DIVIDER_OVERLOAD, this.balanceDivider, this);
      powerZone.eventEmitter.on(PowerZone.ADD_DOT_PROPERTIES, this.addDotSpriteProperty, this);
      powerZone.setValueTextAlpha(this.placeValueOn ? 1 : 0);
    }
    this.setZoneTextAndAlphaStatus();
    // tslint:disable-next-line max-line-length
    this.dragParticleEmitterRed = new ParticleEmitter(this.movingDotsContainer, this.textures['red_dot.png'], this.redDragJSON);
    this.dragParticleEmitterBlue = new ParticleEmitter(this.movingDotsContainer, this.textures['blue_dot.png'], this.blueDragJSON);
    this.addChild(this.movingDotsContainer);
    if (this.operatorMode === OPERATOR_MODE.DIVIDE) {
      this.dividerZoneManager = new DividerZoneManager();
      this.dividerZoneManager.init(this.textures);
      this.dividerZoneManager.eventEmitter.on(DividerZoneManager.START_DRAG,
          this.precalculateForDivision,
          this);
      this.dividerZoneManager.eventEmitter.on(DividerZoneManager.MOVED,
          this.checkIfDivisionPossible,
          this);
      this.dividerZoneManager.eventEmitter.on(DividerZoneManager.END_DRAG,
          this.checkIfDivisionPossible,
          this);
    }
  }

  public createLeftmostTestZone(): void {
    this.leftMostZone = new PIXI.Container();
    this.leftMostZone.x = 0;
    this.leftMostZone.y = BOX_INFO.BOX_Y;
    this.addChild(this.leftMostZone);
    this.leftMostZone.hitArea = new PIXI.Rectangle(0, 0, BOX_INFO.LEFT_GUTTER, BOX_INFO.BOX_HEIGHT);
  }

  public start(): void {
    this.ticker.add(() => {
      this.animationCallback();
    });
    this.ticker.start();
  }

  public precalculateForDivision(): void {
    this.allZones.forEach((zone) => {
      zone.precalculateDotsForDivision();
    });
  }

  public doBaseChange(base: Array<number | string>): void {
    this.base = base;
    this.allZones.forEach((zone) => {
      zone.baseChange(base);
    });
  }

  public setValueTextAlpha(placeValueOn: boolean): void {
    this.allZones.forEach((zone) => {
      zone.setValueTextAlpha(placeValueOn ? 1 : 0);
    });
  }

  public magicWand(): void {
    const base: number | string = this.base[1];
    let dotsRemoved: DotVO[] = new Array<DotVO>();
    if (this.negativePresent) {
      // check positive / negative
      for (let i: number = 0; i < this.allZones.length; i += 1) {
        const positiveDots = this.allZones[i].positiveDots;
        const negativeDots = this.allZones[i].negativeDots;
        const positiveDotsCount = Object.keys(positiveDots).length;
        const negativeDotsCount = Object.keys(negativeDots).length;
        if (positiveDotsCount > 0 && negativeDotsCount) {
          const overdotCount = Math.min(positiveDotsCount, negativeDotsCount);
          dotsRemoved = dotsRemoved.concat(
            this.allZones[i].getPositiveNegativeOverdot(overdotCount, true),
          );
          dotsRemoved = dotsRemoved.concat(
            this.allZones[i].getPositiveNegativeOverdot(overdotCount, false),
          );
          this.removeMultipleDots(i, dotsRemoved, false);
          break;
        }
      }
    }
    if (dotsRemoved.length === 0 && this.base[1] !== BASE.BASE_X) {
      for (let i: number = 0; i < this.allZones.length - 1; i += 1) {
        dotsRemoved = this.allZones[i].getOvercrowding(base as number);
        if (dotsRemoved.length > 0) {
          this.removeMultipleDots(i, dotsRemoved, false);
          if (this.negativePresent) {
            if (dotsRemoved[0].isPositive) {
              const dotPos: number[] = [
                randomFromTo(
                  POSITION_INFO.DOT_RAYON,
                  (this.allZones[i].positiveDotsContainer.hitArea as Rectangle).width - POSITION_INFO.DOT_RAYON),
                randomFromTo(
                  POSITION_INFO.DOT_RAYON,
                  (this.allZones[i].positiveDotsContainer.hitArea as Rectangle).height - POSITION_INFO.DOT_RAYON),
              ];
              this.addDot(i + 1, dotPos, true, SPRITE_COLOR.RED);
            } else {
              const dotPos: number[] = [
                randomFromTo(
                  POSITION_INFO.DOT_RAYON,
                  (this.allZones[i].negativeDotsContainer.hitArea as Rectangle).width - POSITION_INFO.DOT_RAYON),
                randomFromTo(
                  POSITION_INFO.DOT_RAYON,
                  (this.allZones[i].negativeDotsContainer.hitArea as Rectangle).height - POSITION_INFO.DOT_RAYON),
              ];
              this.addDot(i + 1, dotPos, false, SPRITE_COLOR.RED);
            }
          } else {
            const dotPos: number[] = [
              randomFromTo(
                POSITION_INFO.DOT_RAYON,
                (this.allZones[i].positiveDotsContainer.hitArea as Rectangle).width - POSITION_INFO.DOT_RAYON),
              randomFromTo(
                POSITION_INFO.DOT_RAYON,
                (this.allZones[i].positiveDotsContainer.hitArea as Rectangle).height - POSITION_INFO.DOT_RAYON),
            ];
            this.addDot(i + 1, dotPos, true, SPRITE_COLOR.RED);
          }
          break;
        }
      }
    }
  }

  public removeDotsFromStateChange(positivePowerZoneDots: Array<IDotVOHash<DotVO>>,
                                   negativePowerZoneDots: Array<IDotVOHash<DotVO>>): void {
    // console.log('removeDotsFromStateChange', positivePowerZoneDots[0]);
    for (let i: number = 0; i < this.allZones.length; i += 1) {
      /* console.log('removeDotsFromStateChange',
       i,
       Object.keys(this.props.positivePowerZoneDots[i]).length);*/
      let removedDots: DotVO[] = this.allZones[i].removeDotsIfNeeded(positivePowerZoneDots[i], true);
      removedDots.forEach((dot: DotVO) => {
        if (dot.sprite) {
          this.removeDotSpriteListeners(dot.sprite);
          this.spritePool.dispose(dot.sprite, dot.isPositive, dot.color);
        }
      });
      removedDots = this.allZones[i].removeDotsIfNeeded(negativePowerZoneDots[i], false);
      removedDots.forEach((dot) => {
        if (dot.sprite) {
          this.removeDotSpriteListeners(dot.sprite);
        }
      });
    }
    this.checkIfNotDisplayedSpriteCanBe();
  }

  public setZoneTextAndAlphaStatus(): void {
    // Don't display leading zeroes
    let zoneIsEmpty: boolean = true;
    for (let i = this.totalZoneCount - 1; i >= 0; i -= 1) {
      zoneIsEmpty = this.allZones[i].checkTextAndAlpha(zoneIsEmpty);
    }
    zoneIsEmpty = true;
    if (this.operatorMode === OPERATOR_MODE.DIVIDE) {
      for (let i = this.totalZoneCount - 1; i >= 0; i -= 1) {
        zoneIsEmpty = this.allZones[i].checkDivideResultText(zoneIsEmpty);
      }
    }
  }

  public addDotsFromStateChange(positivePowerZoneDots: Array<IDotVOHash<DotVO>>,
                                negativePowerZoneDots: Array<IDotVOHash<DotVO>>): void {
    // console.log('addDotsFromStateChange1');
    let allDots: DotVO[] = new Array<DotVO>();
    for (let i = 0; i < this.allZones.length; i += 1) {
      allDots = allDots.concat(
        this.allZones[i].addDotsFromStateChange(
          positivePowerZoneDots[i],
          negativePowerZoneDots[i]));
    }
    allDots.forEach((dot: DotVO) => {
      if (dot.sprite) {
        // When the dot need to move after being add, I can't set their properties right away.
        if (dot.actionType !== DOT_ACTIONS.NEW_DOT_FROM_MOVE) {
          this.addDotSpriteProperty(dot.sprite, dot);
        }
      }
    });
  }

  public adjustDividerDotFromStateChange(positiveDividerDots: Array<IDividerDotVOHash<DividerDotVO>>,
                                         negativeDividerDots: Array<IDividerDotVOHash<DividerDotVO>>): void {
    this.dividerZoneManager.removeDots(positiveDividerDots, negativeDividerDots);
    this.dividerZoneManager.addDots(positiveDividerDots, negativeDividerDots);
  }

  public populateDivideResult(positiveDividerResult: number[],
                              negativeDividerResult: number[]): void {
    // console.log('populateDivideResult', positiveDividerResult, negativeDividerResult);
    const positiveDots: number[] = new Array<number>();
    const negativeDots: number[] = new Array<number>();
    this.allZones.forEach((zone: PowerZone) => {
      positiveDots.push(Object.keys(zone.positiveDots).length);
      negativeDots.push(Object.keys(zone.negativeDots).length);
      zone.setDivisionValue(
        positiveDividerResult[zone.zonePosition],
        negativeDividerResult[zone.zonePosition]);
    });
    /*positiveDots.reverse();
    negativeDots.reverse();
    this.dividerResult.update(
      positiveDividerResult.slice(0).reverse(),
      negativeDividerResult.slice(0).reverse(),
      positiveDots,
      negativeDots);*/
  }

  public showDividerAndResult(): void {
    this.dividerZoneManager.x = 957;
    this.dividerZoneManager.y = 375;
    this.addChild(this.dividerZoneManager);
    this.dividerZoneManager.start();

    /*this.dividerResult.x = 100;
    this.dividerResult.y = 400;
    this.addChild(this.dividerResult);*/
  }

  public checkInstability(): void {
    let isOverload: boolean;
    let overloadExist: boolean = false;
    let isSignInstability: boolean;
    let instabilityExist: boolean = false;
    this.allZones.forEach((zone: PowerZone) => {
      isOverload = zone.checkOvercrowding();
      if (overloadExist === false) {
        overloadExist = isOverload;
      }
      // overloadExist === false ? overloadExist = isOverload : false;
      if (this.negativePresent) {
        isSignInstability = zone.checkPositiveNegativePresence(isOverload);
        if (instabilityExist === false) {
          instabilityExist = isSignInstability;
        }
        // instabilityExist === false ? instabilityExist = isSignInstability : false;
      }
    });
    /*if (overloadExist) {
      this.soundManager.playSound(SoundManager.BOX_OVERLOAD);
    } else if (instabilityExist) {
      this.soundManager.playSound(SoundManager.BOX_POSITIVE_NEGATIVE);
    } else {
      this.soundManager.stopSound(SoundManager.BOX_OVERLOAD);
      this.soundManager.stopSound(SoundManager.BOX_POSITIVE_NEGATIVE);
    }*/
  }

  public checkResult(): void {
    // console.log('checkResult', this.wantedResult);
    if (this.isUserActionComplete) { // Validate result only when all part of the operation are complete
      let zone: PowerZone;
      let zoneSuccess: number = 0;
      for (let i = 0; i < this.allZones.length; i += 1) {
        zone = this.allZones[i];
        zone.precalculateDotsForDivision();
        if (this.operatorMode === OPERATOR_MODE.DIVIDE) {
          let success = true;
          if (this.wantedResult.positiveDots && this.wantedResult.positiveDots.length > 0) {
            if (this.wantedResult.positiveDots[i] !== zone.positiveDotCount) {
              success = false;
            }
          }
          if (this.wantedResult.negativeDots && this.wantedResult.negativeDots.length > 0) {
            if (this.wantedResult.negativeDots[i] !== zone.negativeDotCount) {
              success = false;
            }
          }
          if (this.wantedResult.positiveDivider && this.wantedResult.positiveDivider.length > 0) {
            if (this.wantedResult.positiveDivider[i] !== zone.positiveDivisionValue) {
              success = false;
            }
          }
          if (this.wantedResult.negativeDivider && this.wantedResult.negativeDivider.length > 0) {
            if (this.wantedResult.negativeDivider[i] !== zone.negativeDivisionValue) {
              success = false;
            }
          }
          if (success) {
            zoneSuccess += 1;
          }
        } else {
          let success = true;
          if (this.wantedResult.positiveDots && this.wantedResult.positiveDots.length > 0) {
            if (this.wantedResult.positiveDots[i] !== zone.positiveDotCount) {
              success = false;
            }
          }
          if (this.wantedResult.negativeDots && this.wantedResult.negativeDots.length > 0) {
            if (this.wantedResult.negativeDots[i] !== zone.negativeDotCount) {
              success = false;
            }
          }
          if (success) {
            zoneSuccess += 1;
          }
        }
      }
      if (zoneSuccess === this.allZones.length) {
        if (this.successAction) {
          this.successAction(this.title);
        }
        this.activitySuccessFunc();
      }
    }
  }

  public removeOutDotAfterAnim(originalZoneIndex: number,
                               dotSprite: DotSprite): void {
    dotSprite.stopOut();
    this.removeDot(originalZoneIndex, dotSprite.dot.id);
    this.removeGhostDot(dotSprite);
  }

  public reset(): void {
    // console.log('PowerZoneManager reset');
    this.isUserActionComplete = true;
    TweenMax.killAll(true);
    if (this.allZones != null) {
      this.allZones.forEach((zone) => {
        zone.reset();
      });
    }
    if (this.dividerZoneManager != null) {
      this.dividerZoneManager.reset();
    }
    if (this.soundManager != null) {
      this.soundManager.stopSound(SoundManager.BOX_OVERLOAD);
      this.soundManager.stopSound(SoundManager.BOX_POSITIVE_NEGATIVE);
    }
  }

  public destroy(): void {
    this.reset();
    this.ticker.stop();
    let key: string; // tslint:disable-line prefer-const
    if (this.allZones) {
      this.allZones.forEach((zone) => {
        for (key in zone.positiveDots) {
          if (zone.positiveDots[key].sprite) {
            this.removeDotSpriteListeners(zone.positiveDots[key].sprite);
          }
        }
        for (key in zone.negativeDots) {
          if (zone.negativeDots[key].sprite) {
            this.removeDotSpriteListeners(zone.negativeDots[key].sprite);
          }
        }
        zone.eventEmitter.off(PowerZone.CREATE_DOT, this.createDot, this);
        zone.eventEmitter.off(PowerZone.DIVIDER_OVERLOAD, this.balanceDivider, this);
        zone.destroy();
      });
    }
    if (this.dividerZoneManager) {
      this.dividerZoneManager.stop();
      this.dividerZoneManager.eventEmitter.off(DividerZoneManager.START_DRAG,
        this.precalculateForDivision,
        this);
      this.dividerZoneManager.eventEmitter.off(DividerZoneManager.MOVED,
        this.checkIfDivisionPossible,
        this);
      this.dividerZoneManager.eventEmitter.off(DividerZoneManager.END_DRAG,
        this.checkIfDivisionPossible,
        this);
    }
  }

  private checkIfDivisionPossible(data: InteractionData,
                                  allZonesValue: number[][],
                                  isDragEnd = false): void {
        // console.log('checkIfDivisionPossible', allZonesValue);
    if (this.isInteractive) {
      const zoneOverInfo: IZoneUnderCursor = this.getZoneUnderCursor(data) as IZoneUnderCursor;
      const droppedOnPowerZone: PIXI.Container | null = zoneOverInfo.droppedOnPowerZone;
      const droppedOnPowerZoneIndex: number = zoneOverInfo.droppedOnPowerZoneIndex;

      this.allZones.forEach((zone) => {
        zone.setBackgroundColor(PowerZone.BG_NEUTRAL);
      });
      // console.log('droppedOnPowerZone', droppedOnPowerZone);
      if (droppedOnPowerZone !== null) {
        // console.log(droppedOnPowerZoneIndex, allZonesValue.length, this.totalZoneCount);
        if ((this.totalZoneCount - droppedOnPowerZoneIndex >= allZonesValue.length) === false) {
          if (isDragEnd === false) {
            (droppedOnPowerZone.parent as PowerZone).setBackgroundColor(PowerZone.BG_RED);
            for (let i = 0; i < allZonesValue.length; i += 1) {
              if (this.allZones[droppedOnPowerZoneIndex + i] !== undefined) {
                this.allZones[droppedOnPowerZoneIndex + i].setBackgroundColor(PowerZone.BG_RED);
              }
            }
          } else {
            (droppedOnPowerZone.parent as PowerZone).setBackgroundColor(PowerZone.BG_NEUTRAL);
          }
        } else {
          let success: boolean = false;
          let antiSuccess: boolean = false;
          if (this.base[1] === BASE.BASE_X) {
            const divisionSuccess: boolean[] = this.testAlgebraDivisionSuccess(
              allZonesValue,
              droppedOnPowerZoneIndex);
            success = divisionSuccess[0];
            antiSuccess = divisionSuccess[1];
          }else {
            const divisionSuccess: boolean[] = this.testNormalDivisionSuccess(
              allZonesValue,
              droppedOnPowerZoneIndex);
            success = divisionSuccess[0];
            antiSuccess = divisionSuccess[1];
          }
          // console.log(success, antiSuccess);
          for (let i = 0; i < allZonesValue.length; i += 1) {
            const affectedZone = this.allZones[droppedOnPowerZoneIndex + i];
            if ((success || antiSuccess) && isDragEnd === false) {
              affectedZone.setBackgroundColor(PowerZone.BG_GREEN);
            } else if (affectedZone !== undefined) {
              affectedZone.setBackgroundColor(PowerZone.BG_RED);
            }
          }
          if (isDragEnd === true) {
            // apply division
            this.allZones.forEach((zone: PowerZone) => {
              zone.setBackgroundColor(PowerZone.BG_NEUTRAL);
            });
            if (success || antiSuccess) {
              this.applyDivision(
                success,
                antiSuccess,
                allZonesValue,
                droppedOnPowerZoneIndex,
                zoneOverInfo.actualZone as PowerZone);
            } else {
              this.soundManager.playSound(SoundManager.DIVISION_IMPOSSIBLE);
            }
          }
        }
      } else if (isDragEnd === true) {
        this.soundManager.playSound(SoundManager.DIVISION_BACKINTOPLACE);
      }
    }
  }

  private testNormalDivisionSuccess(allZonesValue: number[][],
                                    droppedOnPowerZoneIndex: number): boolean[] {
    const success: boolean[] = [false, false];
    for (let i = 0; i < allZonesValue.length; i += 1) {
      const affectedZone = this.allZones[droppedOnPowerZoneIndex + i];
      if (allZonesValue[i][0] <= affectedZone.positiveDotCount &&
        allZonesValue[i][1] <= affectedZone.negativeDotCount) {
        success[0] = true;
      } else {
        success[0] = false;
        if (allZonesValue[i][1] <= affectedZone.positiveDotCount &&
          allZonesValue[i][0] <= affectedZone.negativeDotCount) {
          success[1] = true;
        } else {
          success[1] = false;
        }
      }
      if (success[0] === false && success[1] === false) {
        break;
      }
    }
    return success;
  }

  private testAlgebraDivisionSuccess(allZonesValue: number[][],
                                     droppedOnPowerZoneIndex: number): boolean[] {
    const success: boolean[] = [];
    const antiSuccess: boolean[] = [];
    for (let i = 0; i < allZonesValue.length; i += 1) {
      const affectedZone: PowerZone = this.allZones[droppedOnPowerZoneIndex + i];
      if (allZonesValue[i][0] <= affectedZone.positiveDotCount &&
        allZonesValue[i][1] <= affectedZone.negativeDotCount) {
        success[i] = true;
      }else {
        success[i] = false;
      }
      if (allZonesValue[i][1] <= affectedZone.positiveDotCount &&
        allZonesValue[i][0] <= affectedZone.negativeDotCount) {
        antiSuccess[i] = true;
      } else {
        antiSuccess[i] = false;
      }
    }
    // console.log(success, antiSuccess);
    // return a success only when all the value are true in a test array
    return [success.indexOf(false) === -1, antiSuccess.indexOf(false) === -1];
  }

  private applyDivision(success: boolean,
                        antiSuccess: boolean,
                        allZonesValue: number[][],
                        droppedOnPowerZoneIndex: number,
                        actualZone: PowerZone): void {
    this.soundManager.playSound(SoundManager.DIVISION_SUCCESS);
    const dotsRemovedByZone: DotVO[][] = new Array<DotVO[]>();
    for (let i: number = 0; i < this.totalZoneCount; i += 1) {
      dotsRemovedByZone.push(new Array<DotVO>());
    }
    let dotsToMove: DotVO[] = new Array<DotVO>();
    for (let i: number = 0; i < allZonesValue.length; i += 1) {
      let thisZoneDots: DotVO[] = new Array<DotVO>();
      const affectedZone: PowerZone = this.allZones[droppedOnPowerZoneIndex + i];
      if (success) {
        thisZoneDots = thisZoneDots.concat(
          affectedZone.getDotsForDivision(allZonesValue[i][0],
            true),
        );
        thisZoneDots = thisZoneDots.concat(
          affectedZone.getDotsForDivision(allZonesValue[i][1],
            false),
        );
      } else if (antiSuccess) {
        thisZoneDots = thisZoneDots.concat(
          affectedZone.getDotsForDivision(allZonesValue[i][0],
            false),
        );
        thisZoneDots = thisZoneDots.concat(
          affectedZone.getDotsForDivision(allZonesValue[i][1],
            true),
        );
      }
      dotsToMove = dotsToMove.concat(thisZoneDots);
      dotsRemovedByZone[droppedOnPowerZoneIndex + i] = dotsRemovedByZone[droppedOnPowerZoneIndex + i].concat(thisZoneDots); // tslint:disable-line  max-line-length
    }
    const colorMatrix: ColorMatrixFilter = getAColorFilter();
    if (dotsToMove.length > 0) {
      dotsToMove.forEach((dot: DotVO) => {
        let newPosition: Point = dot.sprite.parent.toGlobal(dot.sprite.position as Point);
        newPosition = this.movingDotsContainer.toLocal(newPosition);

        // this is the ghost of dots to show group with specific color
        let groupSprite: Sprite;
        if (dot.isPositive) {
          groupSprite = new Sprite(this.textures['grouped_dot.png']);
        } else {
          groupSprite = new Sprite(this.textures['grouped_antidot.png']);
        }
        groupSprite.anchor.set(0.5);
        groupSprite.filters = [colorMatrix];
        groupSprite.position.x = dot.sprite.position.x;
        groupSprite.position.y = dot.sprite.position.y;
        this.allZones[dot.powerZone].divisionGhostContainer.addChild(groupSprite);

        const movingSprite: DotSprite = this.spritePool.getOne(dot.color, dot.isPositive);
        movingSprite.position.x = newPosition.x;
        movingSprite.position.y = newPosition.y;
        this.movingDotsContainer.addChild(movingSprite);
        const sprite: DotSprite = dot.sprite;
        sprite.alpha = 0;
        let finalPosition: Point;
        // if (success) {
        finalPosition = this.allZones[droppedOnPowerZoneIndex].toGlobal(
          this.allZones[droppedOnPowerZoneIndex].getDivisionTextPosition(),
        );
        finalPosition = this.movingDotsContainer.toLocal(finalPosition);
        TweenMax.to(
          movingSprite.scale,
          TWEEN_TIME.DIVISION_DOT_SELECT_SCALE,
          {
            ease: Power0.easeNone,
            repeat: 3,
            x: 1.5,
            y: 1.5,
            yoyo: true,
          },
        );
        TweenMax.to(
          movingSprite,
          TWEEN_TIME.DIVISION_DOT_MOVE,
          {
            delay: TWEEN_TIME.DIVISION_DOT_SELECT_SCALE * 4,
            ease: Power4.easeOut,
            onComplete: this.removeDotsAfterTween.bind(this),
            onCompleteParams: [movingSprite, dot],
            x: finalPosition.x + 15,
            y: finalPosition.y + (success ? 15 : 25),
          },
        );
      });
      TweenMax.delayedCall(
        TWEEN_TIME.DIVISION_DOT_SELECT_SCALE * 4 + TWEEN_TIME.DIVISION_DOT_MOVE,
        this.processDivisionAfterTween.bind(this),
        [dotsRemovedByZone, actualZone, success]);
    }
  }

  private removeDotsAfterTween(sprite: DotSprite, dot: DotVO): void {
    this.movingDotsContainer.removeChild(sprite);
    this.spritePool.dispose(sprite, dot.isPositive, dot.color);
  }

  private processDivisionAfterTween(dotsRemovedByZone: DotVO[][],
                                    moveToZone: PowerZone,
                                    isPositive: boolean): void {
    // console.log('processDivisionAfterTweenA', moveToZone.positiveDivisionValue);
    for (let i: number = 0; i < dotsRemovedByZone.length; i += 1) {
      if (dotsRemovedByZone[i].length > 0) {
        this.removeMultipleDots(i, dotsRemovedByZone[i], false);
      }
    }
    if (isPositive) {
      this.setDivisionResult(
          moveToZone.zonePosition,
          moveToZone.positiveDivisionValue + 1,
          isPositive);
    } else {
      this.setDivisionResult(
          moveToZone.zonePosition,
          moveToZone.negativeDivisionValue + 1,
          isPositive);
    }
  }

  private balanceDivider(zonePos: number,
                         isPositive: boolean): void {
    this.isInteractive = false;
    let newPosition: Point;
    let finalPosition: Point;
    const allMovingDots: PIXI.Sprite[] = new Array<PIXI.Sprite>();
    newPosition = this.allZones[zonePos].toGlobal(this.allZones[zonePos].getDivisionTextPosition()); // tslint:disable-line max-line-length
    finalPosition = this.allZones[zonePos + 1].toGlobal(this.allZones[zonePos + 1].getDivisionTextPosition()); // tslint:disable-line max-line-length
    for (let i = 0; i < this.base[1]; i += 1) {
      allMovingDots.push(new PIXI.Sprite(this.textures['grouped_dot.png']));
    }
    /* else {
      newPosition = this.allZones[zonePos].toGlobal(this.allZones[zonePos].negativeDivideCounter.position as Point); // tslint:disable-line max-line-length
      finalPosition = this.allZones[zonePos + 1].toGlobal(this.allZones[zonePos + 1].negativeDivideCounter.position as Point); // tslint:disable-line max-line-length
      for (let i = 0; i < this.base[1]; i += 1) {
        allMovingDots.push(new Sprite(this.textures['grouped_antidot.png']));
      }
    }*/
    newPosition = this.movingDotsContainer.toLocal(newPosition);
    finalPosition = this.movingDotsContainer.toLocal(finalPosition);
    let delay: number = 0;
    allMovingDots.forEach((sprite) => {
      sprite.anchor.set(0.5);
      const position: Point | ObservablePoint = sprite.position;
      position.x = newPosition.x + 15;
      position.y = newPosition.y + 15;
      this.movingDotsContainer.addChild(sprite);
      TweenMax.to(
        sprite,
        TWEEN_TIME.DIVISION_BALANCE_DIVIDER,
        {
          delay,
          ease: Power4.easeOut,
          onComplete: PowerZoneManager.removeDotsAfterTween,
          onCompleteParams: [sprite],
          x: finalPosition.x + 15,
          y: finalPosition.y + 15,
        },
      );
      delay += 0.1;
    });
    this.soundManager.playSound(SoundManager.DIVISION_OVERLOAD);
    TweenMax.delayedCall(
        delay + TWEEN_TIME.DIVISION_BALANCE_DIVIDER,
        this.setDividerValueAfterBalance,
        [zonePos, isPositive],
        this);
  }

  private setDividerValueAfterBalance(zonePos: number,
                                      isPositive: boolean): void {
        // console.log(zonePos, this.allZones[zonePos]);
    this.setDivisionResult(zonePos, 0, isPositive);
    if (isPositive) {
      this.setDivisionResult(
          zonePos + 1,
          this.allZones[zonePos + 1].positiveDivisionValue + 1,
          isPositive);
    } else {
      this.setDivisionResult(
          zonePos + 1,
          this.allZones[zonePos + 1].negativeDivisionValue + 1,
          isPositive);
    }
    this.allZones[zonePos].onDividerOverloadSolved(isPositive);
    this.allZones[zonePos + 1].onDividerAutoPopulated(isPositive);
    this.isInteractive = true;
  }

  private createDot(target: DotsContainer,
                    position: number[],
                    color: ISPRITE_COLOR): void {
        // console.log(target.powerZone);
    if (this.isInteractive) {
      if (this.operatorMode === OPERATOR_MODE.DIVIDE && this.base[1] === BASE.BASE_X) {
                // Add a opposite value dot in the same zone for division in base X
        this.soundManager.playSound(SoundManager.ADD_DIVISION_DOT);
        if (target.isPositive) {
          this.addDot(target.powerZone, position, target.isPositive, color, DOT_ACTIONS.NEW_DOT_ANTIDOT_FROM_CLICK);
          const dotPos: number[] = [
            randomFromTo(
                POSITION_INFO.DOT_RAYON,
              //  tslint:disable-next-line max-line-length
              ((target.parent as PowerZone).negativeDotsContainer.hitArea as Rectangle).width - POSITION_INFO.DOT_RAYON),
            randomFromTo(
                POSITION_INFO.DOT_RAYON,
              //  tslint:disable-next-line max-line-length
                ((target.parent as PowerZone).negativeDotsContainer.hitArea as Rectangle).height - POSITION_INFO.DOT_RAYON),
          ];
          this.addDot(target.powerZone, dotPos, !target.isPositive, color, DOT_ACTIONS.NEW_DOT_ANTIDOT_FROM_CLICK);
        } else {
          this.addDot(target.powerZone, position, target.isPositive, color, DOT_ACTIONS.NEW_DOT_ANTIDOT_FROM_CLICK);
          const dotPos: number[] = [
            randomFromTo(
                POSITION_INFO.DOT_RAYON,
              //  tslint:disable-next-line max-line-length
                ((target.parent as PowerZone).positiveDotsContainer.hitArea as Rectangle).width - POSITION_INFO.DOT_RAYON),
            randomFromTo(
                POSITION_INFO.DOT_RAYON,
              //  tslint:disable-next-line max-line-length
                ((target.parent as PowerZone).positiveDotsContainer.hitArea as Rectangle).height - POSITION_INFO.DOT_RAYON),
          ];
          this.addDot(target.powerZone, dotPos, !target.isPositive, color, DOT_ACTIONS.NEW_DOT_ANTIDOT_FROM_CLICK);
        }
      } else {
        // console.log('here', target.powerZone, position, target.isPositive, color);
        this.soundManager.playSound(`${SoundManager.ADD_DOT}_${target.powerZone + 1}`);
        this.addDot(target.powerZone, position, target.isPositive, color, DOT_ACTIONS.NEW_DOT_FROM_CLICK);
      }
    }
  }

  private addDotSpriteProperty(dotSprite: DotSprite,
                               dot?: DotVO): void {
    if (dot) {
      dotSprite.x = dot.x;
      dotSprite.y = dot.y;
      this.allZones[dot.powerZone].addToProximityManager(dotSprite);
    }
    dotSprite.interactive = true;
    dotSprite.buttonMode = true;
    dotSprite.world = this;
    dotSprite.on('pointerdown', this.onDragStart);
    dotSprite.on('pointerup', this.onDragEnd);
    dotSprite.on('pointerupoutside', this.onDragEnd);
    dotSprite.on('pointermove', this.onDragMove);
  }

  private removeDotSpriteListeners(sprite: DotSprite): void {
    sprite.off('pointerdown', this.onDragStart);
    sprite.off('pointerup', this.onDragEnd);
    sprite.off('pointerupoutside', this.onDragEnd);
    sprite.off('pointermove', this.onDragMove);
    this.allZones[sprite.dot.powerZone].removeFromProximityManager(sprite);
  }

  private onDragStart(this: DotSprite,
                      e: InteractionEvent): void {
    // console.log('onDragStart', this.dot.id, this.dragging);
    if (this.world.isInteractive && this.dragging === false) {
      const oldParent: DisplayObjectContainer = this.parent;
      this.world.allZones[this.dot.powerZone].removeFromProximityManager(this);
      this.origin = new Point(this.x, this.y);
      this.data = e.data;
      this.dragging = true;
      this.world.movingDotsContainer.addChild(this);
      const newPosition: Point = this.data.getLocalPosition(this.parent);
      const originDiff: Point = this.data.getLocalPosition(oldParent);
      this.originInMovingContainer = newPosition;
      this.originInMovingContainer.x += this.origin.x - originDiff.x;
      this.originInMovingContainer.y += this.origin.y - originDiff.y;
      this.position.x = newPosition.x;
      this.position.y = newPosition.y;
      this.world.addGhostDot(this);
      if (this.dot.color === SPRITE_COLOR.RED) {
        this.particleEmitter = this.world.dragParticleEmitterRed;
      } else {
        this.particleEmitter = this.world.dragParticleEmitterBlue;
      }
      this.particleEmitter.resetPositionTracking();
      this.particleEmitter.updateOwnerPos(newPosition.x, newPosition.y);
      this.particleEmitter.start();
    }
  }

  private onDragMove(this: DotSprite,
                     e: InteractionEvent): void {
    // console.log('onDragMove', this.dot.id);
    if (this.world.isInteractive && this.dragging) {
      const newPosition: Point = this.data.getLocalPosition(this.parent);
      this.position.x = newPosition.x;
      this.position.y = newPosition.y;
      this.particleEmitter.updateOwnerPos(newPosition.x, newPosition.y);
      if (this.world.negativePresent) {
        const zoneOverInfo: IZoneUnderCursor = this.world.getZoneUnderCursor(e.data) as IZoneUnderCursor;
        const droppedOnPowerZoneIndex: number = zoneOverInfo.droppedOnPowerZoneIndex;
        const originalZoneIndex: number = this.dot.powerZone;
        if (originalZoneIndex === droppedOnPowerZoneIndex) {
          const droppedOnPowerZone: DotsContainer = zoneOverInfo.droppedOnPowerZone as DotsContainer;
          if (this.dot.isPositive !== droppedOnPowerZone.isPositive) {
            // Select dot / anti dot for shaking
            this.world.dotAntidotSelect(this, originalZoneIndex);
          }else {
            if (this.shakingDotForAnnihilation !== null) {
              this.shakingDotForAnnihilation.stopWiggle();
              this.shakingDotForAnnihilation = null;
            }
          }
        }else {
          if (this.shakingDotForAnnihilation !== null) {
            this.shakingDotForAnnihilation.stopWiggle();
            this.shakingDotForAnnihilation = null;
          }
        }
      }
    }
  }

  private onDragEnd(this: DotSprite,
                    e: InteractionEvent): void {
    // console.log('onDragEnd', this.dot.id);
    if (this.world.isInteractive && this.dragging) {
      this.dragging = false;
      this.particleEmitter.stop();
      // dotSprite.data = null;
      this.world.verifyDroppedOnZone(this, e.data);
      // dot may have been remove if dropped outside the boxes in freeplay,
      // Or destroyed on other occasions,
      // so verify if it's still have a sprite in dotVO
      if (this.dot.sprite) {
        // wait for the sprite to be back in place if dropped on an edge
        TweenMax.delayedCall(
          TWEEN_TIME.MOVE_FROM_EDGE_INTO_BOX + 0.01,
          this.world.allZones[this.dot.powerZone].addToProximityManager,
          [this],
          this.world.allZones[this.dot.powerZone],
        );
      }
    }
    e.stopPropagation();
  }

  private addGhostDot(dotSprite: DotSprite): void {
    // console.log('addGhostDot', dotSprite.dot.id);
    const ghostSprite: DotSprite = this.spritePool.getOne(dotSprite.dot.color, dotSprite.dot.isPositive);
    ghostSprite.alpha = 0.2;
    ghostSprite.x = dotSprite.x;
    ghostSprite.y = dotSprite.y;
    this.movingDotsContainer.addChild(ghostSprite);
    dotSprite.ghost = ghostSprite;
  }

  private removeGhostDot(dotSprite: DotSprite): void {
    if (dotSprite.ghost) {
      this.movingDotsContainer.removeChild(dotSprite.ghost);
      dotSprite.ghost.alpha = 1;
      this.spritePool.dispose(dotSprite.ghost, dotSprite.dot.isPositive, dotSprite.dot.color);
    }
    dotSprite.ghost = null;
  }

  private dragGhostToNewZone(dotSprite: DotSprite, gotoPosition: Point): void {
    // console.log('dragGhostToNewZone', dotSprite.dot.id);
    if (dotSprite.ghost) {
      dotSprite.ghost.playExplode();
    }
    TweenMax.to(
      dotSprite.ghost,
      TWEEN_TIME.MOVE_DOT_TO_NEW_ZONE,
      {
        ease: Power3.easeIn,
        onComplete: this.removeGhostDot.bind(this),
        onCompleteParams: [dotSprite],
        x: gotoPosition.x,
        y: gotoPosition.y,
      },
    );
  }

  private verifyDroppedOnZone(dotSprite: DotSprite,
                              data: InteractionData): void {
    // console.log('verifyDroppedOnZone', dotSprite, data);
    const originalZoneIndex: number = dotSprite.dot.powerZone;
    const zoneOverInfo: IZoneUnderCursor = this.getZoneUnderCursor(data) as IZoneUnderCursor;
    const droppedOnPowerZone: DotsContainer = zoneOverInfo.droppedOnPowerZone as DotsContainer;
    const droppedOnPowerZoneIndex: number = zoneOverInfo.droppedOnPowerZoneIndex;
    // has been dropped outside a zone?
    if (droppedOnPowerZoneIndex !== -1 && droppedOnPowerZone !== null) {
      // impossible to move between different signed value zone (positive to negative)
      if (droppedOnPowerZoneIndex !== originalZoneIndex) {
        // impossible to move between powerZone in base X
        if (
          droppedOnPowerZone.isPositive === dotSprite.dot.isPositive &&
          this.base[1] !== BASE.BASE_X
        ) {
          this.moveBetweenZone(dotSprite, data, originalZoneIndex, droppedOnPowerZone, droppedOnPowerZoneIndex);
        } else {
          if (droppedOnPowerZone.isPositive !== dotSprite.dot.isPositive) {
            this.moveImpossible(MOVE_IMPOSSIBLE.POSITIVE_TO_NEGATIVE, dotSprite, originalZoneIndex);
          }else if (this.base[1] === BASE.BASE_X) {
            this.moveImpossible(MOVE_IMPOSSIBLE.BASE_X, dotSprite, originalZoneIndex);
          }
        }
      } else if (droppedOnPowerZoneIndex === originalZoneIndex) {
        if (dotSprite.dot.isPositive === droppedOnPowerZone.isPositive) {
          // just move the dots into the zone
          this.moveIntoSameZone(dotSprite, data, droppedOnPowerZone);
        } else if (dotSprite.dot.isPositive !== droppedOnPowerZone.isPositive) {
          // check it possible dot / anti dot destruction
          this.dotAntidotDestruction(dotSprite, originalZoneIndex);
        }
      }
    } else if (droppedOnPowerZoneIndex === -1 || droppedOnPowerZone === null) {
      // Dropped outside any zone
      this.droppedOutsideZone(dotSprite, droppedOnPowerZone, originalZoneIndex);
    }
    this.checkInstability();
  }

  private moveBetweenZone(dotSprite: DotSprite,
                          data: InteractionData,
                          originalZoneIndex: number,
                          droppedOnPowerZone: DotsContainer,
                          droppedOnPowerZoneIndex: number): void {
    const diffZone: number = originalZoneIndex - droppedOnPowerZoneIndex;
    let dotsToRemoveCount: number = 1;
    // console.log(originalZoneIndex, droppedOnPowerZoneIndex, diffZone);
    if (diffZone < 0) {
      dotsToRemoveCount = Math.pow(Number(this.base[1]), diffZone * -1);
    } else {
      dotsToRemoveCount = this.base[0] as number;
    }
    // console.log('dotsToRemoveCount', dotsToRemoveCount);
    // check if possible
    let finalNbOfDots: number = -1;
    if (dotSprite.dot.isPositive) {
      finalNbOfDots = Object.keys(this.allZones[originalZoneIndex].positiveDots).length - dotsToRemoveCount; // tslint:disable-line max-line-length
    } else {
      finalNbOfDots = Object.keys(this.allZones[originalZoneIndex].negativeDots).length - dotsToRemoveCount; // tslint:disable-line max-line-length
    }
    // console.log('finalNbOfDots', finalNbOfDots);
    if (finalNbOfDots < 0 || (this.base[0] > 1 && Math.abs(diffZone) > 1)) {
      if (finalNbOfDots < 0) {
        this.moveImpossible(MOVE_IMPOSSIBLE.NOT_ENOUGH_DOTS, dotSprite, originalZoneIndex);
      } else if (this.base[0] > 1 && Math.abs(diffZone) > 1) {
        this.moveImpossible(MOVE_IMPOSSIBLE.MORE_THAN_ONE_BASE, dotSprite, originalZoneIndex);
      }
      return;
    }

    // The current dot will be rezone, thus remove one (1) from the amount to be removed
    dotsToRemoveCount -= 1;

    let newNbOfDots: number = Math.pow(this.base[1] as number, diffZone);
    newNbOfDots -= this.base[0] as number;

    if (newNbOfDots === 0 && dotsToRemoveCount === 0) {
      this.isUserActionComplete = true;
    } else {
      this.isUserActionComplete = false;
    }

    // rezone current dot
    this.addDraggedToNewZone(
      dotSprite,
      droppedOnPowerZone,
      data.getLocalPosition(droppedOnPowerZone),
      false);

    if (newNbOfDots > 0 && dotsToRemoveCount === 0) {
      this.isUserActionComplete = true;
    }

    // Add the new dots
    if (newNbOfDots > 0) {
      this.removeGhostDot(dotSprite);
      const dotsPos: Point[] = new Array<Point>();
      for (let i = 0; i < newNbOfDots; i += 1) {
        dotsPos.push( new Point(
          randomFromTo(
            POSITION_INFO.DOT_RAYON,
            (droppedOnPowerZone.hitArea as Rectangle).width - POSITION_INFO.DOT_RAYON,
          ),
          randomFromTo(
            POSITION_INFO.DOT_RAYON,
            (droppedOnPowerZone.hitArea as Rectangle).height - POSITION_INFO.DOT_RAYON,
          )),
        );
      }
      this.soundManager.playSound(SoundManager.DOT_EXPLODE);
      this.addMultipleDots(
        droppedOnPowerZoneIndex,
        dotsPos,
        dotSprite.dot.isPositive,
        dotSprite.dot.color,
        dotSprite.position);
    }

    this.isUserActionComplete = true;

    // Move dots from higher zone to lower zone
    if (dotsToRemoveCount > 0) {
      const dataLocalZone: Point = data.getLocalPosition(droppedOnPowerZone);
      this.tweenDotsToNewZone(
        originalZoneIndex,
        droppedOnPowerZone,
        dotsToRemoveCount,
        dataLocalZone,
        dotSprite);
    }
  }

  private moveImpossible(type: string,
                         dotSprite: DotSprite,
                         originalZoneIndex: number): void {
    // console.log('moveImpossible', type, this.displayUserMessageAction);
    if (type === MOVE_IMPOSSIBLE.POSITIVE_TO_NEGATIVE) {
      this.soundManager.playSound(SoundManager.INVALID_MOVE);
      if (this.displayUserMessageAction) {
        this.displayUserMessageAction(ERROR_MESSAGE.POSITIVE_NEGATIVE_DRAG);
      }
      this.isInteractive = false;
    } else if (type === MOVE_IMPOSSIBLE.BASE_X) {
      this.soundManager.playSound(SoundManager.INVALID_MOVE);
      if (this.displayUserMessageAction) {
        this.displayUserMessageAction(ERROR_MESSAGE.BASE_X_DRAG);
      }
      this.isInteractive = false;
    }else if (type === MOVE_IMPOSSIBLE.NOT_ENOUGH_DOTS) {
      // this.soundManager.playSound(SoundManager.NOT_ENOUGH_DOTS);
      if (this.displayUserMessageAction) {
        this.displayUserMessageAction(ERROR_MESSAGE.NO_ENOUGH_DOTS);
      }
    }else if (type === MOVE_IMPOSSIBLE.MORE_THAN_ONE_BASE) {
      this.soundManager.playSound(SoundManager.INVALID_MOVE);
      if (this.displayUserMessageAction) {
        this.displayUserMessageAction(ERROR_MESSAGE.ONE_BOX_AT_A_TIME);
      }
    }
    if (dotSprite.dot.isPositive) {
      // dotSprite.playWrong(this.backIntoPlace.bind(this), this.allZones[originalZoneIndex].positiveDotsContainer);
      this.backIntoPlace(dotSprite, this.allZones[originalZoneIndex].positiveDotsContainer);
    } else {
      // dotSprite.playWrong(this.backIntoPlace.bind(this), this.allZones[originalZoneIndex].negativeDotsContainer);
      this.backIntoPlace(dotSprite, this.allZones[originalZoneIndex].negativeDotsContainer);
    }
  }

  private moveIntoSameZone(dotSprite: DotSprite,
                           data: InteractionData,
                           droppedOnPowerZone: DotsContainer): void {
    droppedOnPowerZone.addChild(dotSprite);
    this.removeGhostDot(dotSprite);
    const newPosition: Point = data.getLocalPosition(droppedOnPowerZone);
    const modifyPosition: Point = newPosition.clone();
    const doTween: boolean = this.checkIfOnBoxEdge(newPosition, modifyPosition, droppedOnPowerZone);
    const position: Point | ObservablePoint = dotSprite.position;
    position.x = newPosition.x;
    position.y = newPosition.y;
    if (doTween) {
      this.moveFromBoxEdge(dotSprite, modifyPosition, droppedOnPowerZone);
    }
  }

  private checkIfOnBoxEdge(position: Point, modifyPosition: Point, dotsContainer: DotsContainer): boolean {
    let needTween: boolean = false;
    if (position.x < POSITION_INFO.DOT_RAYON + 3) {
      modifyPosition.x = POSITION_INFO.DOT_RAYON + 3;
      needTween = true;
    } else if (position.x > (dotsContainer.hitArea as Rectangle).width - POSITION_INFO.DOT_RAYON) {
      modifyPosition.x = (dotsContainer.hitArea as Rectangle).width - POSITION_INFO.DOT_RAYON;
      needTween = true;
    }
    if (position.y < POSITION_INFO.DOT_RAYON + 3) {
      modifyPosition.y = POSITION_INFO.DOT_RAYON + 3;
      needTween = true;
    } else if (position.y > (dotsContainer.hitArea as Rectangle).height - POSITION_INFO.DOT_RAYON) {
      modifyPosition.y = (dotsContainer.hitArea as Rectangle).height - POSITION_INFO.DOT_RAYON;
      needTween = true;
    }
    return needTween;
  }

  private moveFromBoxEdge(dotSprite: DotSprite, modifyPosition: Point, dotsContainer: DotsContainer): void {
    TweenMax.to(
      dotSprite.position,
      TWEEN_TIME.MOVE_FROM_EDGE_INTO_BOX,
      {
        x: modifyPosition.x,
        y: modifyPosition.y,
        ease: Power3.easeOut,
        onComplete: this.allZones[dotsContainer.powerZone].addToProximityManager,
        onCompleteParams: [dotSprite],
        onCompleteScope: this.allZones[dotsContainer.powerZone],
      },
    );
  }

  private dotAntidotSelect(dotSprite: DotSprite,
                           originalZoneIndex: number): void {
    // console.log('dotAntidotSelect', this);
    if (dotSprite.dot.isPositive) {
      // Positive dot drag into negative zoe
      if (Object.keys(this.allZones[originalZoneIndex].negativeDots).length > 0) {
        const negativeSprite: DotSprite = this.allZones[originalZoneIndex].negativeDotsContainer.getChildAt(0) as DotSprite; // tslint:disable-line max-line-length
        negativeSprite.playWiggle();
        dotSprite.shakingDotForAnnihilation = negativeSprite;
      }
    }else {
      if (Object.keys(this.allZones[originalZoneIndex].positiveDots).length > 0) {
        const positiveSprite: DotSprite = this.allZones[originalZoneIndex].positiveDotsContainer.getChildAt(0) as DotSprite; // tslint:disable-line max-line-length
        positiveSprite.playWiggle();
        dotSprite.shakingDotForAnnihilation = positiveSprite;
      }
    }
  }

  private dotAntidotDestruction(dotSprite: DotSprite,
                                originalZoneIndex: number): void {
    if (dotSprite.dot.isPositive) {
      // Positive dot drag into negative zoe
      if (Object.keys(this.allZones[originalZoneIndex].negativeDots).length > 0) {
        if (dotSprite.shakingDotForAnnihilation !== null) {
          const negativeSprite: DotSprite = dotSprite.shakingDotForAnnihilation;
          negativeSprite.stopWiggle();
          const allRemovedDots: DotVO[] = new Array<DotVO>();
          allRemovedDots.push(negativeSprite.dot);
          this.removeDotSpriteListeners(negativeSprite);
          allRemovedDots.push(dotSprite.dot);
          this.removeDotSpriteListeners(dotSprite);
          this.moveAndDestructPositiveNegative(dotSprite, negativeSprite, originalZoneIndex, allRemovedDots);
        }
      } else {
        this.soundManager.playSound(SoundManager.INVALID_MOVE);
        if (this.displayUserMessageAction) {
          this.displayUserMessageAction(ERROR_MESSAGE.NO_OPPOSITE_DOTS);
        }
        this.backIntoPlace(dotSprite, this.allZones[originalZoneIndex].positiveDotsContainer);
      }
    } else if (dotSprite.dot.isPositive === false) {
      // Negative dot drag into positive zoe
      if (Object.keys(this.allZones[originalZoneIndex].positiveDots).length > 0) {
        if (dotSprite.shakingDotForAnnihilation !== null) {
          const positiveSprite: DotSprite = dotSprite.shakingDotForAnnihilation;
          positiveSprite.stopWiggle();
          const allRemovedDots: DotVO[] = new Array<DotVO>();
          allRemovedDots.push(positiveSprite.dot);
          this.removeDotSpriteListeners(positiveSprite);
          allRemovedDots.push(dotSprite.dot);
          this.removeDotSpriteListeners(dotSprite);
          this.moveAndDestructPositiveNegative(dotSprite, positiveSprite, originalZoneIndex, allRemovedDots);
        }
      } else {
        this.soundManager.playSound(SoundManager.INVALID_MOVE);
        if (this.displayUserMessageAction) {
          this.displayUserMessageAction(ERROR_MESSAGE.NO_OPPOSITE_DOTS);
        }
        this.backIntoPlace(dotSprite, this.allZones[originalZoneIndex].negativeDotsContainer);
      }
    }
  }

  private moveAndDestructPositiveNegative(dotSprite: DotSprite,
                                          otherSprite: DotSprite,
                                          originalZoneIndex: number,
                                          allRemovedDots: DotVO[]): void {
    this.removeGhostDot(dotSprite);
    // Had to wait a frame before starting the animation because checkInstability() is called after this and reset the animations.
    TweenMax.delayedCall(0.01, () => {
      otherSprite.playOut();
      dotSprite.playOut(this.removeDotAntidotAfterAnim.bind(this), originalZoneIndex, allRemovedDots);
    });
  }

  private removeDotAntidotAfterAnim(originalZoneIndex: number,
                                    allRemovedDots: DotVO[],
                                    dotSprite: DotSprite): void {
    dotSprite.stopOut();
    if (dotSprite.shakingDotForAnnihilation) {
      dotSprite.shakingDotForAnnihilation.stopOut();
    }
    dotSprite.shakingDotForAnnihilation = null;
    this.soundManager.playSound(SoundManager.DOT_ANNIHILATION);
    this.removeMultipleDots(originalZoneIndex, allRemovedDots, true);
  }

  private droppedOutsideZone(dotSprite: DotSprite,
                             droppedOnPowerZone: DotsContainer,
                             originalZoneIndex: number): void {
    if (droppedOnPowerZone === this.leftMostZone) {
      // Dropped on the fake zone at the left
      this.soundManager.playSound(SoundManager.INVALID_MOVE);
      if (this.displayUserMessageAction) {
        this.displayUserMessageAction(ERROR_MESSAGE.NO_GREATER_ZONE);
      }
      if (dotSprite.dot.isPositive) {
        this.backIntoPlace(dotSprite, this.allZones[originalZoneIndex].positiveDotsContainer);
      } else {
        this.backIntoPlace(dotSprite, this.allZones[originalZoneIndex].negativeDotsContainer);
      }
      this.isInteractive = false;
    } else if (this.usageMode === USAGE_MODE.FREEPLAY) {
      // Remove dot in freeplay
      this.soundManager.playSound(SoundManager.DOT_VANISH);
      this.removeDotSpriteListeners(dotSprite);
      dotSprite.playOut(this.removeOutDotAfterAnim.bind(this), originalZoneIndex);
    } else if (dotSprite.dot.isPositive) {
      // Put back dot in it's original place
      this.backIntoPlace(dotSprite, this.allZones[originalZoneIndex].positiveDotsContainer);
    } else {
      this.backIntoPlace(dotSprite, this.allZones[originalZoneIndex].negativeDotsContainer);
    }
  }

  private getZoneUnderCursor(data): IZoneUnderCursor | null {
    let droppedOnPowerZone: PIXI.Container | null = null;
    let droppedOnPowerZoneIndex: number = -1;
    let actualZone: PowerZone | null = null;
        // verify dropped on left test zone
    let dataLocalZone = data.getLocalPosition(this.leftMostZone);
    if (isPointInRectangle(dataLocalZone, this.leftMostZone.hitArea as Rectangle)) {
      droppedOnPowerZone = this.leftMostZone;
      return { droppedOnPowerZone, droppedOnPowerZoneIndex };
    }
    this.allZones.forEach((zone) => {
      dataLocalZone = data.getLocalPosition(zone.positiveDotsContainer);
      if (isPointInRectangle(dataLocalZone, zone.positiveDotsContainer.hitArea as Rectangle)) {
        droppedOnPowerZone = zone.positiveDotsContainer;
        droppedOnPowerZoneIndex = zone.zonePosition;
        actualZone = zone;
      }
      if (zone.negativeDotsContainer != null) {
        dataLocalZone = data.getLocalPosition(zone.negativeDotsContainer);
        if (isPointInRectangle(dataLocalZone, zone.negativeDotsContainer.hitArea as Rectangle)) {
          droppedOnPowerZone = zone.negativeDotsContainer;
          droppedOnPowerZoneIndex = zone.zonePosition;
          actualZone = zone;
        }
      }
    });
    return { actualZone, droppedOnPowerZone, droppedOnPowerZoneIndex };
  }

  private backIntoPlace(dotSprite: DotSprite,
                        currentZone: DotsContainer): void {
    this.soundManager.playSound(SoundManager.BACK_INTO_PLACE);
    this.isInteractive = false;
    TweenMax.to(
      dotSprite,
      TWEEN_TIME.DOT_BACK_INTO_PLACE,
      {
        ease: Power3.easeOut,
        onComplete: this.backIntoPlaceDone.bind(this),
        onCompleteParams: [dotSprite, currentZone],
        x: dotSprite.originInMovingContainer.x,
        y: dotSprite.originInMovingContainer.y,
      },
    );
  }

  private backIntoPlaceDone(dotSprite: DotSprite,
                            currentZone: PowerZone): void {
    currentZone.addChild(dotSprite);
    dotSprite.position = dotSprite.origin; // eslint-disable-line no-param-reassign
    this.isInteractive = true;
    dotSprite.particleEmitter.stop();
    this.removeGhostDot(dotSprite);
  }

  private addDraggedToNewZone(dotSprite: DotSprite,
                              newZone: DotsContainer,
                              positionToBeMovedTo: Point,
                              updateValue: boolean,
                              addListener?: boolean): void {
    newZone.addChild(dotSprite);

    const modifyPosition: Point = positionToBeMovedTo.clone();
    const doTween: boolean = this.checkIfOnBoxEdge(positionToBeMovedTo, modifyPosition, newZone);
    const position: Point | ObservablePoint = dotSprite.position;
    position.x = positionToBeMovedTo.x;
    position.y = positionToBeMovedTo.y;
    if (doTween) {
      this.moveFromBoxEdge(dotSprite, modifyPosition, newZone);
    }

    // Set the dot into the array here to have his position right.
    this.allZones[dotSprite.dot.powerZone].removeDotFromArray(dotSprite.dot);
    this.allZones[newZone.powerZone].addDotToArray(dotSprite.dot);
    this.rezoneDot(newZone.powerZone, dotSprite.dot, updateValue);
    // this is for 2 > 3 base where an extra dot is moved from zone to zone and need to be reactivated.
    if (addListener) {
      this.addDotSpriteProperty(dotSprite, dotSprite.dot);
    }
  }

  private tweenDotsToNewZone(originalZoneIndex: number,
                             droppedOnPowerZone: DotsContainer,
                             dotsToRemov: number,
                             positionToBeMovedTo: Point,
                             dragDotSprite: DotSprite): void {
    // console.log('tweenDotsToNewZone', positionToBeMovedTo);
    // get the original on zone
    let dotsToRemove: number = dotsToRemov;
    let dotContainer: DotsContainer;
    if (droppedOnPowerZone.isPositive) {
      dotContainer = this.allZones[originalZoneIndex].positiveDotsContainer;
    } else {
      dotContainer = this.allZones[originalZoneIndex].negativeDotsContainer;
    }
        //  For 2 > 3 base.
    if (this.base[0] > 1) {
      dotsToRemove -= ((this.base[0] as number) - 1);
      const dotsToRezone = (this.base[0] as number)  - 1;
      for (let i: number = 0; i < dotsToRezone; i += 1) {
        const dotSprite: DotSprite = dotContainer.getChildAt(0) as DotSprite;
        dotSprite.origin = new Point();
        dotSprite.origin.copy(dotSprite.position);
        const newPosition: Point = this.movingDotsContainer.toLocal(
          dotSprite.position as Point,
          dotSprite.parent,
        );
        const adjacentPosition: Point = positionToBeMovedTo.clone();
        const quadrant = findQuadrant(adjacentPosition, droppedOnPowerZone.hitArea as Rectangle);
        switch (quadrant) {
          case 0:
            adjacentPosition.x += POSITION_INFO.DOT_RAYON * 2;
            adjacentPosition.y += POSITION_INFO.DOT_RAYON * 2;
            break;
          case 1:
            adjacentPosition.x -= POSITION_INFO.DOT_RAYON * 2;
            adjacentPosition.y += POSITION_INFO.DOT_RAYON * 2;
            break;
          case 2:
            adjacentPosition.x -= POSITION_INFO.DOT_RAYON * 2;
            adjacentPosition.y -= POSITION_INFO.DOT_RAYON * 2;
            break;
          case 3:
            adjacentPosition.x += POSITION_INFO.DOT_RAYON * 2;
            adjacentPosition.y -= POSITION_INFO.DOT_RAYON * 2;
            break;
          default:
            break;
        }
        const gotoPosition: Point = this.movingDotsContainer.toLocal(
          adjacentPosition,
          droppedOnPowerZone,
        );
        dotSprite.position.x = newPosition.x;
        dotSprite.position.y = newPosition.y;
        this.movingDotsContainer.addChild(dotSprite);
        this.removeDotSpriteListeners(dotSprite);
        TweenMax.to(
          dotSprite,
          TWEEN_TIME.MOVE_DOT_TO_NEW_ZONE,
          {
            ease: Power3.easeIn,
            onComplete: this.addDraggedToNewZone.bind(this),
            onCompleteParams: [dotSprite, droppedOnPowerZone, adjacentPosition, true, true],
            x: gotoPosition.x,
            y: gotoPosition.y,
          },
        );
      }
      // this.checkIfNotDisplayedSpriteCanBe();
    }
    let allRemovedDots: DotVO[] = new Array<DotVO>();
    // tween dots to new zone
    const finalPosition: Point = this.movingDotsContainer.toLocal(positionToBeMovedTo, droppedOnPowerZone);
    let notDisplayedDotCount: number = 0;
    for (let i: number = 0; i < dotsToRemove; i += 1) {
      let dotSprite: DotSprite;
      let dot: DotVO;
      if (dotContainer.children.length > 0) {
        dotSprite = dotContainer.getChildAt(0) as DotSprite;
        dot = dotSprite.dot;
        this.removeDotSpriteListeners(dotSprite);
                // calculate the position of the sprite in the moving container
        dotSprite.origin = new Point();
        dotSprite.origin.copy(dotSprite.position);
        const newPosition = this.movingDotsContainer.toLocal(dotSprite.position as Point, dotSprite.parent);
        this.movingDotsContainer.addChild(dotSprite);
        dotSprite.position.x = newPosition.x;
        dotSprite.position.y = newPosition.y;
        dotSprite.playExplode();
        // Move the sprite
        TweenMax.to(
          dotSprite,
          TWEEN_TIME.MOVE_DOT_TO_NEW_ZONE,
          {
            ease: Power3.easeIn,
            onComplete: this.tweenDotsToNewZoneDone.bind(this),
            onCompleteParams: [dotSprite, dragDotSprite],
            x: finalPosition.x,
            y: finalPosition.y,
          },
        );
        allRemovedDots.push(dot);
        this.allZones[dot.powerZone].removeDotFromArray(dot);
      } else {
        notDisplayedDotCount += 1;
      }
    }
    const notDisplayedDots: DotVO[] = this.allZones[originalZoneIndex].removeNotDisplayedDots(
      notDisplayedDotCount,
      dragDotSprite.dot.isPositive);
    allRemovedDots = allRemovedDots.concat(notDisplayedDots);
    this.removeMultipleDots(originalZoneIndex, allRemovedDots, false);
    if (allRemovedDots.length > 0) {
      this.soundManager.playSound(SoundManager.DOT_IMPLODE);
    }
    this.dragGhostToNewZone(dragDotSprite, finalPosition);
  }

  private tweenDotsToNewZoneDone(dotSprite: DotSprite,
                                 dragDotSprite: DotSprite): void {
    dotSprite.parent.removeChild(dotSprite);
    this.spritePool.dispose(dotSprite, dotSprite.dot.isPositive, dotSprite.dot.color);
    dragDotSprite.playImplode();
  }

  private checkIfNotDisplayedSpriteCanBe(): void {
    let addedDots: DotVO[] = new Array<DotVO>();
    this.allZones.forEach((zone) => {
      addedDots = addedDots.concat(zone.checkIfNotDisplayedSpriteCanBe());
    });
    addedDots.forEach((dot) => {
      this.addDotSpriteProperty(dot.sprite, dot);
    });
  }

  private animationCallback(): void {
    this.allZones.forEach((zone) => {
      zone.update();
    });
  }

}
