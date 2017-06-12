// @flow
import { Point } from 'pixi.js';
import { TweenMax, Quint, Linear } from 'gsap';
import { PowerZone } from './PowerZone';
import { ParticleEmitter } from './ParticleEmitter';
import { isPointInRectangle, randomFromTo, findQuadrant } from '../../utils/MathUtils';
import { BASE, USAGE_MODE, OPERATOR_MODE, POSITION_INFO, BOX_INFO, SPRITE_COLOR, ERROR_MESSAGE } from '../../Constants';
import { DividerZoneManager } from './DividerZoneManager';
import { DividerResult } from './DividerResult';
import { SoundManager } from '../../utils/SoundManager';
import { SpritePool } from '../../utils/SpritePool';
import DotVO from '../../VO/DotVO';
import explodeJSON from './dot_explode.json';
import implodeJSON from './dot_implode.json';
import redDragJSON from './dot_drag_red.json';
import blueDragJSON from './dot_drag_blue.json';

// eslint-disable-next-line import/prefer-default-export
export class PowerZoneManager extends window.PIXI.Container {

  addDot: (zoneId: number, position: window.PIXI.Point, isPositive: boolean, color: string) => void;
  allZones: Array<PowerZone>;
  isInteractive: boolean;
  pendingAction: Array<{function: (dotSprite: window.PIXI.AnimatedSprite, currentZone: number) => void,
  params: Array<window.PIXI.AnimatedSprite | window.PIXI.Container>}>;
  explodeEmitter: Array<ParticleEmitter>;
  implodeEmitter: Array<ParticleEmitter>;
  dragParticleEmitterRed: ParticleEmitter | null;
  dragParticleEmitterBlue: ParticleEmitter | null;
  leftMostZone: window.PIXI.DisplayObject;
  dividerZoneManager: DividerZoneManager;
  dividerResult: DividerResult;
  soundManager: SoundManager;

  constructor(
    // eslint-disable-next-line max-len
    addDot: (zoneId: number, position: window.PIXI.Point, isPositive: boolean, color: string) => void,
    removeDot: (zoneId: number, dotId: string) => void,
    // eslint-disable-next-line max-len
    addMultipleDots: (zoneId: number, dotsPos: Array<{x: number, y: number}>, isPositive: boolean, color: string, updateValue: boolean) => void,
    // eslint-disable-next-line max-len
    removeMultipleDots: (zoneId: number, dotsPos: Array<{x: number, y: number}>, updateValue: boolean) => void,
    rezoneDot: (zoneId: number, dot: DotVO, updateValue: boolean) => void,
    setDivisionResult: (zoneId: number, divisionValue: number, isPositive: boolean) => void,
    displayUserMessage: (message: string) => void,
    soundManager: SoundManager,
    // eslint-disable-next-line max-len
    wantedResult: {positiveDots: Array<number>, negativeDots: Array<number>, positiveDivider: Array<number>, negativeDivider: Array<number>}) {
    super();
    this.addDot = addDot;
    this.removeDot = removeDot;
    this.addMultipleDots = addMultipleDots;
    this.removeMultipleDots = removeMultipleDots;
    this.rezoneDot = rezoneDot;
    this.setDivisionResult = setDivisionResult;
    this.displayUserMessage = displayUserMessage;
    this.movingDotsContainer = new window.PIXI.Container();
    this.dividerZoneManager = null;
    this.dividerResult = null;
    this.soundManager = soundManager;
    // reverse all the wanted result so they are in the same order as our zone.
    wantedResult.positiveDots.reverse();
    wantedResult.negativeDots.reverse();
    wantedResult.positiveDivider.reverse();
    wantedResult.negativeDivider.reverse();
    this.wantedResult = wantedResult;
    this.ticker = new window.PIXI.ticker.Ticker();
    this.ticker.stop();
  }

  init(
    textures: { string: window.PIXI.Texture },
    spritePool: SpritePool,
    base: Array<number | string>,
    usageMode: string,
    operatorMode: string,
    totalZoneCount: number,
    placeValueOn: boolean,
    negativePresent: boolean) {
    this.textures = textures;
    this.spritePool = spritePool;
    this.base = base;
    this.usage_mode = usageMode;
    this.operator_mode = operatorMode;
    this.totalZoneCount = totalZoneCount;
    this.placeValueOn = placeValueOn;
    this.negativePresent = negativePresent;
    this.allZones = [];
    this.isInteractive = usageMode === USAGE_MODE.FREEPLAY;
    this.pendingAction = [];
    this.explodeEmitter = [];
    this.implodeEmitter = [];
    this.dragParticleEmitterRed = null;
    this.dragParticleEmitterBlue = null;
    this.leftMostZone = null;
  }

