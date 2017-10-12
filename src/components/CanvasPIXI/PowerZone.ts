import { TweenMax, RoughEase, Linear, Bounce, Elastic, Power3 } from 'gsap';
import { EventEmitter } from 'eventemitter3';
import {
  BASE, OPERATOR_MODE, USAGE_MODE, BOX_INFO, POSITION_INFO, MAX_DOT, SPRITE_COLOR,
  DOT_ACTIONS, TWEEN_TIME, IUSAGE_MODE, IOPERATOR_MODE,
} from '../../Constants';
import { ProximityManager } from '../../utils/ProximityManager';
import { convertBase } from '../../utils/MathUtils';
import { DotVO } from '../../VO/DotVO';
import { SpritePool } from '../../utils/SpritePool';
import {DotsContainer} from './DotsContainer';
import {DotSprite} from './DotSprite';
import AnimatedSprite = PIXI.extras.AnimatedSprite;
import TextureDictionary = PIXI.loaders.TextureDictionary;
import Sprite = PIXI.Sprite;
import DisplayObject = PIXI.DisplayObject;
import InteractionEvent = PIXI.interaction.InteractionEvent;
import Rectangle = PIXI.Rectangle;
import Point = PIXI.Point;

export type IBG_MODE = 'BG_NEUTRAL' | 'BG_GREEN' | 'BG_RED';

export class PowerZone extends PIXI.Container {

  public static BG_NEUTRAL: IBG_MODE = 'BG_NEUTRAL';
  public static BG_GREEN: IBG_MODE = 'BG_GREEN';
  public static BG_RED: IBG_MODE = 'BG_RED';
  public static CREATE_DOT: string = 'CREATE_DOT';
  public static DIVIDER_OVERLOAD: string = 'DIVIDER_OVERLOAD';
  public static ADD_DOT_PROPERTIES: string = 'ADD_DOT_PROPERTIES';

  private static getDotsFromHash(hash: IDotVOHash<DotVO>,
                                 amount: number): DotVO[] {
    const allRemovedDots: DotVO[] = new Array<DotVO>();
    let toRemove: number = amount - 1;
    while (toRemove >= 0) {
      allRemovedDots.push(hash[Object.keys(hash)[toRemove]]);
      toRemove -= 1;
    }
    return allRemovedDots;
  }

  public positiveDots: IDotVOHash<DotVO> = {};
  public negativeDots: IDotVOHash<DotVO> = {};
  public positiveDotsContainer: DotsContainer;
  public negativeDotsContainer: DotsContainer;
  public divisionGhostContainer: DotsContainer;
  public eventEmitter: EventEmitter;
  public positiveDotCount: number;
  public negativeDotCount: number;
  public zonePosition: number = 0;
  public positiveDivisionValue: number = 0;
  public negativeDivisionValue: number = 0;
  public bgBox: PIXI.Sprite;
  public isActive: boolean = true;

  private positiveProximityManager: ProximityManager;
  private negativeProximityManager: ProximityManager;
  private positiveDotNotDisplayed: IDotVOHash<DotVO> = {};
  private negativeDotNotDisplayed: IDotVOHash<DotVO> = {};
  private positiveDividerText: PIXI.Text;
  private negativePresent: boolean = false;
  private base: Array<number | string>;
  private totalZoneCount: number = 0;
  private maxDotsByZone: number = 0;
  private spritePool: SpritePool;
  private bgBoxTextures: PIXI.Texture[] = new Array<PIXI.Texture>();
  private placeValueText: PIXI.Text;
  private placeValueExponent: PIXI.Text;
  private textures: PIXI.loaders.TextureDictionary;
  private pointerDownPosition: Point | null;
  private createDotFunc: () => any;
  private pointerDownFunc: () => any;

