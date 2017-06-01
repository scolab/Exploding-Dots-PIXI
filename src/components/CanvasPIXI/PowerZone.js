import { TweenMax, RoughEase, Linear } from 'gsap';
import { EventEmitter } from 'eventemitter3';
import { BASE, OPERATOR_MODE, USAGE_MODE, BOX_INFO, POSITION_INFO, MAX_DOT, SPRITE_COLOR } from '../../Constants';
import { ProximityManager } from '../../utils/ProximityManager';
import { convertBase, randomFromTo } from '../../utils/MathUtils';
import { DotCounter } from './DotCounter';

// eslint-disable-next-line import/prefer-default-export
export class PowerZone extends PIXI.Container {

  static BG_NEUTRAL = 'BG_NEUTRAL';
  static BG_GREEN = 'BG_GREEN';
  static BG_RED = 'BG_RED';
  static CREATE_DOT = 'CREATE_DOT';
  static DIVIDER_OVERLOAD = 'DIVIDER_OVERLOAD';

  positiveDots = {};
  negativeDots = {};
  positiveDotNotDisplayed = {};
  negativeDotNotDisplayed = {};
  positiveDotCount;
  negativeDotCount;
  positiveDivisionValue = 0;
  negativeDivisionValue = 0;
  positiveDotsContainer = null;
  negativeDotsContainer = null;
  positiveDividerText = null;
  negativeDividerText = null;
  positiveProximityManager = null;
  negativeProximityManager = null;
  originalPositiveBoxPosition = null;// Point
  originalNegativeBoxPosition = null;// Point
  zonePosition = 0;
  negativePresent = false;
  isActive = true;
  base = [];
  totalZoneCount = 0;
  greyFilter = new PIXI.filters.ColorMatrixFilter();
  maxDotsByZone = 0;
  dotsCounterContainer = null;
  negativeDotsCounterContainer = null;
  spritePool = null;
  bgBox = null;
  bgBoxTextures = [];
  positiveDivideCounter;
  negativeDivideCounter;
  placeValueText;
  placeValueExponent = null;
  textures = null;

  static getDotsFromHash(hash, amount) {
    const allRemovedDots = [];
    let toRemove = amount - 1;
    while (toRemove >= 0) {
      allRemovedDots.push(hash[Object.keys(hash)[toRemove]]);
      toRemove -= 1;
    }
    return allRemovedDots;
  }

