import { Point } from 'pixi.js';
import { TweenMax, Quint, Linear } from 'gsap';
import { PowerZone } from './PowerZone';
import { ParticleEmitter } from './ParticleEmitter';
import { isPointInRectangle, randomFromTo, findQuadrant } from '../../utils/MathUtils';
// tslint:disable-next-line max-line-length
import { BASE, USAGE_MODE, OPERATOR_MODE, POSITION_INFO, BOX_INFO, SPRITE_COLOR, ERROR_MESSAGE, IOPERATOR_MODE, IUSAGE_MODE } from '../../Constants';
import { DividerZoneManager } from './DividerZoneManager';
import { DividerResult } from './DividerResult';
import { SoundManager } from '../../utils/SoundManager';
import { SpritePool } from '../../utils/SpritePool';
import {DotVO} from "../../VO/DotVO";
import {DotSprite} from "./DotSprite";
import Rectangle = PIXI.Rectangle;
import {DotsContainer} from "./DotsContainer";
import Sprite = PIXI.Sprite;

interface IPendingAction {
  // tslint:disable-next-line ban-types
  function: Function;
  params: Array<PIXI.Sprite | PIXI.Container>;
}

interface IZoneUnderCursor {
  droppedOnPowerZone: PIXI.Container | null;
  droppedOnPowerZoneIndex: number;
  actualZone?: PowerZone | null;
}

export class PowerZoneManager extends PIXI.Container {

  private static removeDotsAfterTween(sprite) {
    sprite.destroy();
  }

  public isInteractive: boolean;

  private addDot: Function; // tslint:disable-line ban-types
  private removeDot: Function; // tslint:disable-line ban-types
  private addMultipleDots: Function; // tslint:disable-line ban-types
  private removeMultipleDots: Function; // tslint:disable-line ban-types
  private rezoneDot: Function; // tslint:disable-line ban-types
  private setDivisionResult: Function; // tslint:disable-line ban-types
  private displayUserMessage: Function; // tslint:disable-line ban-types
  private movingDotsContainer: PIXI.Container;
  private dividerZoneManager: DividerZoneManager;
  private dividerResult: DividerResult;
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
  private pendingAction: IPendingAction[];
  private explodeEmitter: ParticleEmitter[];
  private implodeEmitter: ParticleEmitter[];
  private dragParticleEmitterRed: ParticleEmitter;
  private dragParticleEmitterBlue: ParticleEmitter;
  private leftMostZone: PIXI.Container;
  private explodeJSON: object;
  private implodeJSON: object;
  private redDragJSON: object;
  private blueDragJSON: object;

  constructor(addDot,
              removeDot,
              addMultipleDots,
              removeMultipleDots,
              rezoneDot,
              setDivisionResult,
              displayUserMessage,
              soundManager,
              wantedResult) {
    super();

    this.explodeJSON = require('./dot_explode.json');
    this.implodeJSON = require('./dot_implode.json');
    this.redDragJSON = require('./dot_drag_red.json');
    this.blueDragJSON = require('./dot_drag_blue.json');

    this.addDot = addDot;
    this.removeDot = removeDot;
    this.addMultipleDots = addMultipleDots;
    this.removeMultipleDots = removeMultipleDots;
    this.rezoneDot = rezoneDot;
    this.setDivisionResult = setDivisionResult;
    this.displayUserMessage = displayUserMessage;
    this.movingDotsContainer = new PIXI.Container();
    this.soundManager = soundManager;
    // reverse all the wanted result so they are in the same order as our zone.
    wantedResult.positiveDots.reverse();
    wantedResult.negativeDots.reverse();
    wantedResult.positiveDivider.reverse();
    wantedResult.negativeDivider.reverse();
    this.wantedResult = wantedResult;
    this.ticker = new PIXI.ticker.Ticker();
    this.ticker.stop();

  }

  public init(textures,
              spritePool,
              base,
              usageMode,
              operatorMode,
              totalZoneCount,
              placeValueOn,
              negativePresent) {
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
    this.pendingAction = new Array<IPendingAction>();
    this.explodeEmitter = new Array<ParticleEmitter>();
    this.implodeEmitter = new Array<ParticleEmitter>();
    // window.addEventListener('keyup', this.traceValue.bind(this));
  }

  /*private traceValue(e) {
    if ((e.keyCode || e.which) === 32) {
      const dotCount = new Array<number>();
      const childCount = new Array<number>();
      this.allZones.forEach((zone: PowerZone) => {
        dotCount.push(Object.keys(zone.positiveDots).length);
        childCount.push(zone.positiveDotsContainer.children.length);
      });
      // console.log(dotCount, childCount, this.movingDotsContainer.children.length);
    }
  }*/

  public createZones() {
    for (let i = this.totalZoneCount - 1; i >= 0; i -= 1) {
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
      this.dividerResult = new DividerResult();
    }
  }

  public createLeftmostTestZone() {
    this.leftMostZone = new PIXI.Container();
    this.leftMostZone.x = 0;
    this.leftMostZone.y = BOX_INFO.BOX_Y;
    this.addChild(this.leftMostZone);
    this.leftMostZone.hitArea = new PIXI.Rectangle(0, 0, BOX_INFO.LEFT_GUTTER, BOX_INFO.BOX_HEIGHT);
  }

  public start() {
    this.ticker.add((deltaTime) => {
      this.animationCallback(deltaTime);
    });
    this.ticker.start();
    // requestAnimationFrame(this.animationCallback.bind(this));
  }

  public precalculateForDivision() {
    this.allZones.forEach((zone) => {
      zone.precalculateDotsForDivision();
    });
  }