  constructor(position: number,
              textures: TextureDictionary,
              base: Array<number | string>,
              negativePresent: boolean,
              usageMode: IUSAGE_MODE,
              operatorMode: IOPERATOR_MODE,
              totalZoneCount: number,
              spritePool: SpritePool) {
    super();
    this.textures = textures;
    this.zonePosition = totalZoneCount - position - 1;
    this.negativePresent = negativePresent;
    this.base = base;
    this.totalZoneCount = totalZoneCount;
    this.spritePool = spritePool;
    this.maxDotsByZone = negativePresent ? MAX_DOT.MIX : MAX_DOT.ONLY_POSITIVE;
    this.eventEmitter = new EventEmitter();
    this.bgBoxTextures.push(textures['box.png']);
    this.bgBoxTextures.push(textures['box_yes.png']);
    this.bgBoxTextures.push(textures['box_no.png']);
    this.bgBoxTextures.push(textures['box_unstable.png']);
    this.bgBox = new PIXI.Sprite(this.bgBoxTextures[0]);
    this.bgBox.x = position * (BOX_INFO.BOX_WIDTH + BOX_INFO.GUTTER_WIDTH);
    this.bgBox.y = BOX_INFO.BOX_Y;
    this.addChild(this.bgBox);

    this.createDotFunc = this.createDot.bind(this);
    this.pointerDownFunc = this.pointerDown.bind(this);

    if (base[1] === BASE.BASE_X) {
      this.placeValueText = new PIXI.Text('X', {
        align: 'center',
        fill: 0xBCBCBC,
        fontFamily: 'Nunito',
        fontSize: 40,
      });
      if (this.zonePosition === 0) {
        this.placeValueText.text = '1';
      } else if (this.zonePosition !== 1) {
        this.placeValueExponent = new PIXI.Text(this.zonePosition.toString(), {
          align: 'center',
          fill: 0xBCBCBC,
          fontFamily: 'Nunito',
          fontSize: 25,
        });
      }
    } else {
      let text: string;
      if (base[0] === 1 || this.zonePosition === 0) {
        text = String(Math.pow(base[1] as number, this.zonePosition));
      } else {
        text = `(${String(`${Math.pow(base[1] as number, this.zonePosition)}/${Math.pow(base[0] as number, this.zonePosition)}`)})`; // tslint:disable-line max-line-length
      }
      this.placeValueText = new PIXI.Text(text, {
        align: 'center',
        fill: 0xBCBCBC,
        fontFamily: 'Nunito',
        fontSize: 40,
      });
    }
    this.placeValueText.anchor.x = 0.5;
    let xPos: number = (position * (BOX_INFO.BOX_WIDTH + BOX_INFO.GUTTER_WIDTH));
    xPos += BOX_INFO.BOX_WIDTH / 2;
    this.placeValueText.x = xPos;
    this.placeValueText.y = (BOX_INFO.BOX_Y + BOX_INFO.HALF_BOX_HEIGHT) - 22;
    this.addChild(this.placeValueText);
    if (this.placeValueExponent !== undefined) {
      this.placeValueExponent.anchor.x = 0.5;
      this.placeValueExponent.x = this.placeValueText.x + 25;
      this.placeValueExponent.y = this.placeValueText.y - 5;
      this.addChild(this.placeValueExponent);
    }

    if (operatorMode === OPERATOR_MODE.DIVIDE) {
      this.positiveDividerText = new PIXI.Text('', {
        align: 'center',
        fill: 0x565656,
        fontFamily: 'Nunito',
        fontSize: 24,
      });
      this.positiveDividerText.anchor.x = 0.5;
      xPos = position * (BOX_INFO.BOX_WIDTH + BOX_INFO.GUTTER_WIDTH);
      xPos += BOX_INFO.BOX_WIDTH / 2;
      // xPos -= this.positiveDivideCounter.width / 2;
      this.positiveDividerText.x = xPos;
      // this.positiveDividerText.y = BOX_INFO.BOX_Y + 3;
      this.positiveDividerText.y = BOX_INFO.BOX_Y - 30;
      this.addChild(this.positiveDividerText);

      this.divisionGhostContainer = new DotsContainer();
      this.divisionGhostContainer.x = (position * (BOX_INFO.BOX_WIDTH + BOX_INFO.GUTTER_WIDTH)) + 5.5;
      this.divisionGhostContainer.y = BOX_INFO.BOX_Y + 5;
      this.addChild(this.divisionGhostContainer);
    }

    if (negativePresent) {
      const separator: Sprite = new Sprite(textures['separator.png']);
      separator.x = (position * (BOX_INFO.BOX_WIDTH + BOX_INFO.GUTTER_WIDTH)) + 5;
      separator.y = BOX_INFO.BOX_Y + BOX_INFO.HALF_BOX_HEIGHT;
      this.addChild(separator);

      this.positiveDotsContainer = new DotsContainer();
      this.positiveDotsContainer.x = (position * (BOX_INFO.BOX_WIDTH + BOX_INFO.GUTTER_WIDTH)) + 5.5;
      this.positiveDotsContainer.y = BOX_INFO.BOX_Y + 5;
      this.addChild(this.positiveDotsContainer);
      this.positiveDotsContainer.interactive = true;

      this.positiveDotsContainer.hitArea = new PIXI.Rectangle(
        2,
        0,
        BOX_INFO.BOX_WIDTH,
        BOX_INFO.HALF_BOX_HEIGHT - 4,
      );
      this.positiveProximityManager = new ProximityManager(this.positiveDotsContainer.hitArea);
      this.positiveDotsContainer.powerZone = totalZoneCount - position - 1;
      this.positiveDotsContainer.isPositive = true;

      if (usageMode === USAGE_MODE.FREEPLAY ||
        (operatorMode === OPERATOR_MODE.DIVIDE && base[1] === BASE.BASE_X)) {
        // Dot can be added in division in base X
        this.positiveDotsContainer.buttonMode = true;
        this.positiveDotsContainer.on('pointerdown', this.pointerDownFunc);
        this.positiveDotsContainer.on('pointerup', this.createDotFunc);
      }

      this.negativeDotsContainer = new DotsContainer();
      this.negativeDotsContainer.x = (position * (BOX_INFO.BOX_WIDTH + BOX_INFO.GUTTER_WIDTH)) + 5.5;
      this.negativeDotsContainer.y = BOX_INFO.BOX_Y + BOX_INFO.HALF_BOX_HEIGHT + 1;
      this.addChild(this.negativeDotsContainer);
      this.negativeDotsContainer.interactive = true;
      this.negativeDotsContainer.hitArea = new PIXI.Rectangle(
        0,
        0,
        BOX_INFO.BOX_WIDTH,
        BOX_INFO.HALF_BOX_HEIGHT,
      );
      this.negativeProximityManager = new ProximityManager(this.negativeDotsContainer.hitArea);
      this.negativeDotsContainer.powerZone = totalZoneCount - position - 1;
      this.negativeDotsContainer.isPositive = false;
      if (usageMode === USAGE_MODE.FREEPLAY ||
        (operatorMode === OPERATOR_MODE.DIVIDE && base[1] === BASE.BASE_X)) {
        // Dot can be added in division in base X
        this.negativeDotsContainer.buttonMode = true;
        this.negativeDotsContainer.on('pointerdown', this.pointerDownFunc);
        this.negativeDotsContainer.on('pointerup', this.createDotFunc);
      }
    } else {
      this.positiveDotsContainer = new DotsContainer();
      this.positiveDotsContainer.x = (position * (BOX_INFO.BOX_WIDTH + BOX_INFO.GUTTER_WIDTH)) + 5.5;
      this.positiveDotsContainer.y = BOX_INFO.BOX_Y + 5;
      this.addChild(this.positiveDotsContainer);
      this.positiveDotsContainer.interactive = true;
      this.positiveDotsContainer.hitArea = new PIXI.Rectangle(
        0,
        0,
        BOX_INFO.BOX_WIDTH,
        BOX_INFO.BOX_HEIGHT,
      );
      this.positiveProximityManager = new ProximityManager(this.positiveDotsContainer.hitArea);
      this.positiveDotsContainer.powerZone = totalZoneCount - position - 1;
      this.positiveDotsContainer.isPositive = true;
      if (usageMode === USAGE_MODE.FREEPLAY ||
        (usageMode === USAGE_MODE.OPERATION &&
        operatorMode === OPERATOR_MODE.DIVIDE
        && base[1] === BASE.BASE_X)) {
        // Dot can ba added in freeplay or in division in base X
        this.positiveDotsContainer.buttonMode = true;
        this.positiveDotsContainer.on('pointerdown', this.pointerDownFunc);
        this.positiveDotsContainer.on('pointerup', this.createDotFunc);
      }
    }
    this.x += BOX_INFO.LEFT_GUTTER;
  }