  constructor(position,
              textures,
              base,
              negativePresent,
              usageMode,
              operatorMode,
              totalZoneCount,
              spritePool) {
    super();
    this.textures = textures;
    this.zonePosition = totalZoneCount - position - 1;
    this.negativePresent = negativePresent;
    this.base = base;
    this.totalZoneCount = totalZoneCount;
    this.spritePool = spritePool;
    this.greyFilter.greyscale(0.3, true);
    this.maxDotsByZone = negativePresent ? MAX_DOT.MIX : MAX_DOT.ONLY_POSITIVE;
    this.eventEmitter = new EventEmitter();
    this.dotsCounterContainer = new DotCounter(
      position,
      textures['dot_value_left.png'],
      textures['dot_value_center.png'],
      textures['dot_value_right.png']);
    this.dotsCounterContainer.y = 40;
    let dotContainerXPos = (position * (BOX_INFO.BOX_WIDTH + BOX_INFO.GUTTER_WIDTH));
    dotContainerXPos += BOX_INFO.BOX_WIDTH / 2;
    dotContainerXPos -= this.dotsCounterContainer.getWidth() / 2;
    this.dotsCounterContainer.x = dotContainerXPos;
    this.addChild(this.dotsCounterContainer);

    if (negativePresent) {
      this.negativeDotsCounterContainer = new DotCounter(
        position,
        textures['antidot_value_left.png'],
        textures['antidot_value_center.png'],
        textures['antidot_value_right.png']);
      dotContainerXPos = (position * (BOX_INFO.BOX_WIDTH + BOX_INFO.GUTTER_WIDTH));
      dotContainerXPos += BOX_INFO.BOX_WIDTH / 2;
      dotContainerXPos -= this.negativeDotsCounterContainer.getWidth() / 2;
      this.negativeDotsCounterContainer.x = dotContainerXPos;
      this.negativeDotsCounterContainer.y = BOX_INFO.BOX_HEIGHT + 80;
      this.addChild(this.negativeDotsCounterContainer);
      this.negativeDotsCounterContainer.setStyle(0xFFFFFF);
    }

    this.bgBoxTextures.push(textures['box.png']);
    this.bgBoxTextures.push(textures['box_yes.png']);
    this.bgBoxTextures.push(textures['box_no.png']);
    this.bgBox = new PIXI.Sprite(this.bgBoxTextures[0]);
    this.bgBox.x = position * (BOX_INFO.BOX_WIDTH + BOX_INFO.GUTTER_WIDTH);
    this.bgBox.y = BOX_INFO.BOX_Y;
    this.addChild(this.bgBox);

    if (base[1] === BASE.BASE_X) {
      this.placeValueText = new PIXI.Text('X', {
        fontFamily: 'Noto Sans',
        fontWeight: 'bold',
        fontSize: 40,
        fill: 0xBCBCBC,
        align: 'center',
      });
      if (this.zonePosition === 0) {
        this.placeValueText.text = '1';
      } else if (this.zonePosition !== 1) {
        this.placeValueExponent = new PIXI.Text(this.zonePosition.toString(), {
          fontFamily: 'Noto Sans',
          fontWeight: 'bold',
          fontSize: 25,
          fill: 0xBCBCBC,
          align: 'center',
        });
      }
    } else {
      let text;
      if (base[0] === 1 || this.zonePosition === 0) {
        text = String(Math.pow(base[1], this.zonePosition));
      } else {
        text = `(${String(`${Math.pow(base[1], this.zonePosition)}/${Math.pow(base[0], this.zonePosition)}`)})`;
      }
      this.placeValueText = new PIXI.Text(text, {
        fontFamily: 'Noto Sans',
        fontWeight: 'bold',
        fontSize: 40,
        fill: 0xBCBCBC,
        align: 'center',
      });
    }
    this.placeValueText.anchor.x = 0.5;
    let xPos = (position * (BOX_INFO.BOX_WIDTH + BOX_INFO.GUTTER_WIDTH));
    xPos += BOX_INFO.BOX_WIDTH / 2;
    this.placeValueText.x = xPos;
    this.placeValueText.y = (BOX_INFO.BOX_Y + BOX_INFO.HALF_BOX_HEIGHT) - 22;
    this.addChild(this.placeValueText);
    if (this.placeValueExponent !== null) {
      this.placeValueExponent.anchor.x = 0.5;
      this.placeValueExponent.x = this.placeValueText.x + 25;
      this.placeValueExponent.y = this.placeValueText.y - 5;
      this.addChild(this.placeValueExponent);
    }


    if (operatorMode === OPERATOR_MODE.DIVIDE) {
      this.positiveDivideCounter = new PIXI.Sprite(textures['dot_div_value.png']);
      xPos = position * (BOX_INFO.BOX_WIDTH + BOX_INFO.GUTTER_WIDTH);
      xPos += BOX_INFO.BOX_WIDTH;
      xPos -= this.positiveDivideCounter.width;
      this.positiveDivideCounter.x = xPos;
      this.positiveDivideCounter.y = BOX_INFO.BOX_Y;
      this.addChild(this.positiveDivideCounter);

      this.positiveDividerText = new PIXI.Text('', {
        fontFamily: 'Noto Sans',
        fontWeight: 'bold',
        fontSize: 16,
        fill: 0x565656,
        align: 'center',
      });
      this.positiveDividerText.anchor.x = 0.5;
      xPos = position * (BOX_INFO.BOX_WIDTH + BOX_INFO.GUTTER_WIDTH);
      xPos += BOX_INFO.BOX_WIDTH;
      xPos -= this.positiveDivideCounter.width / 2;
      this.positiveDividerText.x = xPos;
      this.positiveDividerText.y = BOX_INFO.BOX_Y + 3;
      this.addChild(this.positiveDividerText);

      this.negativeDivideCounter = new PIXI.Sprite(textures['antidot_div_value.png']);
      this.negativeDivideCounter.x = (position * (BOX_INFO.BOX_WIDTH + BOX_INFO.GUTTER_WIDTH));
      let yPos = BOX_INFO.BOX_HEIGHT + BOX_INFO.BOX_Y;
      yPos -= this.negativeDivideCounter.height;
      yPos += 1;
      this.negativeDivideCounter.y = yPos;
      this.addChild(this.negativeDivideCounter);

      this.negativeDividerText = new PIXI.Text('', {
        fontFamily: 'Noto Sans',
        fontWeight: 'bold',
        fontSize: 16,
        fill: 0x565656,
        align: 'center',
      });
      this.negativeDividerText.anchor.x = 0.5;
      this.negativeDividerText.x = (position * (BOX_INFO.BOX_WIDTH + BOX_INFO.GUTTER_WIDTH)) + 15;
      this.negativeDividerText.y = this.negativeDivideCounter.y + 15;
      this.addChild(this.negativeDividerText);
    }

    if (negativePresent) {
      const separator = new PIXI.Sprite(textures['separator.png']);
      separator.x = (position * (BOX_INFO.BOX_WIDTH + BOX_INFO.GUTTER_WIDTH)) + 5;
      separator.y = BOX_INFO.BOX_Y + BOX_INFO.HALF_BOX_HEIGHT;
      this.addChild(separator);

      this.positiveDotsContainer = new PIXI.Container();
      this.positiveDotsContainer.x = position * (BOX_INFO.BOX_WIDTH + BOX_INFO.GUTTER_WIDTH);
      this.positiveDotsContainer.y = BOX_INFO.BOX_Y;
      this.addChild(this.positiveDotsContainer);
      this.positiveDotsContainer.interactive = true;
      this.originalPositiveBoxPosition = new PIXI.Point(
        this.positiveDotsContainer.position.x,
        this.positiveDotsContainer.position.y);

      this.positiveDotsContainer.hitArea = new PIXI.Rectangle(
        0,
        0,
        BOX_INFO.BOX_WIDTH,
        BOX_INFO.HALF_BOX_HEIGHT
      );
      this.positiveProximityManager = new ProximityManager(this.positiveDotsContainer.hitArea);
      this.positiveDotsContainer.powerZone = totalZoneCount - position - 1;
      this.positiveDotsContainer.isPositive = true;

      if (usageMode === USAGE_MODE.FREEPLAY ||
        (operatorMode === OPERATOR_MODE.DIVIDE && base[1] === BASE.BASE_X)) {
        // Dot can ba added in division in base X
        this.positiveDotsContainer.buttonMode = true;
        this.positiveDotsContainer.on('pointerup', this.createDot.bind(this));
      }

      this.negativeDotsContainer = new PIXI.Container();
      this.negativeDotsContainer.x = position * (BOX_INFO.BOX_WIDTH + BOX_INFO.GUTTER_WIDTH);
      this.negativeDotsContainer.y = BOX_INFO.BOX_Y + BOX_INFO.HALF_BOX_HEIGHT;
      this.addChild(this.negativeDotsContainer);
      this.negativeDotsContainer.interactive = true;
      this.originalNegativeBoxPosition = new PIXI.Point(
        this.negativeDotsContainer.position.x,
        this.negativeDotsContainer.position.y
      );
      this.negativeDotsContainer.hitArea = new PIXI.Rectangle(
        0,
        0,
        BOX_INFO.BOX_WIDTH,
        BOX_INFO.HALF_BOX_HEIGHT
      );
      this.negativeProximityManager = new ProximityManager(this.negativeDotsContainer.hitArea);
      this.negativeDotsContainer.powerZone = totalZoneCount - position - 1;
      this.negativeDotsContainer.isPositive = false;
      if (usageMode === USAGE_MODE.FREEPLAY ||
        (operatorMode === OPERATOR_MODE.DIVIDE && base[1] === BASE.BASE_X)) {
        // Dot can be added in division in base X
        this.negativeDotsContainer.buttonMode = true;
        this.negativeDotsContainer.on('pointerup', this.createDot.bind(this));
      }
    } else {
      this.positiveDotsContainer = new PIXI.Container();
      this.positiveDotsContainer.x = position * (BOX_INFO.BOX_WIDTH + BOX_INFO.GUTTER_WIDTH);
      this.positiveDotsContainer.y = BOX_INFO.BOX_Y;
      this.addChild(this.positiveDotsContainer);
      this.positiveDotsContainer.interactive = true;

      this.positiveDotsContainer.hitArea = new PIXI.Rectangle(
        0,
        0,
        BOX_INFO.BOX_WIDTH,
        BOX_INFO.BOX_HEIGHT
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
        this.positiveDotsContainer.on('pointerup', this.createDot.bind(this));
      }
    }
    this.x += BOX_INFO.LEFT_GUTTER;
  }