  public doBaseChange(base) {
    this.base = base;
    this.allZones.forEach((zone) => {
      zone.baseChange(base);
    });
  }

  public setValueTextAlpha(placeValueOn) {
    this.allZones.forEach((zone) => {
      zone.setValueTextAlpha(placeValueOn ? 1 : 0);
    });
  }

  public checkPendingAction(nextProps) {
    // console.log('checkPendingAction', nextProps, nextProps.userMessage);
    if (nextProps.userMessage === '') {
      while (this.pendingAction.length > 0) {
        const action = this.pendingAction.shift() as IPendingAction;
        action.function.apply(this, action.params);
      }
    }
  }

  public magicWand() {
    const base = this.base[1];
    let dotsRemoved: DotVO[] = new Array<DotVO>();
    if (this.negativePresent) {
      // check positive / negative
      for (let i = 0; i < this.allZones.length; i += 1) {
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
    if (dotsRemoved.length === 0) {
      for (let i = 0; i < this.allZones.length; i += 1) {
        dotsRemoved = this.allZones[i].getOvercrowding(base);
        if (dotsRemoved.length > 0) {
          this.removeMultipleDots(i, dotsRemoved, false);
          if (this.negativePresent) {
            if (dotsRemoved[0].isPositive) {
              this.addDot(i + 1, [randomFromTo(0, BOX_INFO.BOX_WIDTH), randomFromTo(0, BOX_INFO.HALF_BOX_HEIGHT)], true); // tslint:disable-line max-line-length
            } else {
              this.addDot(i + 1, [randomFromTo(0, BOX_INFO.BOX_WIDTH), randomFromTo(0, BOX_INFO.HALF_BOX_HEIGHT)], false); // tslint:disable-line max-line-length
            }
          } else {
            this.addDot(i + 1, [randomFromTo(0, BOX_INFO.BOX_WIDTH), randomFromTo(0, BOX_INFO.BOX_HEIGHT)], true); // tslint:disable-line max-line-length
          }
          break;
        }
      }
    }
  }

  public removeDotsFromStateChange(positivePowerZoneDots: DotVO[], negativePowerZoneDots: DotVO[]) {
    // console.log('removeDotsFromStateChange');
    for (let i = 0; i < this.allZones.length; i += 1) {
      /* console.log('removeDotsFromStateChange',
       i,
       Object.keys(this.props.positivePowerZoneDots[i]).length);*/
      let removedDots = this.allZones[i].removeDotsIfNeeded(positivePowerZoneDots[i], true);
      removedDots.forEach((d) => {
        const dot: DotVO = d;
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

  public setZoneTextAndAlphaStatus() {
    // Don't display leading zeroes
    let zoneIsEmpty = true;
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

  public addDotsFromStateChange(positivePowerZoneDots, negativePowerZoneDots) {
    // console.log('addDotsFromStateChange1');
    let allDots: DotVO[] = new Array<DotVO>();
    for (let i = 0; i < this.allZones.length; i += 1) {
      allDots = allDots.concat(
        this.allZones[i].addDotsFromStateChange(
          positivePowerZoneDots[i],
          negativePowerZoneDots[i]));
    }
    allDots.forEach((dot) => {
      if (dot.sprite) {
        this.addDotSpriteProperty(dot, dot.sprite);
        if (dot.isPositive) {
          this.allZones[dot.powerZone].positiveProximityManager.addItem(dot.sprite);
        } else {
          this.allZones[dot.powerZone].negativeProximityManager.addItem(dot.sprite);
        }
      }
    });
  }

  public adjustDividerDotFromStateChange(positiveDividerDots, negativeDividerDots) {
    this.dividerZoneManager.removeDots(positiveDividerDots, negativeDividerDots);
    this.dividerZoneManager.addDots(positiveDividerDots, negativeDividerDots);
  }

  public populateDivideResult(positiveDividerResult: number[], negativeDividerResult: number[]) {
    // console.log('populateDivideResult', positiveDividerResult, negativeDividerResult);
    const positiveDots: number[] = new Array<number>();
    const negativeDots: number[] = new Array<number>();
    this.allZones.forEach((zone) => {
      positiveDots.push(Object.keys(zone.positiveDots).length);
      negativeDots.push(Object.keys(zone.negativeDots).length);
      zone.setDivisionValue(
        positiveDividerResult[zone.zonePosition],
        negativeDividerResult[zone.zonePosition]);
    });
    positiveDots.reverse();
    negativeDots.reverse();
    this.dividerResult.update(
      positiveDividerResult.slice(0).reverse(),
      negativeDividerResult.slice(0).reverse(),
      positiveDots,
      negativeDots);
  }

  public showDividerAndResult() {
    this.dividerZoneManager.x = 957;
    this.dividerZoneManager.y = 375;
    this.addChild(this.dividerZoneManager);
    this.dividerZoneManager.start();

    this.dividerResult.x = 100;
    this.dividerResult.y = 375;
    this.addChild(this.dividerResult);
  }

  public checkInstability() {
    let isOverload: boolean;
    let overloadExist: boolean = false;
    let isSignInstability: boolean;
    let instabilityExist: boolean = false;
    this.allZones.forEach((zone) => {
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
    if (overloadExist) {
      this.soundManager.playSound(SoundManager.BOX_OVERLOAD);
    } else if (instabilityExist) {
      this.soundManager.playSound(SoundManager.BOX_POSITIVE_NEGATIVE);
    } else {
      this.soundManager.stopSound(SoundManager.BOX_OVERLOAD);
      this.soundManager.stopSound(SoundManager.BOX_POSITIVE_NEGATIVE);
    }
  }

  public checkResult() {
    // console.log('checkResult');
    let zone;
    if (this.wantedResult.positiveDots.length === this.allZones.length &&
      this.wantedResult.negativeDots.length === this.allZones.length &&
      this.wantedResult.positiveDivider.length === this.allZones.length &&
      this.wantedResult.negativeDivider.length === this.allZones.length
    ) {
      let zoneSuccess = 0;
      for (let i = 0; i < this.allZones.length; i += 1) {
        zone = this.allZones[i];
        zone.precalculateDotsForDivision();
        if (this.wantedResult.positiveDots[i] === zone.positiveDotCount &&
          this.wantedResult.negativeDots[i] === zone.negativeDotCount &&
          this.wantedResult.positiveDivider[i] === Number(zone.positiveDividerText) &&
          this.wantedResult.negativeDivider[i] === Number(zone.negativeDividerText)
        ) {
          zoneSuccess += 1;
        }
      }
      if (zoneSuccess === this.allZones.length) {
        // console.log('SUCCESS!!!');
      }
    }
  }

  public reset() {
    // console.log('PowerZoneManager reset');
    TweenMax.killAll(true);
    this.allZones.forEach((zone) => {
      zone.reset();
    });
    if (this.dividerZoneManager) {
      this.dividerZoneManager.reset();
    }
    this.soundManager.stopSound(SoundManager.BOX_OVERLOAD);
    this.soundManager.stopSound(SoundManager.BOX_POSITIVE_NEGATIVE);
  }

  public destroy() {
    this.reset();
    this.ticker.stop();
    let key: string; // tslint:disable-line prefer-const
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
    });
  }

  private checkIfDivisionPossible(data, allZonesValue, isDragEnd = false) {
        // console.log('checkIfDivisionPossible', allZonesValue);
    if (this.isInteractive) {
      const zoneOverInfo: IZoneUnderCursor = this.getZoneUnderCursor(data) as IZoneUnderCursor;
      const droppedOnPowerZone = zoneOverInfo.droppedOnPowerZone;
      const droppedOnPowerZoneIndex = zoneOverInfo.droppedOnPowerZoneIndex;

      this.allZones.forEach((zone) => {
        zone.setBackgroundColor(PowerZone.BG_NEUTRAL);
      });

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
          let success = false;
          let antiSuccess = false;
          for (let i = 0; i < allZonesValue.length; i += 1) {
            const affectedZone = this.allZones[droppedOnPowerZoneIndex + i];
            if (allZonesValue[i][0] <= affectedZone.positiveDotCount &&
                allZonesValue[i][1] <= affectedZone.negativeDotCount) {
              success = true;
            } else {
              success = false;
              if (allZonesValue[i][1] <= affectedZone.positiveDotCount &&
                  allZonesValue[i][0] <= affectedZone.negativeDotCount) {
                antiSuccess = true;
              } else {
                antiSuccess = false;
              }
            }
            if (success === false && antiSuccess === false) {
              break;
            }
          }

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
            this.allZones.forEach((zone) => {
              zone.setBackgroundColor(PowerZone.BG_NEUTRAL);
            });
            if (success || antiSuccess) {
              this.applyDivision(
                success,
                antiSuccess,
                allZonesValue,
                droppedOnPowerZoneIndex,
                zoneOverInfo.actualZone);
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

  private applyDivision(success, antiSuccess, allZonesValue, droppedOnPowerZoneIndex, actualZone) {
    this.soundManager.playSound(SoundManager.DIVISION_SUCCESS);
    const dotsRemovedByZone: DotVO[][] = new Array<DotVO[]>();
    for (let i = 0; i < this.totalZoneCount; i += 1) {
      dotsRemovedByZone.push(new Array<DotVO>());
    }
    let dotsToMove: DotVO[] = new Array<DotVO>();
    // let moveToZone = droppedOnPowerZoneIndex;
    for (let i = 0; i < allZonesValue.length; i += 1) {
      let thisZoneDots = [];
      const affectedZone = this.allZones[droppedOnPowerZoneIndex + i];
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
    if (dotsToMove.length > 0) {
      dotsToMove.forEach((dot) => {
        let newPosition = dot.sprite.parent.toGlobal(dot.sprite.position as Point);
        newPosition = this.movingDotsContainer.toLocal(newPosition);
        const movingSprite = this.spritePool.getOne(dot.color, dot.isPositive);
        movingSprite.anchor.set(0.5);
        movingSprite.position.x = newPosition.x;
        movingSprite.position.y = newPosition.y;
        this.movingDotsContainer.addChild(movingSprite);
        const sprite = dot.sprite;
        sprite.alpha = 0;
        let finalPosition;
        if (success) {
          finalPosition = this.allZones[droppedOnPowerZoneIndex].toGlobal(
            this.allZones[droppedOnPowerZoneIndex].positiveDivideCounter.position as Point,
          );
        } else if (antiSuccess) {
          finalPosition = this.allZones[droppedOnPowerZoneIndex].toGlobal(
            this.allZones[droppedOnPowerZoneIndex].negativeDivideCounter.position as Point,
          );
        }
        finalPosition = this.movingDotsContainer.toLocal(finalPosition);
        TweenMax.to(movingSprite.scale, 0.1, {
          ease: Linear.easeNone,
          repeat: 3,
          x: 1.5,
          y: 1.5,
          yoyo: true,
        });
        TweenMax.to(movingSprite, 0.2, {
          delay: 0.4,
          ease: Quint.easeOut,
          onComplete: PowerZoneManager.removeDotsAfterTween.bind(this),
          onCompleteParams: [movingSprite],
          x: finalPosition.x + 15,
          y: finalPosition.y + (success ? 15 : 25),
        });
      });
      TweenMax.delayedCall(0.6,
        this.processDivisionAfterTween.bind(this),
        [dotsRemovedByZone, actualZone, success]);
    }
  }

  private processDivisionAfterTween(dotsRemovedByZone, moveToZone, isPositive) {
    for (let i = 0; i < dotsRemovedByZone.length; i += 1) {
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

  private balanceDivider(zonePos, isPositive) {
    this.isInteractive = false;
    let newPosition;
    let finalPosition;
    const allMovingDots: PIXI.Sprite[] = new Array<PIXI.Sprite>();
    if (isPositive) {
      newPosition = this.allZones[zonePos].toGlobal(this.allZones[zonePos].positiveDivideCounter.position as Point); // tslint:disable-line max-line-length
      finalPosition = this.allZones[zonePos + 1].toGlobal(this.allZones[zonePos + 1].positiveDivideCounter.position as Point); // tslint:disable-line max-line-length
      for (let i = 0; i < this.base[1]; i += 1) {
        allMovingDots.push(new PIXI.Sprite(this.textures['grouped_dot.png']));
      }
    } else {
      newPosition = this.allZones[zonePos].toGlobal(this.allZones[zonePos].negativeDivideCounter.position as Point); // tslint:disable-line max-line-length
      finalPosition = this.allZones[zonePos + 1].toGlobal(this.allZones[zonePos + 1].negativeDivideCounter.position as Point); // tslint:disable-line max-line-length
      for (let i = 0; i < this.base[1]; i += 1) {
        allMovingDots.push(new PIXI.Sprite(this.textures['grouped_antidot.png']));
      }
    }
    newPosition = this.movingDotsContainer.toLocal(newPosition);
    finalPosition = this.movingDotsContainer.toLocal(finalPosition);
    let delay = 0;
    allMovingDots.forEach((sprite) => {
      sprite.anchor.set(0.5);
      const position = sprite.position;
      position.x = newPosition.x + 15;
      position.y = newPosition.y + 15;
      this.movingDotsContainer.addChild(sprite);
      TweenMax.to(sprite, 0.5, {
        delay,
        ease: Quint.easeOut,
        onComplete: PowerZoneManager.removeDotsAfterTween,
        onCompleteParams: [sprite],
        x: finalPosition.x + 15,
        y: finalPosition.y + 15,
      });
      delay += 0.1;
    });
    this.soundManager.playSound(SoundManager.DIVISION_OVERLOAD);
    TweenMax.delayedCall(
        delay + 0.5,
        this.setDividerValueAfterBalance,
        [zonePos, isPositive],
        this);
  }

  private setDividerValueAfterBalance(zonePos, isPositive) {
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

  private createDot(target, position, color) {
        // console.log(target.powerZone);
    if (this.isInteractive) {
      if (this.operatorMode === OPERATOR_MODE.DIVIDE && this.base[1] === BASE.BASE_X) {
                // Add a opposite value dot in the same zone for division in base X
        this.soundManager.playSound(SoundManager.ADD_DIVISION_DOT);
        if (target.isPositive) {
          this.addDot(target.powerZone, position, target.isPositive, color);
          const dotPos = [
            randomFromTo(
                POSITION_INFO.DOT_RAYON,
                target.parent.negativeDotsContainer.hitArea.width - POSITION_INFO.DOT_RAYON),
            randomFromTo(
                POSITION_INFO.DOT_RAYON,
                target.parent.negativeDotsContainer.hitArea.height - POSITION_INFO.DOT_RAYON),
          ];
          this.addDot(target.powerZone, dotPos, !target.isPositive, color);
        } else {
          this.addDot(target.powerZone, position, target.isPositive, color);
          const dotPos = [
            randomFromTo(
                POSITION_INFO.DOT_RAYON,
                target.parent.positiveDotsContainer.hitArea.width - POSITION_INFO.DOT_RAYON),
            randomFromTo(
                POSITION_INFO.DOT_RAYON,
                target.parent.positiveDotsContainer.hitArea.height - POSITION_INFO.DOT_RAYON),
          ];
          this.addDot(target.powerZone, dotPos, !target.isPositive, color);
        }
      } else {
                // console.log('here', target.powerZone, position, target.isPositive, color);
        this.soundManager.playSound(SoundManager.ADD_DOT);
        this.addDot(target.powerZone, position, target.isPositive, color);
      }
    }
  }

  /*inititalPopulate(dots, isPositive) {
    dots.forEach((zoneArray) => {
      Object.keys(zoneArray).forEach((key) => {
        const dotSprite = this.allZones[zoneArray[key].powerZone].addDot(zoneArray[key]);
        if (dotSprite) {
          this.addDotSpriteProperty(zoneArray[key], dotSprite);
          if (isPositive) {
            this.allZones[zoneArray[key].powerZone].positiveProximityManager.addItem(dotSprite);
          } else {
            this.allZones[zoneArray[key].powerZone].negativeProximityManager.addItem(dotSprite);
          }
        }
      });
    });
  }*/

  private addDotSpriteProperty(dot: DotVO, dotSprite: DotSprite) {
    dotSprite.anchor.set(0.5);
    dotSprite.x = dot.x;
    dotSprite.y = dot.y;
    dotSprite.interactive = true;
    dotSprite.buttonMode = true;
    dotSprite.world = this;
    dotSprite.on('pointerdown', this.onDragStart);
    dotSprite.on('pointerup', this.onDragEnd);
    dotSprite.on('pointerupoutside', this.onDragEnd);
    dotSprite.on('pointermove', this.onDragMove);
    dotSprite.alpha = 0;
    TweenMax.to(dotSprite, 1, { alpha: 1 });
  }

  private removeDotSpriteListeners(sprite: DotSprite) {
    sprite.off('pointerdown', this.onDragStart);
    sprite.off('pointerup', this.onDragEnd);
    sprite.off('pointerupoutside', this.onDragEnd);
    sprite.off('pointermove', this.onDragMove);
    this.allZones[sprite.dot.powerZone].removeFromProximityManager(sprite);
  }

  private onDragStart(e: PIXI.interaction.InteractionEvent) {
    // console.log('onDragStart', this.dot.isPositive);
    const dotSprite: DotSprite = e.currentTarget as DotSprite;
    if (dotSprite.world.isInteractive) {
      const oldParent = this.parent;
      if (dotSprite.dot.isPositive) {
        dotSprite.world.allZones[dotSprite.dot.powerZone].positiveProximityManager.removeItem(this);
      } else {
        dotSprite.world.allZones[dotSprite.dot.powerZone].negativeProximityManager.removeItem(this);
      }
      dotSprite.origin = new Point(this.x, this.y);
      dotSprite.data = e.data;
      dotSprite.dragging = true;
      dotSprite.world.movingDotsContainer.addChild(this);
      const newPosition = dotSprite.data.getLocalPosition(this.parent);
      const originDiff = dotSprite.data.getLocalPosition(oldParent);
      dotSprite.originInMovingContainer = newPosition;
      dotSprite.originInMovingContainer.x += dotSprite.origin.x - originDiff.x;
      dotSprite.originInMovingContainer.y += dotSprite.origin.y - originDiff.y;
      dotSprite.position.x = newPosition.x;
      dotSprite.position.y = newPosition.y;
      if (dotSprite.dot.color === SPRITE_COLOR.RED) {
        dotSprite.particleEmitter = dotSprite.world.dragParticleEmitterRed;
      } else {
        dotSprite.particleEmitter = dotSprite.world.dragParticleEmitterBlue;
      }
      dotSprite.particleEmitter.updateOwnerPos(newPosition.x, newPosition.y);
      dotSprite.particleEmitter.start();
    }
  }

  private onDragMove(e: PIXI.interaction.InteractionEvent) {
    const dotSprite: DotSprite = e.currentTarget as DotSprite;
    if (dotSprite.world.isInteractive && dotSprite.dragging) {
      const newPosition = dotSprite.data.getLocalPosition(this.parent);
      dotSprite.position.x = newPosition.x;
      dotSprite.position.y = newPosition.y;
      dotSprite.particleEmitter.updateOwnerPos(newPosition.x, newPosition.y);
    }
  }

  private onDragEnd(e: PIXI.interaction.InteractionEvent) {
    const dotSprite: DotSprite = e.currentTarget as DotSprite;
    if (dotSprite.world.isInteractive && dotSprite.dragging) {
      dotSprite.dragging = false;
      // dotSprite.data = null;
      dotSprite.world.verifyDroppedOnZone(this, e.data);
      // dot may have been remove if dropped outside the boxes in freeplay,
      // so verify if it's still have a dot
      if (dotSprite.dot) {
        if (dotSprite.dot.isPositive) {
          // wait for the sprite to be back in place if dropped on an edge
          TweenMax.delayedCall(
              0.21,
            dotSprite.world.allZones[dotSprite.dot.powerZone].positiveProximityManager.addItem,
              [dotSprite],
            dotSprite.world.allZones[dotSprite.dot.powerZone].positiveProximityManager);
        } else {
          TweenMax.delayedCall(0.21,
            dotSprite.world.allZones[dotSprite.dot.powerZone].negativeProximityManager.addItem,
              [dotSprite],
            dotSprite.world.allZones[dotSprite.dot.powerZone].negativeProximityManager);
        }
      }
      dotSprite.particleEmitter.stop();
    }
    e.stopPropagation();
  }

  private verifyDroppedOnZone(dotSprite, data) {
        // console.log('verifyDroppedOnZone', dotSprite, data);
    const originalZoneIndex: number = dotSprite.dot.powerZone;
    const zoneOverInfo: IZoneUnderCursor = this.getZoneUnderCursor(data) as IZoneUnderCursor;
    const droppedOnPowerZone: DotsContainer = zoneOverInfo.droppedOnPowerZone as DotsContainer;
    const droppedOnPowerZoneIndex: number = zoneOverInfo.droppedOnPowerZoneIndex;
    // console.log('verifyDroppedOnZone', droppedOnPowerZoneIndex, droppedOnPowerZone);
    if (droppedOnPowerZoneIndex !== -1 && droppedOnPowerZone !== null) {
            // has not been dropped outside a zone
      if (droppedOnPowerZoneIndex !== originalZoneIndex) {
        // impossible to move between different positive value zone (positive to negative)
        // impossible to move between powerZone in base X
        if (droppedOnPowerZone.isPositive === dotSprite.dot.isPositive
            && this.base[1] !== BASE.BASE_X) {
          const diffZone = originalZoneIndex - droppedOnPowerZoneIndex;
          let dotsToRemoveCount = 1;
          // console.log(originalZoneIndex, droppedOnPowerZoneIndex, diffZone);
          if (diffZone < 0) {
            dotsToRemoveCount = Math.pow(Number(this.base[1]), diffZone * -1);
          } else {
            dotsToRemoveCount = this.base[0] as number;
          }
          // console.log('dotsToRemoveCount', dotsToRemoveCount);
          // check if possible
          let finalNbOfDots = -1;
          if (dotSprite.dot.isPositive) {
            finalNbOfDots = Object.keys(this.allZones[originalZoneIndex].positiveDots).length - dotsToRemoveCount; // tslint:disable-line max-line-length
          } else {
            finalNbOfDots = Object.keys(this.allZones[originalZoneIndex].negativeDots).length - dotsToRemoveCount; // tslint:disable-line max-line-length
          }
                    // console.log('finalNbOfDots', finalNbOfDots);
          if (finalNbOfDots < 0 || (this.base[0] > 1 && Math.abs(diffZone) > 1)) {
            if (finalNbOfDots < 0) {
                            // alert("Pas assez de points disponibles pour cette opération");
              this.soundManager.playSound(SoundManager.NOT_ENOUGH_DOTS);
              this.displayUserMessage(ERROR_MESSAGE.NO_ENOUGH_DOTS);
            } else if (this.base[0] > 1 && Math.abs(diffZone) > 1) {
              this.soundManager.playSound(SoundManager.INVALID_MOVE);
              this.displayUserMessage(ERROR_MESSAGE.ONE_BOX_AT_A_TIME);
            }
            if (dotSprite.dot.isPositive) {
              this.pendingAction.push(
                {
                  function: this.backIntoPlace,
                  params: [dotSprite, this.allZones[originalZoneIndex].positiveDotsContainer],
                },
              );
              this.isInteractive = false;
            } else {
              this.pendingAction.push(
                {
                  function: this.backIntoPlace,
                  params: [dotSprite, this.allZones[originalZoneIndex].negativeDotsContainer],
                },
              );
              this.isInteractive = false;
            }
            return;
          }
          // rezone current dot and thus remove it from the amount to be moved
          this.addDraggedToNewZone(
              dotSprite,
              droppedOnPowerZone,
              data.getLocalPosition(droppedOnPowerZone),
              false);
          dotsToRemoveCount -= 1;
          // console.log('dotsToRemoveCount', dotsToRemoveCount);
          // animate zone movement and destroy
          const dataLocalZone: Point = data.getLocalPosition(droppedOnPowerZone);
          this.tweenDotsToNewZone(
              originalZoneIndex,
              droppedOnPowerZone,
              dotsToRemoveCount,
              dataLocalZone,
              dotSprite.dot.isPositive);
          // Add the new dots
          const dotsPos: Point[] = new Array<Point>();
          let newNbOfDots = Math.pow(this.base[1] as number, diffZone);
          newNbOfDots -= this.base[0] as number;
                    // console.log('newNbOfDots', newNbOfDots, diffZone);
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
          if (dotsPos.length > 0) {
            this.soundManager.playSound(SoundManager.DOT_EXPLODE);
                        // console.log('this.addMultipleDots', dotsPos.length);
            const implosionEmitter = this.getImplosionEmitter();
            const originalPos = data.getLocalPosition(this.movingDotsContainer);
            implosionEmitter.updateOwnerPos(originalPos.x, originalPos.y);
            implosionEmitter.start();
            TweenMax.delayedCall(0.25, this.stopImplosionEmitter, [implosionEmitter], this);
            this.addMultipleDots(
                droppedOnPowerZoneIndex,
                dotsPos,
                dotSprite.dot.isPositive,
                dotSprite.dot.color,
                false);
          }
        } else {
          if (droppedOnPowerZone.isPositive !== dotSprite.dot.isPositive) {
            this.soundManager.playSound(SoundManager.INVALID_MOVE);
            this.displayUserMessage(ERROR_MESSAGE.POSITIVE_NEGATIVE_DRAG);
            this.isInteractive = false;
          } else if (this.base[1] === BASE.BASE_X) {
            this.soundManager.playSound(SoundManager.INVALID_MOVE);
            this.displayUserMessage(ERROR_MESSAGE.BASE_X_DRAG);
            this.isInteractive = false;
          }
          if (dotSprite.dot.isPositive) {
            this.pendingAction.push(
              {
                function: this.backIntoPlace,
                params: [dotSprite, this.allZones[originalZoneIndex].positiveDotsContainer],
              },
            );
          } else {
            this.pendingAction.push(
              {
                function: this.backIntoPlace,
                params: [dotSprite, this.allZones[originalZoneIndex].negativeDotsContainer],
              },
            );
          }
        }
      } else if (droppedOnPowerZoneIndex === originalZoneIndex) {
        if (dotSprite.dot.isPositive === droppedOnPowerZone.isPositive) {
          // just move the dots into the zone
          droppedOnPowerZone.addChild(dotSprite);
          let doTween = false;
          const newPosition = data.getLocalPosition(droppedOnPowerZone);
          const modifyPosition = newPosition.clone();
          if (newPosition.x < POSITION_INFO.DOT_RAYON) {
            modifyPosition.x = POSITION_INFO.DOT_RAYON;
            doTween = true;
          } else if (newPosition.x > (droppedOnPowerZone.hitArea as Rectangle).width - POSITION_INFO.DOT_RAYON) {
            modifyPosition.x = (droppedOnPowerZone.hitArea as Rectangle).width - POSITION_INFO.DOT_RAYON;
            doTween = true;
          }
          if (newPosition.y < POSITION_INFO.DOT_RAYON) {
            modifyPosition.y = POSITION_INFO.DOT_RAYON;
            doTween = true;
          } else if (newPosition.y > (droppedOnPowerZone.hitArea as Rectangle).height - POSITION_INFO.DOT_RAYON) {
            modifyPosition.y = (droppedOnPowerZone.hitArea as Rectangle).height - POSITION_INFO.DOT_RAYON;
            doTween = true;
          }
          const position = dotSprite.position;
          position.x = newPosition.x;
          position.y = newPosition.y;
          if (doTween) {
            TweenMax.to(dotSprite.position, 0.2, { x: modifyPosition.x, y: modifyPosition.y });
          }
        } else if (dotSprite.dot.isPositive !== droppedOnPowerZone.isPositive) {
          // check it possible dot / anti dot destruction
          if (dotSprite.dot.isPositive) {
            // Positive dot drag into negative zoe
            if (Object.keys(this.allZones[originalZoneIndex].negativeDots).length > 0) {
              const allRemovedDots: DotVO[] = new Array<DotVO>();
              const negativeSprite: DotSprite = this.allZones[originalZoneIndex].negativeDotsContainer.getChildAt(0) as DotSprite; // tslint:disable-line max-line-length
              allRemovedDots.push(negativeSprite.dot);
              this.removeDotSpriteListeners(negativeSprite);
              allRemovedDots.push(dotSprite.dot);
              this.removeDotSpriteListeners(dotSprite);
              this.soundManager.playSound(SoundManager.DOT_ANNIHILATION);
              this.removeMultipleDots(originalZoneIndex, allRemovedDots, true);
            } else {
              this.soundManager.playSound(SoundManager.INVALID_MOVE);
              this.displayUserMessage(ERROR_MESSAGE.NO_OPPOSITE_DOTS);
              this.pendingAction.push(
                {
                  function: this.backIntoPlace,
                  params: [dotSprite, this.allZones[originalZoneIndex].positiveDotsContainer],
                },
              );
            }
          } else if (dotSprite.dot.isPositive === false) {
            // Negative dot drag into positive zoe
            if (Object.keys(this.allZones[originalZoneIndex].positiveDots).length > 0) {
              const allRemovedDots: DotVO[] = new Array<DotVO>();
              const positiveSprite: DotSprite = this.allZones[originalZoneIndex].positiveDotsContainer.getChildAt(0) as DotSprite; // tslint:disable-line max-line-length
              allRemovedDots.push(positiveSprite.dot);
              this.removeDotSpriteListeners(positiveSprite);
              allRemovedDots.push(dotSprite.dot);
              this.removeDotSpriteListeners(dotSprite);
              this.soundManager.playSound(SoundManager.DOT_ANNIHILATION);
              this.removeMultipleDots(originalZoneIndex, allRemovedDots, true);
            } else {
              this.soundManager.playSound(SoundManager.INVALID_MOVE);
              this.displayUserMessage(ERROR_MESSAGE.NO_OPPOSITE_DOTS);
              this.pendingAction.push(
                {
                  function: this.backIntoPlace,
                  params: [dotSprite, this.allZones[originalZoneIndex].negativeDotsContainer],
                },
              );
            }
          }
        }
      }
    } else if (droppedOnPowerZoneIndex === -1 || droppedOnPowerZone === null) {
      // Dropped outside any zone
      if (droppedOnPowerZone === this.leftMostZone) {
        // Dropped on the fake zone at the left
        this.soundManager.playSound(SoundManager.INVALID_MOVE);
        this.displayUserMessage(ERROR_MESSAGE.NO_GREATER_ZONE);
        if (dotSprite.dot.isPositive) {
          this.pendingAction.push(
            {
              function: this.backIntoPlace,
              params: [dotSprite, this.allZones[originalZoneIndex].positiveDotsContainer],
            },
          );
        } else {
          this.pendingAction.push(
            {
              function: this.backIntoPlace,
              params: [dotSprite, this.allZones[originalZoneIndex].negativeDotsContainer],
            },
          );
        }
        this.isInteractive = false;
      } else if (this.usageMode === USAGE_MODE.FREEPLAY) {
        // Remove dot in freeplay
        this.soundManager.playSound(SoundManager.DOT_VANISH);
        this.removeDotSpriteListeners(dotSprite);
        this.removeDot(originalZoneIndex, dotSprite.dot.id);
      } else if (dotSprite.dot.isPositive) {
          // Put back dot in it's original place
        this.backIntoPlace(dotSprite, this.allZones[originalZoneIndex].positiveDotsContainer);
      } else {
        this.backIntoPlace(dotSprite, this.allZones[originalZoneIndex].negativeDotsContainer);
      }
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

  private backIntoPlace(dotSprite: DotSprite, currentZone: DotsContainer) {
    this.soundManager.playSound(SoundManager.BACK_INTO_PLACE);
    this.isInteractive = false;
    TweenMax.to(dotSprite, 1, {
      ease: Quint.easeInOut,
      onComplete: this.backIntoPlaceDone.bind(this),
      onCompleteParams: [dotSprite, currentZone],
      x: dotSprite.originInMovingContainer.x,
      y: dotSprite.originInMovingContainer.y,
    });
    TweenMax.to(dotSprite, 0.5, {
      height: dotSprite.height / 2,
      repeat: 1,
      yoyo: true,
    });
  }

  private backIntoPlaceDone(dotSprite: DotSprite, currentZone: PowerZone) {
    currentZone.addChild(dotSprite);
    dotSprite.position = dotSprite.origin; // eslint-disable-line no-param-reassign
    this.isInteractive = true;
  }

  private addDraggedToNewZone(dotSprite, newZone, positionToBeMovedTo, updateValue) {
        // console.log('addDraggedToNewZone', newZone.powerZone);
    newZone.addChild(dotSprite);
    const position = dotSprite.position;
    position.x = positionToBeMovedTo.x;
    position.y = positionToBeMovedTo.y;
        // Set the dot into the array here to have his position right.
    this.allZones[dotSprite.dot.powerZone].removeDotFromArray(dotSprite.dot);
    this.allZones[newZone.powerZone].addDotToArray(dotSprite.dot);
    this.rezoneDot(newZone.powerZone, dotSprite.dot, updateValue);
  }

  private tweenDotsToNewZone(
    originalZoneIndex: number,
    droppedOnPowerZone: DotsContainer,
    dotsToRemov: number,
    positionToBeMovedTo: Point,
    isPositive: boolean) {
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
      for (let i = 0; i < dotsToRezone; i += 1) {
        const dotSprite: DotSprite = dotContainer.getChildAt(0) as DotSprite;
        dotSprite.origin = new Point();
        dotSprite.origin.copy(dotSprite.position);
        const newPosition = this.movingDotsContainer.toLocal(dotSprite.position as Point, dotSprite.parent);
        const adjacentPosition = positionToBeMovedTo.clone();
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
        const finalPosition = this.movingDotsContainer.toLocal(
          adjacentPosition,
          droppedOnPowerZone);
        this.movingDotsContainer.addChild(dotSprite);
        dotSprite.position.x = newPosition.x;
        dotSprite.position.y = newPosition.y;
        TweenMax.to(dotSprite, 0.5, {
          onComplete: this.addDraggedToNewZone.bind(this),
          onCompleteParams: [dotSprite, droppedOnPowerZone, adjacentPosition, true],
          x: finalPosition.x,
          y: finalPosition.y,
        });
      }
            // this.checkIfNotDisplayedSpriteCanBe();
    }
    let allRemovedDots: DotVO[] = new Array<DotVO>();
        // tween dots to new zone
    const finalPosition = this.movingDotsContainer.toLocal(positionToBeMovedTo, droppedOnPowerZone);
    let notDisplayedDotCount = 0;
    for (let i = 0; i < dotsToRemove; i += 1) {
      let dotSprite;
      let dot;
      if (dotContainer.children.length > 0) {
        dotSprite = dotContainer.getChildAt(0);
        dot = dotSprite.dot;
        this.removeDotSpriteListeners(dotSprite);
                // calculate the position of the sprite in the moving container
        dotSprite.origin = new Point();
        dotSprite.origin.copy(dotSprite.position);
        const newPosition = this.movingDotsContainer.toLocal(dotSprite.position, dotSprite.parent);
        this.movingDotsContainer.addChild(dotSprite);
        dotSprite.position.x = newPosition.x;
        dotSprite.position.y = newPosition.y;

                // start the particles explosion effect
        const explosionEmitter = this.getExplosionEmitter();
        explosionEmitter.updateOwnerPos(newPosition.x, newPosition.y);
        explosionEmitter.start();
        TweenMax.delayedCall(0.2, this.stopExplosionEmitter, [explosionEmitter], this);
                // Move the sprite
        TweenMax.to(dotSprite, 0.5, {
          onComplete: this.tweenDotsToNewZoneDone.bind(this),
          onCompleteParams: [dotSprite],
          x: finalPosition.x,
          y: finalPosition.y,
        });
        allRemovedDots.push(dot);
        this.allZones[dot.powerZone].removeDotFromArray(dot);
      } else {
        notDisplayedDotCount += 1;
      }
    }
    const notDisplayedDots = this.allZones[originalZoneIndex].removeNotDisplayedDots(
      notDisplayedDotCount,
      isPositive);
    allRemovedDots = allRemovedDots.concat(notDisplayedDots);
    this.removeMultipleDots(originalZoneIndex, allRemovedDots, false);
    if (allRemovedDots.length > 0) {
      this.soundManager.playSound(SoundManager.DOT_IMPLODE);
    }
  }

  private getExplosionEmitter(): ParticleEmitter {
    if (this.explodeEmitter.length > 0) {
      return this.explodeEmitter.pop() as ParticleEmitter;
    }
    return new ParticleEmitter(this.movingDotsContainer, this.textures['red_dot.png'], this.explodeJSON);
  }

  private getImplosionEmitter(): ParticleEmitter {
    if (this.implodeEmitter.length > 0) {
      return this.implodeEmitter.pop() as ParticleEmitter;
    }
    return new ParticleEmitter(this.movingDotsContainer, this.textures['red_dot.png'], this.implodeJSON);
  }

  private stopExplosionEmitter(explosionEmitter) {
    explosionEmitter.stop();
    this.explodeEmitter.push(explosionEmitter);
  }

  private stopImplosionEmitter(implosionEmitter) {
    implosionEmitter.stop();
    this.implodeEmitter.push(implosionEmitter);
  }

  private tweenDotsToNewZoneDone(dotSprite) {
    TweenMax.to(
      dotSprite,
      0.3,
      {
        alpha: 0,
        onComplete: this.removeTweenDone.bind(this),
        onCompleteParams: [dotSprite],
      },
    );
  }

  private removeTweenDone(dotSprite) {
    dotSprite.parent.removeChild(dotSprite);
    this.spritePool.dispose(dotSprite, dotSprite.dot.isPositive, dotSprite.dot.color);
  }

  private checkIfNotDisplayedSpriteCanBe() {
    let addedDots: DotVO[] = new Array<DotVO>();
    this.allZones.forEach((zone) => {
      addedDots = addedDots.concat(zone.checkIfNotDisplayedSpriteCanBe());
    });
    addedDots.forEach((dot) => {
      this.addDotSpriteProperty(dot, dot.sprite);
    });
  }

  private animationCallback(time?: number) {
    // requestAnimationFrame(this.animationCallback.bind(this));
    this.allZones.forEach((zone) => {
      zone.update();
    });
  }

}