  public checkTextAndAlpha(doCheck: boolean): boolean {
    // console.log('checkTextAndAlpha', this.zonePosition, doCheck);
    if (doCheck && this.zonePosition !== 0) {
      let positiveZoneIsEmpty: boolean = Object.keys(this.positiveDots).length === 0;
      // console.log('checkTextAndAlpha', this.zonePosition, positiveZoneIsEmpty);
      let negativeZoneIsEmpty: boolean = true;
      if (this.negativePresent) {
        negativeZoneIsEmpty = Object.keys(this.negativeDots).length === 0;
      }
      if (negativeZoneIsEmpty === false && positiveZoneIsEmpty) {
        positiveZoneIsEmpty = Object.keys(this.positiveDots).length === 0;
      }
      if (positiveZoneIsEmpty === true &&
        (this.negativePresent === false || negativeZoneIsEmpty === true)) {
        this.isActive = false;
        this.bgBox.texture = this.bgBoxTextures[0];
        this.bgBox.alpha = 0.5;
      } else {
        this.isActive = true;
        if (Object.keys(this.positiveDots).length > Number(this.base[1]) - 1) {
          this.bgBox.texture = this.bgBoxTextures[3];
        } else {
          this.bgBox.texture = this.bgBoxTextures[0];
        }
        this.bgBox.alpha = 1;
      }
      return positiveZoneIsEmpty && negativeZoneIsEmpty;
    } else {
      if (Object.keys(this.positiveDots).length > Number(this.base[1]) - 1 || Object.keys(this.negativeDots).length > Number(this.base[1]) - 1) {
        this.bgBox.texture = this.bgBoxTextures[3];
      } else {
        this.bgBox.texture = this.bgBoxTextures[0];
        this.bgBox.alpha = 1;
      }
    }
    this.isActive = true;
    return false;
  }