  createDot(e) {
        // console.log('createDot', this.zonePosition);
    const hitArea = e.target.hitArea;
    const clickPos = e.data.getLocalPosition(e.target);
    const clickModifiedPos = [];
    if (clickPos.x < POSITION_INFO.DOT_RAYON) {
      clickModifiedPos.push(POSITION_INFO.DOT_RAYON);
    } else if (clickPos.x > hitArea.width - POSITION_INFO.DOT_RAYON) {
      clickModifiedPos.push(hitArea.width - POSITION_INFO.DOT_RAYON);
    } else {
      clickModifiedPos.push(clickPos.x);
    }

    if (clickPos.y < POSITION_INFO.DOT_RAYON) {
      clickModifiedPos.push(POSITION_INFO.DOT_RAYON);
    } else if (clickPos.y > hitArea.height - POSITION_INFO.DOT_RAYON) {
      clickModifiedPos.push(hitArea.height - POSITION_INFO.DOT_RAYON);
    } else {
      clickModifiedPos.push(clickPos.y);
    }
    this.eventEmitter.emit(PowerZone.CREATE_DOT, e.target, clickModifiedPos, SPRITE_COLOR.RED);
  }

  checkTextAndAlpha(doCheck) {
    if (doCheck) {
      let positiveZoneIsEmpty = this.getZoneTextAndAlphaStatus(
        this.positiveDots,
        this.dotsCounterContainer,
        false,
        true);
      // console.log('checkTextAndAlpha', this.zonePosition, positiveZoneIsEmpty);
      let negativeZoneIsEmpty = true;
      if (this.negativePresent) {
        negativeZoneIsEmpty = this.getZoneTextAndAlphaStatus(
          this.negativeDots,
          this.negativeDotsCounterContainer,
          !positiveZoneIsEmpty,
          false);
      }
      if (negativeZoneIsEmpty === false && positiveZoneIsEmpty) {
        positiveZoneIsEmpty = this.getZoneTextAndAlphaStatus(
          this.positiveDots,
          this.dotsCounterContainer,
          true,
          true);
      }
      if (positiveZoneIsEmpty === true &&
        (this.negativePresent === false || negativeZoneIsEmpty === true)) {
        this.filters = [this.greyFilter];
        this.isActive = false;
      } else {
        this.filters = null;
        this.isActive = true;
      }
      return positiveZoneIsEmpty && negativeZoneIsEmpty;
    }
            // console.log('checkTextAndAlpha no check');
    this.filters = null;
    this.isActive = true;
    this.getZoneTextAndAlphaStatus(
      this.positiveDots,
      this.dotsCounterContainer,
      true,
      true);
    if (this.negativePresent) {
      this.getZoneTextAndAlphaStatus(
        this.negativeDots,
        this.negativeDotsCounterContainer,
        true,
        false);
    }
    return false;
  }