  traceValue(e: SyntheticKeyboardEvent) {
    if ((e.keyCode || e.which) === 32) {
      const dotCount = [];
      const childCount = [];
      this.allZones.forEach((zone: PowerZone) => {
        dotCount.push(Object.keys(zone.positiveDots).length);
        childCount.push(zone.positiveDotsContainer.children.length);
      });
      // console.log(dotCount, childCount, this.movingDotsContainer.children.length);
    }
  }

  createZones() {
    for (let i = this.totalZoneCount - 1; i >= 0; i -= 1) {
      const powerZone = new PowerZone(i,
                this.textures,
                this.base,
                this.negativePresent,
                this.usage_mode,
                this.operator_mode,
                this.totalZoneCount,
                this.spritePool
            );
      this.addChild(powerZone);
      this.allZones.push(powerZone);
      powerZone.eventEmitter.on(PowerZone.CREATE_DOT, this.createDot, this);
      powerZone.eventEmitter.on(PowerZone.DIVIDER_OVERLOAD, this.balanceDivider, this);
      powerZone.setValueTextAlpha(this.placeValueOn ? 1 : 0);
    }
    this.setZoneTextAndAlphaStatus();
    this.dragParticleEmitterRed = new ParticleEmitter(this.movingDotsContainer, this.textures['red_dot.png'], redDragJSON);
    this.dragParticleEmitterBlue = new ParticleEmitter(this.movingDotsContainer, this.textures['blue_dot.png'], blueDragJSON);
    this.addChild(this.movingDotsContainer);
    if (this.operator_mode === OPERATOR_MODE.DIVIDE) {
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

  createLeftmostTestZone() {
    this.leftMostZone = new window.PIXI.Container();
    this.leftMostZone.x = 0;
    this.leftMostZone.y = BOX_INFO.BOX_Y;
    this.addChild(this.leftMostZone);
    this.leftMostZone.hitArea = new window.PIXI.Rectangle(
      0,
      0,
      BOX_INFO.LEFT_GUTTER,
      BOX_INFO.BOX_HEIGHT
    );
  }

  start() {
    this.ticker.add((deltaTime: number) => {
      this.animationCallback(deltaTime);
    });
    this.ticker.start();
    // requestAnimationFrame(this.animationCallback.bind(this));
  }

  precalculateForDivision() {
    this.allZones.forEach((zone: PowerZone) => {
      zone.precalculateDotsForDivision();
    });
  }

  checkIfDivisionPossible(data: window.PIXI.interaction.InteractionData, allZonesValue: Array<Array<number>>, isDragEnd: boolean = false) {
        // console.log('checkIfDivisionPossible', allZonesValue);
    if (this.isInteractive) {
      const zoneOverInfo: zoneUnderCursor = this.getZoneUnderCursor(data);
      const droppedOnPowerZone = zoneOverInfo.droppedOnPowerZone;
      const droppedOnPowerZoneIndex = zoneOverInfo.droppedOnPowerZoneIndex;

      this.allZones.forEach((zone: PowerZone) => {
        zone.setBackgroundColor(PowerZone.BG_NEUTRAL);
      });

      if (droppedOnPowerZoneIndex !== -1) {
        // console.log(droppedOnPowerZoneIndex, allZonesValue.length, this.totalZoneCount);
        if ((this.totalZoneCount - droppedOnPowerZoneIndex >= allZonesValue.length) === false) {
          if (isDragEnd === false) {
            droppedOnPowerZone.parent.setBackgroundColor(PowerZone.BG_RED);
            for (let i = 0; i < allZonesValue.length; i += 1) {
              if (this.allZones[droppedOnPowerZoneIndex + i] !== undefined) {
                this.allZones[droppedOnPowerZoneIndex + i].setBackgroundColor(PowerZone.BG_RED);
              }
            }
          } else {
            droppedOnPowerZone.parent.setBackgroundColor(PowerZone.BG_NEUTRAL);
          }
        } else {
          let success: boolean = false;
          let antiSuccess: boolean = false;
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

  applyDivision(success: boolean, antiSuccess: boolean, allZonesValue: Array<Array<number>>, droppedOnPowerZoneIndex: number, actualZone: PowerZone) {
    this.soundManager.playSound(SoundManager.DIVISION_SUCCESS);
    const dotsRemovedByZone: Array<Array<DotVO>> = [];
    for (let i = 0; i < this.totalZoneCount; i += 1) {
      dotsRemovedByZone.push([]);
    }
    let dotsToMove: Array<DotVO> = [];
    // let moveToZone = droppedOnPowerZoneIndex;
    for (let i = 0; i < allZonesValue.length; i += 1) {
      let thisZoneDots = [];
      const affectedZone = this.allZones[droppedOnPowerZoneIndex + i];
      if (success) {
        thisZoneDots = thisZoneDots.concat(
          affectedZone.getDotsForDivision(allZonesValue[i][0],
            true)
        );
        thisZoneDots = thisZoneDots.concat(
          affectedZone.getDotsForDivision(allZonesValue[i][1],
            false)
        );
      } else if (antiSuccess) {
        thisZoneDots = thisZoneDots.concat(
          affectedZone.getDotsForDivision(allZonesValue[i][0],
            false)
        );
        thisZoneDots = thisZoneDots.concat(
          affectedZone.getDotsForDivision(allZonesValue[i][1],
            true)
        );
      }
      dotsToMove = dotsToMove.concat(thisZoneDots);
      dotsRemovedByZone[droppedOnPowerZoneIndex + i] = dotsRemovedByZone[droppedOnPowerZoneIndex + i].concat(thisZoneDots);// eslint-disable-line max-len
    }
    if (dotsToMove.length > 0) {
      dotsToMove.forEach((dot) => {
        let newPosition = dot.sprite.parent.toGlobal(dot.sprite.position);
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
            this.allZones[droppedOnPowerZoneIndex].positiveDivideCounter.position
          );
        } else if (antiSuccess) {
          finalPosition = this.allZones[droppedOnPowerZoneIndex].toGlobal(
            this.allZones[droppedOnPowerZoneIndex].negativeDivideCounter.position
          );
        }
        finalPosition = this.movingDotsContainer.toLocal(finalPosition);
        TweenMax.to(movingSprite.scale, 0.1, {
          x: 1.5,
          y: 1.5,
          yoyo: true,
          repeat: 3,
          ease: Linear.easeNone,
        });
        TweenMax.to(movingSprite, 0.2, {
          x: finalPosition.x + 15,
          y: finalPosition.y + (success ? 15 : 25),
          ease: Quint.easeOut,
          delay: 0.4,
          onComplete: PowerZoneManager.removeDotsAfterTween.bind(this),
          onCompleteParams: [movingSprite],
        });
      });
      TweenMax.delayedCall(0.6,
        this.processDivisionAfterTween.bind(this),
        [dotsRemovedByZone, actualZone, success]);
    }
  }

  static removeDotsAfterTween(sprite) {
    sprite.destroy();
  }

  processDivisionAfterTween(dotsRemovedByZone: Array<Array<DotVO>>, moveToZone: PowerZone, isPositive: boolean) {
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

  balanceDivider(zonePos: number, isPositive: boolean) {
    this.isInteractive = false;
    let newPosition;
    let finalPosition;
    const allMovingDots = [];
    if (isPositive) {
      newPosition = this.allZones[zonePos].toGlobal(this.allZones[zonePos].positiveDivideCounter.position);// eslint-disable-line max-len
      finalPosition = this.allZones[zonePos + 1].toGlobal(this.allZones[zonePos + 1].positiveDivideCounter.position);// eslint-disable-line max-len
      for (let i = 0; i < this.base[1]; i += 1) {
        allMovingDots.push(new window.PIXI.Sprite(this.textures['grouped_dot.png']));
      }
    } else {
      newPosition = this.allZones[zonePos].toGlobal(this.allZones[zonePos].negativeDivideCounter.position);// eslint-disable-line max-len
      finalPosition = this.allZones[zonePos + 1].toGlobal(this.allZones[zonePos + 1].negativeDivideCounter.position);// eslint-disable-line max-len
      for (let i = 0; i < this.base[1]; i += 1) {
        allMovingDots.push(new window.PIXI.Sprite(this.textures['grouped_antidot.png']));
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
        x: finalPosition.x + 15,
        y: finalPosition.y + 15,
        ease: Quint.easeOut,
        delay,
        onComplete: PowerZoneManager.removeDotsAfterTween,
        onCompleteParams: [sprite],
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

  setDividerValueAfterBalance(zonePos: number, isPositive: boolean) {
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

  createDot(target: PowerZone, position: Array<Number>, color: string) {
        // console.log(target.powerZone);
    if (this.isInteractive) {
      if (this.operator_mode === OPERATOR_MODE.DIVIDE && this.base[1] === BASE.BASE_X) {
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

  setZoneTextAndAlphaStatus() {
        // Don't display leading zeroes
    let zoneIsEmpty = true;
    for (let i = this.totalZoneCount - 1; i >= 0; i -= 1) {
      zoneIsEmpty = this.allZones[i].checkTextAndAlpha(zoneIsEmpty);
    }
    zoneIsEmpty = true;
    if (this.operator_mode === OPERATOR_MODE.DIVIDE) {
      for (let i = this.totalZoneCount - 1; i >= 0; i -= 1) {
        zoneIsEmpty = this.allZones[i].checkDivideResultText(zoneIsEmpty);
      }
    }
  }

  /*inititalPopulate(dots: Array<DotVO>, isPositive: boolean) {
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

  addDotSpriteProperty(dot: DotVO, dotSprite: window.PIXI.Sprite) {
    dotSprite.anchor.set(0.5);
    dotSprite.x = dot.x;// eslint-disable-line no-param-reassign
    dotSprite.y = dot.y;// eslint-disable-line no-param-reassign
    dotSprite.interactive = true;// eslint-disable-line no-param-reassign
    dotSprite.buttonMode = true;// eslint-disable-line no-param-reassign
    dotSprite.world = this;// eslint-disable-line no-param-reassign
    dotSprite.on('pointerdown', this.onDragStart);
    dotSprite.on('pointerup', this.onDragEnd);
    dotSprite.on('pointerupoutside', this.onDragEnd);
    dotSprite.on('pointermove', this.onDragMove);
    dotSprite.alpha = 0;// eslint-disable-line no-param-reassign
    TweenMax.to(dotSprite, 1, { alpha: 1 });
  }

  removeDotSpriteListeners(sprite: window.PIXI.Sprite) {
    sprite.off('pointerdown', this.onDragStart);
    sprite.off('pointerup', this.onDragEnd);
    sprite.off('pointerupoutside', this.onDragEnd);
    sprite.off('pointermove', this.onDragMove);
    this.allZones[sprite.dot.powerZone].removeFromProximityManager(sprite);
  }

  onDragStart(e: window.PIXI.interaction.InteractionEvent) {
        // console.log('onDragStart', this.dot.isPositive);
    if (this.world.isInteractive) {
      const oldParent = this.parent;
      if (this.dot.isPositive) {
        this.world.allZones[this.dot.powerZone].positiveProximityManager.removeItem(this);
      } else {
        this.world.allZones[this.dot.powerZone].negativeProximityManager.removeItem(this);
      }
      this.origin = new Point(this.x, this.y);
      this.data = e.data;
      this.dragging = true;
      this.world.movingDotsContainer.addChild(this);
      const newPosition = this.data.getLocalPosition(this.parent);
      const originDiff = this.data.getLocalPosition(oldParent);
      this.originInMovingContainer = newPosition;
      this.originInMovingContainer.x += this.origin.x - originDiff.x;
      this.originInMovingContainer.y += this.origin.y - originDiff.y;
      this.position.x = newPosition.x;
      this.position.y = newPosition.y;
      if (this.dot.color === SPRITE_COLOR.RED) {
        this.particleEmitter = this.world.dragParticleEmitterRed;
      } else {
        this.particleEmitter = this.world.dragParticleEmitterBlue;
      }
      this.particleEmitter.updateOwnerPos(newPosition.x, newPosition.y);
      this.particleEmitter.start();
    }
  }

  onDragMove() {
    if (this.world.isInteractive && this.dragging) {
      const newPosition = this.data.getLocalPosition(this.parent);
      this.position.x = newPosition.x;
      this.position.y = newPosition.y;
      this.particleEmitter.updateOwnerPos(newPosition.x, newPosition.y);
    }
  }

  onDragEnd(e: window.PIXI.interaction.InteractionEvent) {
    if (this.world.isInteractive && this.dragging) {
      this.dragging = false;
      this.data = null;
      this.world.verifyDroppedOnZone(this, e.data);
      // dot may have been remove if dropped outside the boxes in freeplay,
      // so verify if it's still have a dot
      if (this.dot) {
        if (this.dot.isPositive) {
          // wait for the sprite to be back in place if dropped on an edge
          TweenMax.delayedCall(
              0.21,
              this.world.allZones[this.dot.powerZone].positiveProximityManager.addItem,
              [this],
              this.world.allZones[this.dot.powerZone].positiveProximityManager);
        } else {
          TweenMax.delayedCall(0.21,
              this.world.allZones[this.dot.powerZone].negativeProximityManager.addItem,
              [this],
              this.world.allZones[this.dot.powerZone].negativeProximityManager);
        }
      }
      this.particleEmitter.stop();
    }
    e.stopPropagation();
  }

  verifyDroppedOnZone(dotSprite: window.PIXI.Sprite, data: window.PIXI.interaction.InteractionData) {
        // console.log('verifyDroppedOnZone', dotSprite, data);
    const originalZoneIndex = dotSprite.dot.powerZone;
    const zoneOverInfo = this.getZoneUnderCursor(data);
    const droppedOnPowerZone = zoneOverInfo.droppedOnPowerZone;
    const droppedOnPowerZoneIndex = zoneOverInfo.droppedOnPowerZoneIndex;
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
            dotsToRemoveCount = Math.pow(this.base[1], diffZone * -1);
          } else {
            dotsToRemoveCount = this.base[0];
          }
          // console.log('dotsToRemoveCount', dotsToRemoveCount);
          // check if possible
          let finalNbOfDots = -1;
          if (dotSprite.dot.isPositive) {
            finalNbOfDots = Object.keys(this.allZones[originalZoneIndex].positiveDots).length - dotsToRemoveCount; // eslint-disable-line max-len
          } else {
            finalNbOfDots = Object.keys(this.allZones[originalZoneIndex].negativeDots).length - dotsToRemoveCount; // eslint-disable-line max-len
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
                }
              );
              this.isInteractive = false;
            } else {
              this.pendingAction.push(
                {
                  function: this.backIntoPlace,
                  params: [dotSprite, this.allZones[originalZoneIndex].negativeDotsContainer],
                }
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
          const dataLocalZone = data.getLocalPosition(droppedOnPowerZone);
          this.tweenDotsToNewZone(
              originalZoneIndex,
              droppedOnPowerZone,
              dotsToRemoveCount,
              dataLocalZone,
              dotSprite.dot.isPositive);
          // Add the new dots
          const dotsPos = [];
          let newNbOfDots = Math.pow(this.base[1], diffZone);
          newNbOfDots -= this.base[0];
                    // console.log('newNbOfDots', newNbOfDots, diffZone);
          for (let i = 0; i < newNbOfDots; i += 1) {
            dotsPos.push({
              x: randomFromTo(POSITION_INFO.DOT_RAYON, droppedOnPowerZone.hitArea.width - POSITION_INFO.DOT_RAYON), // eslint-disable-line max-len
              y: randomFromTo(POSITION_INFO.DOT_RAYON, droppedOnPowerZone.hitArea.height - POSITION_INFO.DOT_RAYON), // eslint-disable-line max-len
            });
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
              }
            );
          } else {
            this.pendingAction.push(
              {
                function: this.backIntoPlace,
                params: [dotSprite, this.allZones[originalZoneIndex].negativeDotsContainer],
              }
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
          } else if (newPosition.x > droppedOnPowerZone.hitArea.width - POSITION_INFO.DOT_RAYON) {
            modifyPosition.x = droppedOnPowerZone.hitArea.width - POSITION_INFO.DOT_RAYON;
            doTween = true;
          }
          if (newPosition.y < POSITION_INFO.DOT_RAYON) {
            modifyPosition.y = POSITION_INFO.DOT_RAYON;
            doTween = true;
          } else if (newPosition.y > droppedOnPowerZone.hitArea.height - POSITION_INFO.DOT_RAYON) {
            modifyPosition.y = droppedOnPowerZone.hitArea.height - POSITION_INFO.DOT_RAYON;
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
              const allRemovedDots = [];
              const negativeSprite = this.allZones[originalZoneIndex].negativeDotsContainer.getChildAt(0); // eslint-disable-line max-len
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
                }
              );
            }
          } else if (dotSprite.dot.isPositive === false) {
            // Negative dot drag into positive zoe
            if (Object.keys(this.allZones[originalZoneIndex].positiveDots).length > 0) {
              const allRemovedDots = [];
              const positiveSprite = this.allZones[originalZoneIndex].positiveDotsContainer.getChildAt(0); // eslint-disable-line max-len
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
                }
              );
            }
          }
        }
      }
    } else if (droppedOnPowerZoneIndex === -1 || droppedOnPowerZone === null) {
      // Dropped outside any zone
      if (droppedOnPowerZone === this.leftMostZone) {
        // Dropped on the fake zone at the left
        this.soundManager.playSound(SoundManager.ERROR);
        this.displayUserMessage(ERROR_MESSAGE.NO_GREATER_ZONE);
        if (dotSprite.dot.isPositive) {
          this.pendingAction.push(
            {
              function: this.backIntoPlace,
              params: [dotSprite, this.allZones[originalZoneIndex].positiveDotsContainer],
            }
          );
        } else {
          this.pendingAction.push(
            {
              function: this.backIntoPlace,
              params: [dotSprite, this.allZones[originalZoneIndex].negativeDotsContainer],
            }
          );
        }
        this.isInteractive = false;
      } else if (this.usage_mode === USAGE_MODE.FREEPLAY) {
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

  getZoneUnderCursor(data: window.PIXI.interaction.InteractionData): zoneUnderCursor {
    let droppedOnPowerZone: PowerZone;
    let droppedOnPowerZoneIndex: number = -1;
    let actualZone: PowerZone;
        // verify dropped on left test zone
    let dataLocalZone = data.getLocalPosition(this.leftMostZone);
    if (isPointInRectangle(dataLocalZone, this.leftMostZone.hitArea)) {
      droppedOnPowerZone = this.leftMostZone;

      return new zoneUnderCursor(null, droppedOnPowerZone, droppedOnPowerZoneIndex);
    }
    this.allZones.forEach((zone: PowerZone) => {
      dataLocalZone = data.getLocalPosition(zone.positiveDotsContainer);
      if (isPointInRectangle(dataLocalZone, zone.positiveDotsContainer.hitArea)) {
        droppedOnPowerZone = zone.positiveDotsContainer;
        droppedOnPowerZoneIndex = zone.zonePosition;
        actualZone = zone;
      }
      if (zone.negativeDotsContainer != null) {
        dataLocalZone = data.getLocalPosition(zone.negativeDotsContainer);
        if (isPointInRectangle(dataLocalZone, zone.negativeDotsContainer.hitArea)) {
          droppedOnPowerZone = zone.negativeDotsContainer;
          droppedOnPowerZoneIndex = zone.zonePosition;
          actualZone = zone;
        }
      }
    });
    return new zoneUnderCursor(actualZone, droppedOnPowerZone, droppedOnPowerZoneIndex);
  }

  backIntoPlace(dotSprite: window.PIXI.Sprite, currentZone: PowerZone) {
    this.soundManager.playSound(SoundManager.BACK_INTO_PLACE);
    this.isInteractive = false;
    TweenMax.to(dotSprite, 1, {
      x: dotSprite.originInMovingContainer.x,
      y: dotSprite.originInMovingContainer.y,
      onComplete: this.backIntoPlaceDone.bind(this),
      onCompleteParams: [dotSprite, currentZone],
      ease: Quint.easeInOut,
    });
    TweenMax.to(dotSprite, 0.5, {
      height: dotSprite.height / 2,
      repeat: 1,
      yoyo: true,
    });
  }

  backIntoPlaceDone(dotSprite: window.PIXI.Sprite, currentZone: PowerZone) {
    currentZone.addChild(dotSprite);
    dotSprite.position = dotSprite.origin; // eslint-disable-line no-param-reassign
    this.isInteractive = true;
  }

  addDraggedToNewZone(dotSprite: window.PIXI.Sprite, newZone: PowerZone, positionToBeMovedTo: window.PIXI.Point, updateValue: boolean) {
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

  tweenDotsToNewZone(
    originalZoneIndex: number,
    droppedOnPowerZone: PowerZone,
    dotsToRemov: number,
    positionToBeMovedTo: window.PIXI.Point,
    isPositive: boolean) {
    // console.log('tweenDotsToNewZone', positionToBeMovedTo);
    // get the original on zone
    let dotsToRemove = dotsToRemov;
    let dotContainer;
    if (droppedOnPowerZone.isPositive) {
      dotContainer = this.allZones[originalZoneIndex].positiveDotsContainer;
    } else {
      dotContainer = this.allZones[originalZoneIndex].negativeDotsContainer;
    }
        //  For 2 > 3 base.
    if (this.base[0] > 1) {
      dotsToRemove -= (this.base[0] - 1);
      const dotsToRezone = this.base[0] - 1;
      for (let i = 0; i < dotsToRezone; i += 1) {
        const dotSprite = dotContainer.getChildAt(0);
        dotSprite.origin = new Point();
        dotSprite.origin.copy(dotSprite.position);
        const newPosition = this.movingDotsContainer.toLocal(dotSprite.position, dotSprite.parent);
        const adjacentPosition = positionToBeMovedTo.clone();
        const quadrant = findQuadrant(adjacentPosition, droppedOnPowerZone.hitArea);
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
          x: finalPosition.x,
          y: finalPosition.y,
          onComplete: this.addDraggedToNewZone.bind(this),
          onCompleteParams: [dotSprite, droppedOnPowerZone, adjacentPosition, true],
        });
      }
            // this.checkIfNotDisplayedSpriteCanBe();
    }
    let allRemovedDots = [];
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
          x: finalPosition.x,
          y: finalPosition.y,
          onComplete: this.tweenDotsToNewZoneDone.bind(this),
          onCompleteParams: [dotSprite],
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

  getExplosionEmitter(): ParticleEmitter {
    if (this.explodeEmitter.length > 0) {
      return this.explodeEmitter.pop();
    }
    return new ParticleEmitter(this.movingDotsContainer, this.textures['red_dot.png'], explodeJSON);
  }

  getImplosionEmitter(): ParticleEmitter {
    if (this.implodeEmitter.length > 0) {
      return this.implodeEmitter.pop();
    }
    return new ParticleEmitter(this.movingDotsContainer, this.textures['red_dot.png'], implodeJSON);
  }

  stopExplosionEmitter(explosionEmitter: ParticleEmitter) {
    explosionEmitter.stop();
    this.explodeEmitter.push(explosionEmitter);
  }

  stopImplosionEmitter(implosionEmitter: ParticleEmitter) {
    implosionEmitter.stop();
    this.implodeEmitter.push(implosionEmitter);
  }

  tweenDotsToNewZoneDone(dotSprite: window.PIXI.Sprite) {
    TweenMax.to(
      dotSprite,
      0.3,
      {
        alpha: 0,
        onComplete: this.removeTweenDone.bind(this),
        onCompleteParams: [dotSprite],
      }
    );
  }

  removeTweenDone(dotSprite: window.PIXI.Sprite) {
    dotSprite.parent.removeChild(dotSprite);
    this.spritePool.dispose(dotSprite, dotSprite.dot.isPositive, dotSprite.dot.color);
  }

  doBaseChange(base: Array<number | string>, placeValueOn: boolean) {
    this.base = base;
    this.allZones.forEach((zone) => {
      zone.baseChange(base, placeValueOn);
    });
  }

  setValueTextAlpha(placeValueOn: boolean) {
    this.allZones.forEach((zone) => {
      zone.setValueTextAlpha(placeValueOn ? 1 : 0);
    });
  }

  checkPendingAction(userMessage: string) {
    // console.log('checkPendingAction', nextProps, nextProps.userMessage);
    if (userMessage === '') {
      while (this.pendingAction.length > 0) {
        const action = this.pendingAction.shift();
        action.function.apply(this, action.params);
      }
    }
  }

  magicWand() {
    const base = this.base[1];
    let dotsRemoved = [];
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
            this.allZones[i].getPositiveNegativeOverdot(overdotCount, true)
          );
          dotsRemoved = dotsRemoved.concat(
            this.allZones[i].getPositiveNegativeOverdot(overdotCount, false)
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
              this.addDot(i + 1, new Point([randomFromTo(0, BOX_INFO.BOX_WIDTH), randomFromTo(0, BOX_INFO.HALF_BOX_HEIGHT)]), true, SPRITE_COLOR.RED); // eslint-disable-line max-len
            } else {
              this.addDot(i + 1, [randomFromTo(0, BOX_INFO.BOX_WIDTH), randomFromTo(0, BOX_INFO.HALF_BOX_HEIGHT)], false, SPRITE_COLOR.RED); // eslint-disable-line max-len
            }
          } else {
            this.addDot(i + 1, [randomFromTo(0, BOX_INFO.BOX_WIDTH), randomFromTo(0, BOX_INFO.BOX_HEIGHT)], true, SPRITE_COLOR.RED); // eslint-disable-line max-len
          }
          break;
        }
      }
    }
  }

  removeDotsFromStateChange(positivePowerZoneDots: Array<DotVO>, negativePowerZoneDots: Array<DotVO>) {
    // console.log('removeDotsFromStateChange');
    for (let i = 0; i < this.allZones.length; i += 1) {
      /* console.log('removeDotsFromStateChange',
        i,
        Object.keys(this.props.positivePowerZoneDots[i]).length);*/
      let removedDots = this.allZones[i].removeDotsIfNeeded(positivePowerZoneDots[i], true);
      removedDots.forEach((dotVO: DotVO) => {
        if (dotVO.sprite) {
          this.removeDotSpriteListeners(dotVO.sprite);
          this.spritePool.dispose(dotVO.sprite, dotVO.isPositive, dotVO.color);
          dotVO.sprite = null;
        }
      });
      removedDots = this.allZones[i].removeDotsIfNeeded(negativePowerZoneDots[i], false);
      removedDots.forEach((dotVO: DotVO) => {
        if (dotVO.sprite) {
          this.removeDotSpriteListeners(dotVO.sprite);
        }
      });
    }
    this.checkIfNotDisplayedSpriteCanBe();
  }

  checkIfNotDisplayedSpriteCanBe() {
    let addedDots = [];
    this.allZones.forEach((zone) => {
      addedDots = addedDots.concat(zone.checkIfNotDisplayedSpriteCanBe());
    });
    addedDots.forEach((dot) => {
      this.addDotSpriteProperty(dot, dot.sprite);
    });
  }

  addDotsFromStateChange(positivePowerZoneDots: Array<DotVO>, negativePowerZoneDots: Array<DotVO>) {
        // console.log('addDotsFromStateChange1');
    let allDots = [];
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

  adjustDividerDotFromStateChange(positiveDividerDots: Array<mixed>, negativeDividerDots: Array<mixed>) {
    this.dividerZoneManager.removeDots(positiveDividerDots, negativeDividerDots);
    this.dividerZoneManager.addDots(positiveDividerDots, negativeDividerDots);
  }

  populateDivideResult(positiveDividerResult: Array<mixed>, negativeDividerResult: Array<mixed>) {
        // console.log('populateDivideResult', positiveDividerResult, negativeDividerResult);
    const positiveDots = [];
    const negativeDots = [];
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

  showDividerAndResult() {
    this.dividerZoneManager.x = 957;
    this.dividerZoneManager.y = 375;
    this.addChild(this.dividerZoneManager);
    this.dividerZoneManager.start();

    this.dividerResult.x = 100;
    this.dividerResult.y = 375;
    this.addChild(this.dividerResult);
  }

  checkInstability() {
    let isOverload;
    let overloadExist = false;
    let isSignInstability;
    let instabilityExist = false;
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

  animationCallback() {
    // requestAnimationFrame(this.animationCallback.bind(this));
    this.allZones.forEach((zone) => {
      zone.update();
    });
  }

  checkResult() {
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

  reset() {
    // console.log('PowerZoneManager reset');
    TweenMax.killAll(true);
    if(this.allZones) {
      this.allZones.forEach((zone) => {
        zone.reset();
      });
    }
    if (this.dividerZoneManager) {
      this.dividerZoneManager.reset();
    }
    if(this.soundManager) {
      this.soundManager.stopSound(SoundManager.BOX_OVERLOAD);
      this.soundManager.stopSound(SoundManager.BOX_POSITIVE_NEGATIVE);
    }
  }

  destroy() {
    this.reset();
    this.ticker.stop();
    let key;
    if (this.allZones) {
      this.allZones.forEach((zone) => {
        // eslint-disable-next-line no-restricted-syntax
        for (key in zone.positiveDots) {
          if (zone.positiveDots[key].sprite) {
            this.removeDotSpriteListeners(zone.positiveDots[key].sprite);
          }
        }
        // eslint-disable-next-line no-restricted-syntax
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
}


export class zoneUnderCursor {
  droppedOnPowerZone: PowerZone;
  droppedOnPowerZoneIndex: number;
  actualZone: PowerZone;
}