  // to show or hide divider text based on other divider
  public checkDivideResultText(doCheck: boolean): boolean {
        // console.log('checkDivideResultText', doCheck, this.zonePosition);
    if (this.positiveDividerText != null) {
      if (doCheck) {
        // check before populate
        const dividerIsEmpty: boolean = this.getDividerTextStatus(this.positiveDividerText, false);
        if (dividerIsEmpty) {
          this.positiveDividerText.visible = false;
        } else {
          this.positiveDividerText.visible = true;
        }
        return dividerIsEmpty;
      }
      // force show
      this.positiveDividerText.visible = true;
      return false;
    }
    return false;
  }

  public removeFromProximityManager(sprite: DotSprite): void {
    // console.log('removeFromProximityManager', this.zonePosition);
    if (sprite.dot.isPositive) {
      this.positiveProximityManager.removeItem(sprite);
    } else {
      this.negativeProximityManager.removeItem(sprite);
    }
  }

  public addToProximityManager(sprite: DotSprite): void {
    // console.log('addToProximityManager', sprite.dot.isPositive);
    if (sprite.dot.isPositive) {
      this.positiveProximityManager.addItem(sprite);
    } else {
      this.negativeProximityManager.addItem(sprite);
    }
  }

  public removeNotDisplayedDots(amount: number,
                                isPositive: boolean): DotVO[] {
    let localAmount: number = amount;
    let key: string; // tslint:disable-line prefer-const
    const removed: DotVO[] = new Array<DotVO>();
    if (localAmount > 0) {
      if (isPositive) {
        // tslint:disable-next-line forin
        for (key in this.positiveDotNotDisplayed) {
          removed.push(this.positiveDotNotDisplayed[key]);
          localAmount -= 1;
          if (localAmount === 0) {
            break;
          }
        }
        removed.forEach((dot) => {
          this.removeDotFromArray(dot);
        });
      } else {
        // tslint:disable-next-line forin
        for (key in this.negativeDotNotDisplayed) {
          removed.push(this.negativeDotNotDisplayed[key]);
          localAmount -= 1;
          if (localAmount === 0) {
            break;
          }
        }
        removed.forEach((dot) => {
          this.removeDotFromArray(dot);
        });
      }
    }
    return removed;
  }

  public removeDotFromArray(dot: DotVO): void {
    if (dot.isPositive) {
      delete this.positiveDots[dot.id];
    } else {
      delete this.negativeDots[dot.id];
    }
    this.removeDotFromNotDisplayedArray(dot);
  }

  public removeDotFromNotDisplayedArray(dot: DotVO): void {
    if (dot.isPositive) {
      if (this.positiveDotNotDisplayed[dot.id] !== undefined) {
        delete this.positiveDotNotDisplayed[dot.id];
      }
    } else if (this.negativeDotNotDisplayed[dot.id] !== undefined) {
      delete this.negativeDotNotDisplayed[dot.id];
    }
  }

  public addDotToArray(dot: DotVO): void {
    if (dot.isPositive) {
      this.positiveDots[dot.id] = dot;
    } else {
      this.negativeDots[dot.id] = dot;
    }
        // console.log('addDotToArray', this.zonePosition, this.positiveDots, this.negativeDots);
  }

    // remove dots from store change
  public removeDotsIfNeeded(storeHash: IDotVOHash<DotVO>,
                            isPositive: boolean): DotVO[] {
    // console.log('removeDotsIfNeeded', storeHash);
    let removedDots: DotVO[] = new Array<DotVO>();
    if (isPositive) {
      if (Object.keys(this.positiveDots).length +
        Object.keys(this.positiveDotNotDisplayed).length >
        Object.keys(storeHash).length) {
        removedDots = removedDots.concat(
          this.removeDotsFromArrayStoreChange(
            this.positiveDots,
            storeHash,
          ),
        );
      }
    } else if (Object.keys(this.negativeDots).length +
      Object.keys(this.negativeDotNotDisplayed).length >
      Object.keys(storeHash).length) {
      removedDots = removedDots.concat(
        this.removeDotsFromArrayStoreChange(
          this.negativeDots,
          storeHash,
        ),
      );
    }
    return removedDots;
  }