  getZoneTextAndAlphaStatus(dots, counter, populate, isPositive) {
    // eslint-disable-next-line max-len
    // console.log('getZoneTextAndAlphaStatus', this.zonePosition, counter === this.dotsCounterContainer, populate, isPositive);
    let zoneAreEmpty = false;
    if (Object.keys(dots).length !== 0) {
      if (this.base[1] !== 12) {
        counter.setText(Object.keys(dots).length, isPositive);
      } else {
        counter.setText(convertBase(Object.keys(dots).length.toString(), 10, 12), isPositive);
      }
    } else if (populate || this.zonePosition === 0) {
      counter.setText('0', true);
    } else {
      zoneAreEmpty = true;
      counter.setText('', true);
    }
    return zoneAreEmpty;
  }

    // to show or hide divider text based on other divider
  checkDivideResultText(doCheck) {
        // console.log('checkDivideResultText', doCheck, this.zonePosition);
    if (this.positiveDividerText != null && this.negativeDividerText != null) {
      if (doCheck) {
        // check before populate
        let dividerIsEmpty = this.getDividerTextStatus(this.positiveDividerText, false);
        const negativeDividerIsEmpty = this.getDividerTextStatus(
          this.negativeDividerText,
          !dividerIsEmpty
        );
        if (negativeDividerIsEmpty === false && dividerIsEmpty) {
          dividerIsEmpty = this.getDividerTextStatus(
            this.positiveDividerText,
            true
          );
        }
        if (dividerIsEmpty && negativeDividerIsEmpty) {
          this.positiveDividerText.visible = false;
          this.negativeDividerText.visible = false;
        } else {
          this.positiveDividerText.visible = true;
          this.negativeDividerText.visible = true;
        }
        return dividerIsEmpty && negativeDividerIsEmpty;
      }
      // force show
      this.positiveDividerText.visible = true;
      this.negativeDividerText.visible = true;
      return false;
    }
    return false;
  }