  public checkIfNotDisplayedSpriteCanBe(): DotVO[] {
    let addedDots: DotVO[] = new Array<DotVO>();
    addedDots = addedDots.concat(
      this.displayHiddenDots(
        this.positiveDotNotDisplayed,
        this.positiveDotsContainer,
      ),
    );
    addedDots = addedDots.concat(
      this.displayHiddenDots(
        this.negativeDotNotDisplayed,
        this.negativeDotsContainer,
      ),
    );
    // console.log('checkIfNotDisplayedSpriteCanBe', this.zonePosition, addedDots);
    return addedDots;
  }

  public addDotsFromStateChange(storePositiveDotsHash: IDotVOHash<DotVO>,
                                storeNegativeDotsHash: IDotVOHash<DotVO>): DotVO[] {
    let addedDots: DotVO[] = new Array<DotVO>();
    addedDots = addedDots.concat(
      this.doAddDotsFromStateChange(
        storePositiveDotsHash,
        this.positiveDots,
      ),
    );
    addedDots = addedDots.concat(
      this.doAddDotsFromStateChange(
        storeNegativeDotsHash,
        this.negativeDots,
      ),
    );
    return addedDots;
  }

  public getOvercrowding(amount: number): DotVO[] {
    // console.log('getOvercrowding', amount);
    let dotsRemoved: DotVO[] = new Array<DotVO>();
    if (Object.keys(this.positiveDots).length > amount - 1) {
      dotsRemoved = PowerZone.getDotsFromHash(this.positiveDots, amount);
    } else if (Object.keys(this.negativeDots).length > amount - 1) {
      dotsRemoved = PowerZone.getDotsFromHash(this.negativeDots, amount);
    }
    return dotsRemoved;
  }

  public getPositiveNegativeOverdot(amount: number,
                                    isPositive: boolean): DotVO[] {
    let key: string; // tslint:disable-line prefer-const
    const removed: DotVO[] = new Array<DotVO>();
    let myAmount: number = amount;
    if (myAmount > 0) {
      if (isPositive) {
        // tslint:disable-next-line forin
        for (key in this.positiveDots) {
          removed.push(this.positiveDots[key]);
          myAmount -= 1;
          if (myAmount === 0) {
            break;
          }
        }
      } else {
        // tslint:disable-next-line forin
        for (key in this.negativeDots) {
          removed.push(this.negativeDots[key]);
          myAmount -= 1;
          if (myAmount === 0) {
            break;
          }
        }
      }
    }
    return removed;
  }

  public checkOvercrowding(): boolean {
    // console.log('checkOvercrowding', this.zonePosition);
    let dotOverload: boolean = false;
    if (Object.keys(this.positiveDots).length > Number(this.base[1]) - 1) {
      this.bgBox.texture = this.bgBoxTextures[3];
      this.positiveDotsContainer.children.forEach((dotSprite: DotSprite) => {
        dotSprite.playOverload();
      });
      dotOverload = true;
    } else {
      this.positiveDotsContainer.children.forEach((dotSprite: DotSprite) => {
        dotSprite.returnToNormal();
        // console.log('returnToNormal 1', this.zonePosition);
      });
    }

    if (this.negativePresent) {
      if (Object.keys(this.negativeDots).length > Number(this.base[1]) - 1) {
        this.bgBox.texture = this.bgBoxTextures[3];
        this.negativeDotsContainer.children.forEach((dotSprite: DotSprite) => {
          dotSprite.playOverload();
        });
        dotOverload = true;
      } else {
        this.negativeDotsContainer.children.forEach((dotSprite: DotSprite) => {
          dotSprite.returnToNormal();
          // console.log('returnToNormal 2', this.zonePosition);
        });
      }
    }
    return dotOverload;
  }

  public checkPositiveNegativePresence(isOverload: boolean): boolean {
    // console.log('checkPositiveNegativePresence', isOverload, this.zonePosition);
    if (this.negativePresent && this.base[1] !== BASE.BASE_X && isOverload === false) {
      if (Object.keys(this.positiveDots).length > 0 &&
        Object.keys(this.negativeDots).length > 0) {
        this.positiveDotsContainer.children.forEach((dotSprite: DotSprite) => {
          dotSprite.playWiggleInstability();
        });
        this.negativeDotsContainer.children.forEach((dotSprite: DotSprite) => {
          dotSprite.playWiggleInstability();
        });
        return true;
      }
      this.positiveDotsContainer.children.forEach((dotSprite: DotSprite) => {
        dotSprite.returnToNormal();
        // console.log('returnToNormal 3', this.zonePosition);
      });
      this.negativeDotsContainer.children.forEach((dotSprite: DotSprite) => {
        dotSprite.returnToNormal();
        // console.log('returnToNormal 4', this.zonePosition);
      });
    }
    return false;
  }

  public baseChange(base: Array<number|string>): void {
        // console.log(base);
    this.base = base;
    if (this.base[1] === BASE.BASE_X) {
      this.setValueText('X');
      if (this.placeValueExponent !== null) {
        this.placeValueExponent.text = '2';
      }
    } else if (base[0] === 1 || this.zonePosition === 0) {
      this.setValueText(String(Math.pow(base[1] as number, this.zonePosition)));
    } else {
      // tslint:disable-next-line max-line-length
      this.setValueText(String(`${Math.pow(base[1] as number, this.zonePosition)}/${Math.pow(base[0] as number, this.zonePosition)}`));
    }
  }

  public setValueTextAlpha(alpha: number): void {
    this.placeValueText.alpha = alpha;
    if (this.placeValueExponent !== undefined) {
      this.placeValueExponent.alpha = alpha;
    }
  }

  public precalculateDotsForDivision(): void {
    this.positiveDotCount = Object.keys(this.positiveDots).length;
    this.negativeDotCount = Object.keys(this.negativeDots).length;
  }

  public setBackgroundColor(status: IBG_MODE): void {
    // console.log(this.zonePosition, this.isActive, status);
    if (this.isActive === true) {
      switch (status) {
        case PowerZone.BG_NEUTRAL:
          this.bgBox.texture = this.bgBoxTextures[0];
          this.bgBox.alpha = 1;
          break;
        case PowerZone.BG_GREEN:
          this.bgBox.texture = this.bgBoxTextures[1];
          break;
        case PowerZone.BG_RED:
          this.bgBox.texture = this.bgBoxTextures[2];
          break;
        default:
          this.bgBox.texture = this.bgBoxTextures[0];
          this.bgBox.alpha = 1;
      }
    } else {
      this.bgBox.texture = this.bgBoxTextures[0];
      this.bgBox.alpha = 0.5;
    }
  }

  public getDotsForDivision(amount: number,
                            isPositive: boolean): DotVO[] {
    let dotsRemoved: DotVO[] = new Array<DotVO>();
    if (isPositive) {
      if (Object.keys(this.positiveDots).length > amount - 1) {
        dotsRemoved = PowerZone.getDotsFromHash(this.positiveDots, amount);
      }
    } else if (Object.keys(this.negativeDots).length > amount - 1) {
      dotsRemoved = PowerZone.getDotsFromHash(this.negativeDots, amount);
    }
    return dotsRemoved;
  }

  public setDivisionValue(positive: number,
                          negative: number): void {
    // console.log('setDivisionValue', this.zonePosition, positive, negative);
    this.positiveDivisionValue = positive;
    this.negativeDivisionValue = negative;
    if (this.positiveDividerText !== null) {
      this.positiveDividerText.text = (this.positiveDivisionValue - this.negativeDivisionValue).toString();
      // check if division value exceed base
      if (this.base[1] !== BASE.BASE_X &&
        ((this.positiveDivisionValue - this.negativeDivisionValue) >= this.base[1] ||
          (this.positiveDivisionValue - this.negativeDivisionValue) <= -this.base[1])) {
        if (this.zonePosition !== this.totalZoneCount - 1) {
          // do animate if not the leftmost box
          this.eventEmitter.emit(
            PowerZone.DIVIDER_OVERLOAD,
            this.zonePosition,
            this.positiveDivisionValue > 0,
          );
        }
        this.positiveDividerText.style.fill = 0xff0000;
      }
    }
  }

  public onDividerOverloadSolved(isPositive: boolean): void {
    this.positiveDividerText.style.fill = 0x565656;
  }

  public onDividerAutoPopulated(isPositive: boolean): void {
    if (isPositive) {
      this.positiveDividerText.style.fill = 0x565656;
    }
  }

  public getDivisionTextPosition(): Point {
    return this.positiveDividerText.position as Point;
  }

  public update(): void {
        // console.log('update');
    if (this.negativePresent) {
      this.negativeProximityManager.draw();
      this.positiveProximityManager.draw();
    } else {
      this.positiveProximityManager.draw();
    }
  }