  getDividerTextStatus(dividerText, populate) {
        // console.log('getDividerTextStatus', dividerText.text, populate);
    let zoneAreEmpty = false;
    if (dividerText.text === '0' || dividerText.text === '-0') {
      if (populate === false && this.zonePosition !== 0) {
        zoneAreEmpty = true;
      }
    }
    return zoneAreEmpty;
  }

  addDot(dot) {
    // console.log('addDot', this.zonePosition);
    let dotSprite;
    if (dot.isPositive) {
      dotSprite = this.doAddDot(dot, this.positiveDotsContainer, this.positiveDotNotDisplayed);
      if (dotSprite) {
        dot.sprite = dotSprite; // eslint-disable-line no-param-reassign
        dotSprite.dot = dot;
      }
    } else {
      dotSprite = this.doAddDot(dot, this.negativeDotsContainer, this.negativeDotNotDisplayed);
      if (dotSprite) {
        dot.sprite = dotSprite; // eslint-disable-line no-param-reassign
        dotSprite.dot = dot;
      }
    }
    this.addDotToArray(dot);
    return dotSprite;
  }

  doAddDot(dot, container, notDisplayed) {
    let dotSprite;
    if (container.children.length < this.maxDotsByZone) {
      dotSprite = this.spritePool.getOne(dot.color, dot.isPositive);
      container.addChild(dotSprite);
    } else {
      notDisplayed[dot.id] = dot;// eslint-disable-line no-param-reassign
    }
    return dotSprite;
  }

  removeFromProximityManager(sprite) {
        // console.log('removeFromProximityManager', this.zonePosition);
    if (sprite.dot.isPositive) {
      this.positiveProximityManager.removeItem(sprite);
    } else {
      this.negativeProximityManager.removeItem(sprite);
    }
  }