  public reset(): void {
    if (this.positiveDividerText !== undefined) {
      this.positiveDividerText.text = '0';
      // this.negativeDividerText.text = '0';
      this.positiveDividerText.style.fill = 0x565656;
      // this.negativeDividerText.style.fill = 0x565656;
    }
    if (this.divisionGhostContainer) {
      while (this.divisionGhostContainer.children.length > 0) {
        const child: DisplayObject = this.divisionGhostContainer.getChildAt(0);
        this.divisionGhostContainer.removeChild(child);
        child.destroy();
      }
    }
  }

  public destroy(): void {
    let sprite: DisplayObject;
    if (this.positiveDotsContainer) {
      while (this.positiveDotsContainer.children.length > 0) {
        sprite = this.positiveDotsContainer.removeChildAt(0);
        if ((<AnimatedSprite> sprite).stop) { // tslint:disable-line no-angle-bracket-type-assertion
          (sprite as AnimatedSprite).stop();
        }
      }
      this.positiveDotsContainer.off('pointerdown', this.pointerDownFunc);
      this.positiveDotsContainer.off('pointerup', this.createDotFunc);
      this.positiveDotsContainer.destroy();
    }
    if (this.positiveProximityManager) {
      this.positiveProximityManager.destroy();
    }
    if (this.negativePresent) {
      if (this.negativeDotsContainer) {
        while (this.negativeDotsContainer.children.length > 0) {
          sprite = this.negativeDotsContainer.removeChildAt(0);
          if ((<AnimatedSprite> sprite).stop) { // tslint:disable-line no-angle-bracket-type-assertion
            (sprite as AnimatedSprite).stop();
          }
        }
        this.positiveDotsContainer.off('pointerdown', this.pointerDownFunc);
        this.negativeDotsContainer.off('pointerup', this.createDotFunc);
        this.negativeDotsContainer.destroy();
      }
      if (this.negativeProximityManager) {
        this.negativeProximityManager.destroy();
      }
    }
  }

  private pointerDown(e: InteractionEvent): void {
    this.pointerDownPosition = e.data.getLocalPosition(e.target);
  }

  private createDot(e: InteractionEvent): void {
    // console.log('createDot', this.zonePosition);
    const clickPos: Point = e.data.getLocalPosition(e.target);
    if (this.pointerDownPosition && Math.hypot(this.pointerDownPosition.x - clickPos.x, this.pointerDownPosition.y - clickPos.y) < 10) {
      const hitArea: Rectangle = e.target.hitArea as Rectangle;
      const clickModifiedPos: number[] = new Array<number>();
      if (clickPos.x < POSITION_INFO.DOT_RAYON + 2) {
        clickModifiedPos.push(POSITION_INFO.DOT_RAYON + 2);
      } else if (clickPos.x > hitArea.width - POSITION_INFO.DOT_RAYON - 1) {
        clickModifiedPos.push(hitArea.width - POSITION_INFO.DOT_RAYON - 1);
      } else {
        clickModifiedPos.push(clickPos.x);
      }

      if (clickPos.y < POSITION_INFO.DOT_RAYON + 2) {
        clickModifiedPos.push(POSITION_INFO.DOT_RAYON + 2);
      } else if (clickPos.y > hitArea.height - POSITION_INFO.DOT_RAYON - 2) {
        clickModifiedPos.push(hitArea.height - POSITION_INFO.DOT_RAYON - 2);
      } else {
        clickModifiedPos.push(clickPos.y);
      }
      this.eventEmitter.emit(PowerZone.CREATE_DOT, e.target, clickModifiedPos, SPRITE_COLOR.RED);
      this.pointerDownPosition = null;
    }
  }

  private getZoneTextAndAlphaStatus(dots: IDotVOHash<DotVO>): boolean {
    let zoneAreEmpty: boolean = false;
    if (Object.keys(dots).length === 0) {
      zoneAreEmpty = true;
    }
    return Object.keys(dots).length === 0;
  }

  private getDividerTextStatus(dividerText: PIXI.Text,
                               populate: boolean): boolean {
    // console.log('getDividerTextStatus', dividerText.text, populate);
    let zoneAreEmpty: boolean = false;
    if (dividerText.text === '0' || dividerText.text === '-0') {
      if (populate === false && this.zonePosition !== 0) {
        zoneAreEmpty = true;
      }
    }
    return zoneAreEmpty;
  }