  removeNotDisplayedDots(amount, isPositive) {
    let localAmount = amount;
    let key;
    const removed = [];
    if (localAmount > 0) {
      if (isPositive) {
        // eslint-disable-next-line guard-for-in, no-restricted-syntax
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
        // eslint-disable-next-line guard-for-in, no-restricted-syntax
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

  removeDotFromArray(dot) {
    if (dot.isPositive) {
      delete this.positiveDots[dot.id];
    } else {
      delete this.negativeDots[dot.id];
    }
    this.removeDotFromNotDisplayedArray(dot);
  }

  removeDotFromNotDisplayedArray(dot) {
    if (dot.isPositive) {
      if (this.positiveDotNotDisplayed[dot.id] !== undefined) {
        delete this.positiveDotNotDisplayed[dot.id];
      }
    } else if (this.negativeDotNotDisplayed[dot.id] !== undefined) {
      delete this.negativeDotNotDisplayed[dot.id];
    }
  }

  addDotToArray(dot) {
    if (dot.isPositive) {
      this.positiveDots[dot.id] = dot;
    } else {
      this.negativeDots[dot.id] = dot;
    }
        // console.log('addDotToArray', this.zonePosition, this.positiveDots, this.negativeDots);
  }

    // remove dots from store change
  removeDotsIfNeeded(storeHash, isPositive) {
    let removedDots = [];
    if (isPositive) {
      if (Object.keys(this.positiveDots).length +
        Object.keys(this.positiveDotNotDisplayed).length >
        Object.keys(storeHash).length) {
        removedDots = removedDots.concat(
          this.removeDotsFromArrayStoreChange(
            this.positiveDots,
            storeHash
          )
        );
      }
    } else if (Object.keys(this.negativeDots).length +
      Object.keys(this.negativeDotNotDisplayed).length >
      Object.keys(storeHash).length) {
      removedDots = removedDots.concat(
        this.removeDotsFromArrayStoreChange(
          this.negativeDots,
          storeHash
        )
      );
    }
    return removedDots;
  }

  removeDotsFromArrayStoreChange(localHash, storeHash) {
        // console.log('removeDotsFromArrayStoreChange', storeHash);
    const removedDots = [];
    Object.keys(localHash).forEach((key) => {
      if (Object.prototype.hasOwnProperty.call(storeHash, key) === false) {
        const dot = localHash[key];
        this.removeDotFromArray(dot);
        if (dot.sprite) {
          const dotSprite = dot.sprite;
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

  checkIfNotDisplayedSpriteCanBe() {
    let addedDots = [];
    addedDots = addedDots.concat(
      this.displayHiddenDots(
        this.positiveDotNotDisplayed,
        this.positiveDotsContainer
      )
    );
    addedDots = addedDots.concat(
      this.displayHiddenDots(
        this.negativeDotNotDisplayed,
        this.negativeDotsContainer
      )
    );
    // console.log('checkIfNotDisplayedSpriteCanBe', this.zonePosition, addedDots);
    return addedDots;
  }

  displayHiddenDots(notShowedArray, container) {
    const addedDots = [];
    const notShownedCount = Object.keys(notShowedArray).length;
    if (notShownedCount > 0) {
      let toShowCount = this.maxDotsByZone - container.children.length;
      if (notShownedCount < toShowCount) {
        toShowCount = notShownedCount;
      }
      if (toShowCount > 0) {
        // eslint-disable-next-line guard-for-in, no-restricted-syntax
        for (const key in notShowedArray) {
          addedDots.push(notShowedArray[key]);
          toShowCount -= 1;
          if (toShowCount === 0) {
            break;
          }
        }
      }
    }
    addedDots.forEach((dot) => {
      this.removeDotFromNotDisplayedArray(dot);
      let dotSprite;
      if (dot.color !== SPRITE_COLOR.BLUE) {
        dotSprite = this.spritePool.getOne(SPRITE_COLOR.RED, true);
      } else {
        dotSprite = this.spritePool.getOne(SPRITE_COLOR.BLUE, true);
      }
      dot.sprite = dotSprite;// eslint-disable-line no-param-reassign
      dotSprite.dot = dot;
      addedDots.push(dot);
      container.addChild(dotSprite);
    });
    return addedDots;
  }

  addDotsFromStateChange(storePositiveDotsHash, storeNegativeDotsHash) {
    let addedDots = [];
    addedDots = addedDots.concat(
      this.doAddDotsFromStateChange(
        storePositiveDotsHash,
        this.positiveDots
      )
    );
    addedDots = addedDots.concat(
      this.doAddDotsFromStateChange(
        storeNegativeDotsHash,
        this.negativeDots
      )
    );
    return addedDots;
  }

  doAddDotsFromStateChange(storeHash, localHash) {
    const addedDots = [];
    Object.keys(storeHash).forEach((key) => {
      if (Object.prototype.hasOwnProperty.call(localHash, key) === false) {
        addedDots.push(storeHash[key]);
        this.addDot(storeHash[key]);
      }
    });
    return addedDots;
  }

  getOvercrowding(amount) {
    // console.log('getOvercrowding', amount);
    let dotsRemoved = [];
    if (Object.keys(this.positiveDots).length > amount - 1) {
      dotsRemoved = PowerZone.getDotsFromHash(this.positiveDots, amount);
    } else if (Object.keys(this.negativeDots).length > amount - 1) {
      dotsRemoved = PowerZone.getDotsFromHash(this.negativeDots, amount);
    }
    return dotsRemoved;
  }

  getPositiveNegativeOverdot(amount, isPositive) {
    let key;
    const removed = [];
    let myAmount = amount;
    if (myAmount > 0) {
      if (isPositive) {
        // eslint-disable-next-line guard-for-in, no-restricted-syntax
        for (key in this.positiveDots) {
          removed.push(this.positiveDots[key]);
          myAmount -= 1;
          if (myAmount === 0) {
            break;
          }
        }
      } else {
        // eslint-disable-next-line guard-for-in, no-restricted-syntax
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

  checkOvercrowding() {
    let dotOverload = false;
    if (Object.keys(this.positiveDots).length > this.base[1] - 1) {
      this.dotsCounterContainer.setStyle(0xff0000);
      const frameTotal = this.positiveDotsContainer.children[0].totalFrames;
      this.positiveDotsContainer.children.forEach((sprite) => {
        sprite.animationSpeed = 0.2;// eslint-disable-line no-param-reassign
        sprite.gotoAndPlay(randomFromTo(frameTotal - 15, frameTotal - 1));
      });
      dotOverload = true;
    } else {
      this.positiveDotsContainer.children.forEach((sprite) => {
        sprite.gotoAndStop(0);
      });
      this.dotsCounterContainer.setStyle(0x444444);
    }

    if (this.negativePresent) {
      if (Object.keys(this.negativeDots).length > this.base[1] - 1) {
        this.negativeDotsCounterContainer.setStyle(0xff0000);
        const frameTotal = this.negativeDotsContainer.children[0].totalFrames;
        this.negativeDotsContainer.children.forEach((sprite) => {
          sprite.animationSpeed = 0.2;// eslint-disable-line no-param-reassign
          sprite.gotoAndPlay(randomFromTo(frameTotal - 15, frameTotal - 1));
        });
        dotOverload = true;
      } else {
        this.negativeDotsContainer.children.forEach((sprite) => {
          sprite.gotoAndStop(0);
        });
        this.negativeDotsCounterContainer.setStyle(0xDDDDDD);
      }
    }
    return dotOverload;
  }

  checkPositiveNegativePresence(isOverload) {
    if (this.negativePresent && this.base[1] !== BASE.BASE_X) {
      if (isOverload === false &&
        Object.keys(this.positiveDots).length > 0 &&
        Object.keys(this.negativeDots).length > 0) {
        const tween = TweenMax.fromTo(
                    this.positiveDotsContainer,
                    0.3,
                    { y: this.positiveDotsContainer.y - 1 },
          { y: '+=1',
            ease: RoughEase.ease.config(
              {
                strength: 8,
                points: 20,
                template: Linear.easeNone,
                randomize: false,
              }
            ),
            clearProps: 'x',
          }
                );
        tween.repeat(-1).repeatDelay(2).yoyo(true).play();
        const tween2 = TweenMax.fromTo(
                    this.negativeDotsContainer,
                    0.3,
                    { y: this.negativeDotsContainer.y - 1 },
          { y: '+=1',
            ease: RoughEase.ease.config(
              {
                strength: 8,
                points: 20,
                template: Linear.easeNone,
                randomize: false,
              }
            ),
            clearProps: 'x',
          }
                );
        tween2.repeat(-1).repeatDelay(2).yoyo(true).play();
        return true;
      }
      TweenMax.killTweensOf(this.positiveDotsContainer);
      TweenMax.killTweensOf(this.negativeDotsContainer);
      this.positiveDotsContainer.position.copy(this.originalPositiveBoxPosition);
      this.negativeDotsContainer.position.copy(this.originalNegativeBoxPosition);
    }
    return false;
  }

  baseChange(base) {
        // console.log(base);
    this.base = base;
    if (this.base[1] === BASE.BASE_X) {
      this.setValueText('X');
      if (this.placeValueExponent !== null) {
        this.placeValueExponent.text = '2';
      }
    } else if (base[0] === 1 || this.zonePosition === 0) {
      this.setValueText(String(Math.pow(base[1], this.zonePosition)));
    } else {
      this.setValueText(String(`${Math.pow(base[1], this.zonePosition)}/${Math.pow(base[0], this.zonePosition)}`));
    }
  }

  setValueText(text) {
    this.placeValueText.text = text;
  }

  setValueTextAlpha(alpha) {
    this.placeValueText.alpha = alpha;
    if (this.placeValueExponent !== null) {
      this.placeValueExponent.alpha = alpha;
    }
  }

  precalculateDotsForDivision() {
    this.positiveDotCount = Object.keys(this.positiveDots).length;
    this.negativeDotCount = Object.keys(this.negativeDots).length;
  }

  setBackgroundColor(status) {
        // console.log(this.zonePosition, this.isActive, status);
    if (this.isActive === true) {
      switch (status) {
        case PowerZone.BG_NEUTRAL:
          this.bgBox.texture = this.bgBoxTextures[0];
          break;
        case PowerZone.BG_GREEN:
          this.bgBox.texture = this.bgBoxTextures[1];
          break;
        case PowerZone.BG_RED:
          this.bgBox.texture = this.bgBoxTextures[2];
          break;
        default:
          this.bgBox.texture = this.bgBoxTextures[0];
      }
    }
  }

  getDotsForDivision(amount, isPositive) {
    let dotsRemoved;
    if (isPositive) {
      if (Object.keys(this.positiveDots).length > amount - 1) {
        dotsRemoved = PowerZone.getDotsFromHash(this.positiveDots, amount);
      }
    } else if (Object.keys(this.negativeDots).length > amount - 1) {
      dotsRemoved = PowerZone.getDotsFromHash(this.negativeDots, amount);
    }
    return dotsRemoved;
  }

  setDivisionValue(positive, negative) {
        // console.log('setDivisionValue', this.zonePosition, positive);
    this.positiveDivisionValue = positive;
    this.negativeDivisionValue = negative;
    if (this.positiveDividerText !== null && this.negativeDividerText !== null) {
      this.positiveDividerText.text = this.positiveDivisionValue;
            // check if division value exceed base
      if (this.base[1] !== BASE.BASE_X && this.positiveDivisionValue >= this.base[1]) {
        if (this.zonePosition !== this.totalZoneCount - 1) {
                    // do animate if not the leftmost box
          this.positiveDivideCounter.texture = this.textures['dot_div_value_r.png'];
          this.eventEmitter.emit(
            PowerZone.DIVIDER_OVERLOAD,
            this.zonePosition,
            this.positiveDivisionValue
          );
        } else {
          this.positiveDividerText.style.fill = 0xff0000;
        }
      }
      if (this.negativeDivisionValue !== 0) {
        this.negativeDividerText.text = `-${this.negativeDivisionValue}`;
      } else {
        this.negativeDividerText.text = this.negativeDivisionValue;
      }
      // check if division value exceed base
      if (this.base[1] !== BASE.BASE_X && this.negativeDivisionValue >= this.base[1]) {
        if (this.zonePosition !== this.totalZoneCount - 1) {
          // do animate if not the leftmost box
          this.negativeDivideCounter.texture = this.textures['antidot_div_value_r.png'];
          this.eventEmitter.emit(
            PowerZone.DIVIDER_OVERLOAD,
            this.zonePosition,
            this.negativeDivisionValue
          );
        } else {
          this.negativeDividerText.style.fill = 0xff0000;
        }
      }
    }
  }

  onDividerOverloadSolved(isPositive) {
    if (isPositive) {
      this.positiveDivideCounter.texture = this.textures['dot_div_value.png'];
    } else {
      this.negativeDivideCounter.texture = this.textures['antidot_div_value.png'];
    }
  }

  onDividerAutoPopulated(isPositive) {
    if (isPositive) {
      this.positiveDividerText.style.fill = 0x565656;
    } else {
      this.negativeDividerText.style.fill = 0x565656;
    }
  }

  update() {
        // console.log('update');
    if (this.negativePresent) {
      this.negativeProximityManager.draw();
      this.positiveProximityManager.draw();
    } else {
      this.positiveProximityManager.draw();
    }
  }

  reset() {
    if (this.positiveDividerText !== null && this.negativeDividerText !== null) {
      this.positiveDividerText.text = '0';
      this.negativeDividerText.text = '0';
      this.positiveDividerText.style.fill = 0x565656;
      this.negativeDividerText.style.fill = 0x565656;
    }
  }

  destroy() {
    let sprite;
    if (this.positiveDotsContainer) {
      while (this.positiveDotsContainer.children.length > 0) {
        sprite = this.positiveDotsContainer.removeChildAt(0);
        sprite.stop();
      }
      this.positiveDotsContainer.off('pointerup', this.createDot.bind(this));
      this.positiveDotsContainer.destroy();
    }
    if (this.positiveProximityManager) {
      this.positiveProximityManager.destroy();
    }
    if (this.negativePresent) {
      if (this.negativeDotsContainer) {
        while (this.negativeDotsContainer.children.length > 0) {
          sprite = this.negativeDotsContainer.removeChildAt(0);
          sprite.stop();
        }
        this.negativeDotsContainer.off('pointerup', this.createDot.bind(this));
        this.negativeDotsContainer.destroy();
      }
      if (this.negativeProximityManager) {
        this.negativeProximityManager.destroy();
      }
    }
  }
}