  private addDot(dot: DotVO): void {
    // console.log('addDot', this.zonePosition);
    let dotSprite: DotSprite | null;
    if (dot.isPositive) {
      dotSprite = this.addDotSprite(dot, this.positiveDotsContainer, this.positiveDotNotDisplayed);
      if (dotSprite) {
        dot.sprite = dotSprite;
        dotSprite.dot = dot;
      }
    } else {
      dotSprite = this.addDotSprite(dot, this.negativeDotsContainer, this.negativeDotNotDisplayed);
      if (dotSprite) {
        dot.sprite = dotSprite;
        dotSprite.dot = dot;
      }
    }
    this.addDotToArray(dot);
  }

  private addDotSprite(dot: DotVO,
                       container: DotsContainer,
                       notDisplayed: IDotVOHash<DotVO>): DotSprite | null {
    let dotSprite: DotSprite;
    if (container.children.length < this.maxDotsByZone) {
      dotSprite = this.spritePool.getOne(dot.color, dot.isPositive);
      container.addChild(dotSprite);
      if (dot.actionType === DOT_ACTIONS.NEW_DOT_FROM_CLICK) {
        dotSprite.playDrip();
        dot.actionType = '';
      }else if (dot.actionType === DOT_ACTIONS.NEW_DOT_ANTIDOT_FROM_CLICK) {
        dotSprite.playDrip();
        dot.actionType = '';
      }else if (dot.actionType === DOT_ACTIONS.NEW_DOT_FROM_MOVE) {
        dotSprite.x = dot.dropPosition.x;
        dotSprite.y = dot.dropPosition.y;
        TweenMax.to(
          dotSprite,
          TWEEN_TIME.EXPLODE_DOT,
          {
            x: dot.x,
            y: dot.y,
            ease: Power3.easeOut,
            onComplete: this.addDotPropertiesAfterAddCompleted,
            onCompleteParams: [dotSprite, dot],
            onCompleteScope: this,
          },
        );
      }
      return dotSprite;
    } else {
      notDisplayed[dot.id] = dot;
    }
    return null;
  }

  private addDotPropertiesAfterAddCompleted(dotSprite: DotSprite,
                                            dot: DotVO): void {
    dot.actionType = '';
    this.eventEmitter.emit(PowerZone.ADD_DOT_PROPERTIES, dotSprite, dot);
  }

  private removeDotsFromArrayStoreChange(localHash: IDotVOHash<DotVO>,
                                         storeHash: IDotVOHash<DotVO>): DotVO[] {
    // console.log('removeDotsFromArrayStoreChange', localHash, storeHash);
    const removedDots: DotVO[] = new Array<DotVO>();
    Object.keys(localHash).forEach((key) => {
      if (Object.prototype.hasOwnProperty.call(storeHash, key) === false) {
        const dot: DotVO = localHash[key];
        this.removeDotFromArray(dot);
        if (dot.sprite) {
          const dotSprite: DotSprite = dot.sprite;
          dotSprite.parent.removeChild(dotSprite);
          if (dotSprite.particleEmitter) {
            dotSprite.particleEmitter.stop();
          }
        }
        removedDots.push(dot);
      }
    });
    return removedDots;
  }

  private displayHiddenDots(notShowedArray: IDotVOHash<DotVO>,
                            container: DotsContainer): DotVO[] {
    const addedDots: DotVO[] = new Array<DotVO>();
    const notShowedCount: number = Object.keys(notShowedArray).length;
    if (notShowedCount > 0) {
      let toShowCount = this.maxDotsByZone - container.children.length;
      if (notShowedCount < toShowCount) {
        toShowCount = notShowedCount;
      }
      if (toShowCount > 0) {
        // tslint:disable-next-line forin
        for (const key in notShowedArray) {
          addedDots.push(notShowedArray[key]);
          toShowCount -= 1;
          if (toShowCount === 0) {
            break;
          }
        }
      }
    }
    addedDots.forEach((dot: DotVO) => {
      this.removeDotFromNotDisplayedArray(dot);
      let dotSprite: DotSprite;
      dotSprite = this.spritePool.getOne(dot.color, dot.isPositive);
      dot.sprite = dotSprite;
      dotSprite.dot = dot;
      addedDots.push(dot);
      container.addChild(dotSprite);
    });
    return addedDots;
  }

  private doAddDotsFromStateChange(storeHash: IDotVOHash<DotVO>,
                                   localHash: IDotVOHash<DotVO>): DotVO[] {
    const addedDots: DotVO[] = new Array<DotVO>();
    Object.keys(storeHash).forEach((key) => {
      if (Object.prototype.hasOwnProperty.call(localHash, key) === false) {
        addedDots.push(storeHash[key]);
        this.addDot(storeHash[key]);
      }
    });
    return addedDots;
  }

  private setValueText(text: string): void {
    this.placeValueText.text = text;
  }

}
