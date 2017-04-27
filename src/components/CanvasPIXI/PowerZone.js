import {BASE, OPERATOR_MODE, USAGE_MODE, BOX_INFO, POSITION_INFO, MAX_DOT, SPRITE_COLOR} from '../../Constants'
import {ProximityManager} from '../../utils/ProximityManager';
import {EventEmitter} from 'eventemitter3';
import {convertBase, randomFromTo} from '../../utils/MathUtils'
import { TweenMax, RoughEase, Linear} from "gsap";
import {DotCounter} from './DotCounter';

export class PowerZone extends PIXI.Container{

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
    positiveDotsContainer = null;
    negativeDotsContainer = null;
    positiveDividerText = null;
    negativeDividerText = null;
    positiveProximityManager = null;
    negativeProximityManager = null;
    originalPositiveBoxPosition =  null;// Point
    originalNegativeBoxPosition =  null;// Point
    zonePosition = 0;
    negativePresent = false;
    isActive = true;
    base = [];
    totalZoneCount = 0;
    greyFilter = new PIXI.filters.ColorMatrixFilter();
    redFilter = new PIXI.filters.ColorMatrixFilter();
    greenFilter = new PIXI.filters.ColorMatrixFilter();
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

    constructor(position, textures, base, negativePresent, usage_mode, operator_mode, totalZoneCount, spritePool) {
        super();
        this.textures = textures;
        this.zonePosition = totalZoneCount - position - 1;
        this.negativePresent = negativePresent;
        this.base = base;
        this.totalZoneCount = totalZoneCount;
        this.spritePool = spritePool;
        this.greyFilter.greyscale(0.3, true);
        this.redFilter.night(2);
        this.greenFilter.kodachrome(1);
        this.maxDotsByZone = negativePresent ? MAX_DOT.MIX : MAX_DOT.ONLY_POSITIVE;
        this.eventEmitter = new EventEmitter();
        this.dotsCounterContainer = new DotCounter(position, textures["dot_value_left.png"], textures["dot_value_center.png"], textures["dot_value_right.png"]);
        this.dotsCounterContainer.y = 40;
        this.dotsCounterContainer.x = (position * (BOX_INFO.BOX_WIDTH + BOX_INFO.GUTTER_WIDTH)) + (BOX_INFO.BOX_WIDTH / 2) - (this.dotsCounterContainer.getWidth() / 2);
        this.addChild(this.dotsCounterContainer);

        if (negativePresent) {
            this.negativeDotsCounterContainer = new DotCounter(position, textures["antidot_value_left.png"], textures["antidot_value_center.png"], textures["antidot_value_right.png"]);
            this.negativeDotsCounterContainer.x = (position * (BOX_INFO.BOX_WIDTH + BOX_INFO.GUTTER_WIDTH)) + (BOX_INFO.BOX_WIDTH / 2) - (this.negativeDotsCounterContainer.getWidth() / 2);
            this.negativeDotsCounterContainer.y = BOX_INFO.BOX_HEIGHT + 80;
            this.addChild(this.negativeDotsCounterContainer);
            this.negativeDotsCounterContainer.setStyle(0xFFFFFF);
        }

        this.bgBoxTextures.push(textures["box.png"]);
        this.bgBoxTextures.push(textures["box_yes.png"]);
        this.bgBoxTextures.push(textures["box_no.png"]);
        this.bgBox = new PIXI.Sprite(this.bgBoxTextures[0]);
        this.bgBox.x = position * (BOX_INFO.BOX_WIDTH + BOX_INFO.GUTTER_WIDTH);
        this.bgBox.y = BOX_INFO.BOX_Y;
        this.addChild(this.bgBox);

        if (base[1] === BASE.BASE_X) {
            this.placeValueText = new PIXI.Text('X', {
                fontFamily: 'Noto Sans',
                fontWeight:'bold',
                fontSize: 40,
                fill: 0xBCBCBC,
                align: 'center'
            });
            if(this.zonePosition === 0){
                this.placeValueText.text = '1';
            }else{
                if(this.zonePosition !== 1) {
                    this.placeValueExponent = new PIXI.Text(this.zonePosition.toString(), {
                        fontFamily: 'Noto Sans',
                        fontWeight:'bold',
                        fontSize: 25,
                        fill: 0xBCBCBC,
                        align: 'center'
                    });
                }
            }
        } else {
            let text;
            if (base[0] === 1 || this.zonePosition === 0) {
                text = String(Math.pow(base[1], this.zonePosition));
            } else {
                text = '(' + String(Math.pow(base[1], this.zonePosition) + '/' + Math.pow(base[0], this.zonePosition)) + ')';
            }
            this.placeValueText = new PIXI.Text(text, {
                fontFamily: 'Noto Sans',
                fontWeight:'bold',
                fontSize: 40,
                fill: 0xBCBCBC,
                align: 'center'
            });
        }
        this.placeValueText.anchor.x = 0.5;
        this.placeValueText.x = (position * (BOX_INFO.BOX_WIDTH + BOX_INFO.GUTTER_WIDTH)) + (BOX_INFO.BOX_WIDTH / 2);
        this.placeValueText.y = BOX_INFO.BOX_Y + BOX_INFO.HALF_BOX_HEIGHT - 22;
        this.addChild(this.placeValueText);
        if(this.placeValueExponent !== null) {
            this.placeValueExponent.anchor.x = 0.5;
            this.placeValueExponent.x = this.placeValueText.x + 25;
            this.placeValueExponent.y = this.placeValueText.y - 5;
            this.addChild(this.placeValueExponent);
        }


        if (operator_mode === OPERATOR_MODE.DIVIDE) {
            this.positiveDivideCounter = new PIXI.Sprite(textures["dot_div_value.png"]);
            this.positiveDivideCounter.x = (position * (BOX_INFO.BOX_WIDTH + BOX_INFO.GUTTER_WIDTH)) + BOX_INFO.BOX_WIDTH - this.positiveDivideCounter.width;
            this.positiveDivideCounter.y = BOX_INFO.BOX_Y;
            this.addChild(this.positiveDivideCounter);

            this.positiveDividerText = new PIXI.Text('', {
                fontFamily: 'Noto Sans',
                fontWeight:'bold',
                fontSize: 16,
                fill: 0x565656,
                align: 'center'
            });
            this.positiveDividerText.anchor.x = 0.5;
            this.positiveDividerText.x = (position * (BOX_INFO.BOX_WIDTH + BOX_INFO.GUTTER_WIDTH)) + BOX_INFO.BOX_WIDTH - (this.positiveDivideCounter.width / 2);
            this.positiveDividerText.y = BOX_INFO.BOX_Y + 3;
            this.addChild(this.positiveDividerText);

            this.negativeDivideCounter = new PIXI.Sprite(textures["antidot_div_value.png"]);
            this.negativeDivideCounter.x = (position * (BOX_INFO.BOX_WIDTH + BOX_INFO.GUTTER_WIDTH));
            this.negativeDivideCounter.y = BOX_INFO.BOX_HEIGHT + BOX_INFO.BOX_Y - this.negativeDivideCounter.height + 1;
            this.addChild(this.negativeDivideCounter);

            this.negativeDividerText = new PIXI.Text('', {
                fontFamily: 'Noto Sans',
                fontWeight:'bold',
                fontSize: 16,
                fill: 0x565656,
                align: 'center'
            });
            this.negativeDividerText.anchor.x = 0.5;
            this.negativeDividerText.x = (position * (BOX_INFO.BOX_WIDTH + BOX_INFO.GUTTER_WIDTH)) + 15;
            this.negativeDividerText.y = this.negativeDivideCounter.y + 15;
            this.addChild(this.negativeDividerText);
        }

        if (negativePresent) {
            let separator = new PIXI.Sprite(textures['separator.png']);
            separator.x = (position * (BOX_INFO.BOX_WIDTH + BOX_INFO.GUTTER_WIDTH)) + 5;
            separator.y = BOX_INFO.BOX_Y + BOX_INFO.HALF_BOX_HEIGHT;
            this.addChild(separator);

            this.positiveDotsContainer = new PIXI.Container();
            this.positiveDotsContainer.x = position * (BOX_INFO.BOX_WIDTH + BOX_INFO.GUTTER_WIDTH);
            this.positiveDotsContainer.y = BOX_INFO.BOX_Y;
            this.addChild(this.positiveDotsContainer);
            this.positiveDotsContainer.interactive = true;
            this.originalPositiveBoxPosition = new PIXI.Point(this.positiveDotsContainer.position.x, this.positiveDotsContainer.position.y);

            this.positiveDotsContainer.hitArea = new PIXI.Rectangle(0, 0, BOX_INFO.BOX_WIDTH, BOX_INFO.HALF_BOX_HEIGHT);
            this.positiveProximityManager = new ProximityManager(this.positiveDotsContainer.hitArea);
            this.positiveDotsContainer.powerZone = totalZoneCount - position - 1;
            this.positiveDotsContainer.isPositive = true;

            if (usage_mode === USAGE_MODE.FREEPLAY || operator_mode === OPERATOR_MODE.DIVIDE && base[1] === BASE.BASE_X) {
                // Dot can ba added in division in base X
                this.positiveDotsContainer.buttonMode = true;
                this.positiveDotsContainer.on('pointerup', this.createDot.bind(this));
            }

            this.negativeDotsContainer = new PIXI.Container();
            this.negativeDotsContainer.x = position * (BOX_INFO.BOX_WIDTH + BOX_INFO.GUTTER_WIDTH);
            this.negativeDotsContainer.y = BOX_INFO.BOX_Y + BOX_INFO.HALF_BOX_HEIGHT;
            this.addChild(this.negativeDotsContainer);
            this.negativeDotsContainer.interactive = true;
            this.originalNegativeBoxPosition = new PIXI.Point(this.negativeDotsContainer.position.x, this.negativeDotsContainer.position.y);

            this.negativeDotsContainer.hitArea = new PIXI.Rectangle(0, 0, BOX_INFO.BOX_WIDTH, BOX_INFO.HALF_BOX_HEIGHT);
            this.negativeProximityManager = new ProximityManager(this.negativeDotsContainer.hitArea);
            this.negativeDotsContainer.powerZone = totalZoneCount - position - 1;
            this.negativeDotsContainer.isPositive = false;
            if (usage_mode === USAGE_MODE.FREEPLAY || operator_mode === OPERATOR_MODE.DIVIDE && base[1] === BASE.BASE_X) {
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

            this.positiveDotsContainer.hitArea = new PIXI.Rectangle(0, 0, BOX_INFO.BOX_WIDTH, BOX_INFO.BOX_HEIGHT);
            this.positiveProximityManager = new ProximityManager(this.positiveDotsContainer.hitArea);
            this.positiveDotsContainer.powerZone = totalZoneCount - position - 1;
            this.positiveDotsContainer.isPositive = true;
            if (usage_mode === USAGE_MODE.FREEPLAY || usage_mode === USAGE_MODE.OPERATION && operator_mode === OPERATOR_MODE.DIVIDE && base[1] === BASE.BASE_X) {
                // Dot can ba added in freeplay or in division in base X
                this.positiveDotsContainer.buttonMode = true;
                this.positiveDotsContainer.on('pointerup', this.createDot.bind(this));
            }
        }
        this.x += BOX_INFO.LEFT_GUTTER;
    }

    createDot(e){
        //console.log('createDot', this.zonePosition);
        let hitArea = e.target.hitArea;
        let clickPos = e.data.getLocalPosition(e.target);
        let clickModifiedPos = [];
        if(clickPos.x < POSITION_INFO.DOT_RAYON){
            clickModifiedPos.push(POSITION_INFO.DOT_RAYON);
        }else if(clickPos.x > hitArea.width - POSITION_INFO.DOT_RAYON){
            clickModifiedPos.push(hitArea.width - POSITION_INFO.DOT_RAYON);
        }else{
            clickModifiedPos.push(clickPos.x);
        }

        if(clickPos.y < POSITION_INFO.DOT_RAYON){
            clickModifiedPos.push(POSITION_INFO.DOT_RAYON);
        }else if(clickPos.y > hitArea.height - POSITION_INFO.DOT_RAYON){
            clickModifiedPos.push(hitArea.height - POSITION_INFO.DOT_RAYON);
        }else{
            clickModifiedPos.push(clickPos.y);
        }
        this.eventEmitter.emit(PowerZone.CREATE_DOT, e.target, clickModifiedPos, SPRITE_COLOR.RED);
    }

    checkTextAndAlpha(doCheck){
        if(doCheck) {
            let positiveZoneIsEmpty = this.getZoneTextAndAlphaStatus(this.positiveDots, this.dotsCounterContainer, false, true);
            //console.log('checkTextAndAlpha', this.zonePosition, positiveZoneIsEmpty);
            let negativeZoneIsEmpty = true;
            if(this.negativePresent) {
                negativeZoneIsEmpty = this.getZoneTextAndAlphaStatus(this.negativeDots, this.negativeDotsCounterContainer, !positiveZoneIsEmpty, false);
            }
            if(negativeZoneIsEmpty == false && positiveZoneIsEmpty){
                positiveZoneIsEmpty = this.getZoneTextAndAlphaStatus(this.positiveDots, this.dotsCounterContainer, true, true);
            }
            if (positiveZoneIsEmpty === true && (this.negativePresent === false || negativeZoneIsEmpty === true)) {
                this.filters = [this.greyFilter];
                this.isActive = false;
            } else {
                this.filters = null;
                this.isActive = true;
            }
            return positiveZoneIsEmpty && negativeZoneIsEmpty;
        }else{
            //console.log('checkTextAndAlpha no check');
            this.filters = null;
            this.isActive = true;
            this.getZoneTextAndAlphaStatus(this.positiveDots, this.dotsCounterContainer, true, true);
            if(this.negativePresent) {
                this.getZoneTextAndAlphaStatus(this.negativeDots, this.negativeDotsCounterContainer, true, false);
            }
            return false;
        }
    }

    getZoneTextAndAlphaStatus(dots, counter, populate, isPositive) {
        //console.log('getZoneTextAndAlphaStatus', this.zonePosition, counter === this.dotsCounterContainer, populate, isPositive);
        var zoneAreEmpty = false;
        if (Object.keys(dots).length !== 0) {
            if (this.base[1] !== 12) {
                counter.setText(Object.keys(dots).length, isPositive);
            } else {
                counter.setText(convertBase(Object.keys(dots).length.toString(), 10, 12), isPositive);
            }
        } else {
            if (populate || this.zonePosition === 0) {
                counter.setText('0', true);
            } else {
                zoneAreEmpty = true;
                counter.setText('', true);
            }
        }
        return zoneAreEmpty;
    }

    // to show or hide divider text based on other divider
    checkDivideResultText(doCheck){
        //console.log('checkDivideResultText', doCheck, this.zonePosition);
        if (this.positiveDividerText != null && this.negativeDividerText != null) {
            if (doCheck) {
                // check before populate
                let dividerIsEmpty = this.getDividerTextStatus(this.positiveDividerText, false);
                let negativeDividerIsEmpty = this.getDividerTextStatus(this.negativeDividerText, !dividerIsEmpty);
                if (negativeDividerIsEmpty == false && dividerIsEmpty) {
                    dividerIsEmpty = this.getDividerTextStatus(this.positiveDividerText, true);
                }
                return dividerIsEmpty && negativeDividerIsEmpty;
            } else {
                // force populate
                this.getDividerTextStatus(this.positiveDividerText, true);
                this.getDividerTextStatus(this.negativeDividerText, true);
                return false;
            }
        }
        return false;
    }

    getDividerTextStatus(dividerText, populate) {
        //console.log('getDividerTextStatus', dividerText.text === ' ', populate);
        var zoneAreEmpty = false;
        if (dividerText.text === ' ') {
            if (populate || this.zonePosition === 0) {
                dividerText.text = '0';
            } else {
                zoneAreEmpty = true;
                dividerText.text = ' ';
            }
        }
        return zoneAreEmpty;
    }

    addDot(dot){
        //console.log('addDot', this.zonePosition);
        let dotSprite;
        if(dot.isPositive) {
            dotSprite = this.doAddDot(dot, this.positiveDotsContainer, this.positiveDotNotDisplayed);
            if(dotSprite) {
                dot.sprite = dotSprite;
                dotSprite.dot = dot;
            }
        }else{
            dotSprite = this.doAddDot(dot, this.negativeDotsContainer, this.negativeDotNotDisplayed);
            if(dotSprite) {
                dot.sprite = dotSprite;
                dotSprite.dot = dot;
            }
        }
        this.addDotToArray(dot);
        return dotSprite;
    }

    doAddDot(dot, container, notDisplayed){
        let dotSprite;
        if(container.children.length < this.maxDotsByZone) {
            dotSprite = this.spritePool.getOne(dot.color, dot.isPositive);
            container.addChild(dotSprite);
        }else{
            notDisplayed[dot.id] = dot;
        }
        return dotSprite;
    }

    removeFromProximityManager(sprite){
        //console.log('removeFromProximityManager', this.zonePosition);
        if(sprite.dot.isPositive) {
            this.positiveProximityManager.removeItem(sprite);
        }else{
            this.negativeProximityManager.removeItem(sprite);
        }
    }

    removeNotDisplayedDots(amount, isPositive){
        let key;
        let removed = [];
        if(amount > 0) {
            if (isPositive) {
                for (key in this.positiveDotNotDisplayed) {
                    removed.push(this.positiveDotNotDisplayed[key]);
                    amount--;
                    if (amount === 0) {
                        break;
                    }
                }
                removed.forEach(dot => {
                    this.removeDotFromArray(dot);
                });
            } else {
                for (key in this.negativeDotNotDisplayed) {
                    removed.push(this.negativeDotNotDisplayed[key]);
                    amount--;
                    if (amount === 0) {
                        break;
                    }
                }
                removed.forEach(dot => {
                    this.removeDotFromArray(dot);
                });
            }
        }
        return removed;
    }

    removeDotFromArray(dot){
        if(dot.isPositive){
            delete this.positiveDots[dot.id];
        }else{
            delete this.negativeDots[dot.id];
        }
        this.removeDotFromNotDisplayedArray(dot);
    }

    removeDotFromNotDisplayedArray(dot){
        if(dot.isPositive){
            if(this.positiveDotNotDisplayed[dot.id] != undefined) {
                delete this.positiveDotNotDisplayed[dot.id];
            }
        }else{
            if(this.negativeDotNotDisplayed[dot.id] != undefined) {
                delete this.negativeDotNotDisplayed[dot.id];
            }
        }
    }

    addDotToArray(dot){
        if(dot.isPositive){
            this.positiveDots[dot.id] = dot;
        }else{
            this.negativeDots[dot.id] = dot;
        }
        //console.log('addDotToArray', this.zonePosition, this.positiveDots, this.negativeDots);
    }

    // remove dots from store change
    removeDotsIfNeeded(storeHash, isPositive){
        let removedDots = [];
        if(isPositive) {
            if (Object.keys(this.positiveDots).length + Object.keys(this.positiveDotNotDisplayed).length > Object.keys(storeHash).length) {
                removedDots = removedDots.concat(this.removeDotsFromArrayStoreChange(this.positiveDots, storeHash));
            }
        }else{
            if (Object.keys(this.negativeDots).length + Object.keys(this.negativeDotNotDisplayed).length > Object.keys(storeHash).length) {
                removedDots = removedDots.concat(this.removeDotsFromArrayStoreChange(this.negativeDots, storeHash));
            }
        }
        return removedDots;
    }

    removeDotsFromArrayStoreChange(localHash, storeHash){
        //console.log('removeDotsFromArrayStoreChange', storeHash);
        let removedDots = [];
        Object.keys(localHash).forEach(key => {
            if(storeHash.hasOwnProperty(key) === false){
                let dot = localHash[key];
                this.removeDotFromArray(dot);
                if(dot.sprite) {
                    let dotSprite = dot.sprite;
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

    checkIfNotDisplayedSpriteCanBe(){
        let addedDots = [];
        addedDots = addedDots.concat(this.displayHiddenDots(this.positiveDotNotDisplayed, this.positiveDotsContainer));
        addedDots = addedDots.concat(this.displayHiddenDots(this.negativeDotNotDisplayed, this.negativeDotsContainer));
        //console.log('checkIfNotDisplayedSpriteCanBe', this.zonePosition, addedDots);
        return addedDots;
    }

    displayHiddenDots(notShowedArray, container){
        let addedDots = [];
        let notShownedCount = Object.keys(notShowedArray).length;
        if(notShownedCount > 0){
            let toShowCount = this.maxDotsByZone - container.children.length;
            if(notShownedCount < toShowCount){
                toShowCount = notShownedCount;
            }
            if(toShowCount > 0) {
                let key;
                for (key in notShowedArray) {
                    addedDots.push(notShowedArray[key]);
                    toShowCount--;
                    if (toShowCount === 0) {
                        break;
                    }
                }
            }
        }
        addedDots.forEach(dot => {
            this.removeDotFromNotDisplayedArray(dot);
            let dotSprite;
            if(dot.color !== SPRITE_COLOR.BLUE){
                dotSprite = this.spritePool.getOne(SPRITE_COLOR.RED, true);
            }else{
                dotSprite = this.spritePool.getOne(SPRITE_COLOR.BLUE, true);
            }
            dot.sprite = dotSprite;
            dotSprite.dot = dot;
            addedDots.push(dot);
            container.addChild(dotSprite);
        });
        return addedDots;
    }

    addDotsFromStateChange(storePositiveDotsHash, storeNegativeDotsHash) {
        let addedDots = [];
        addedDots = addedDots.concat(this.doAddDotsFromStateChange(storePositiveDotsHash, this.positiveDots));
        addedDots = addedDots.concat(this.doAddDotsFromStateChange(storeNegativeDotsHash, this.negativeDots));
        //console.log('addDotsFromStateChange', this.zonePosition, addedDots.length, Object.keys(storePositiveDotsHash).length, this.positiveDotsContainer.children.length);
        return addedDots;
    }

    doAddDotsFromStateChange(storeHash, localHash){
        let addedDots = [];
        Object.keys(storeHash).forEach(key => {
            if (localHash.hasOwnProperty(key) == false) {
                addedDots.push(storeHash[key]);
                this.addDot(storeHash[key]);
            }
        });
        return addedDots;
    }

    getOvercrowding(amount){
        let dotsRemoved = [];
        if(Object.keys(this.positiveDots).length > amount - 1){
            dotsRemoved = this.getDotsFromHash(this.positiveDots, amount);
        }else if(Object.keys(this.negativeDots).length > amount - 1){
            dotsRemoved = this.getDotsFromHash(this.negativeDots, amount);
        }
        return dotsRemoved;
    }

    getDotsFromHash(hash, amount){
        let allRemovedDots = [];
        while (amount--) {
            allRemovedDots.push(hash[Object.keys(hash)[amount]]);
        }
        return allRemovedDots;
    }

    getPositiveNegativeOverdot(amount, isPositive){
        let key;
        let removed = [];
        if(amount > 0) {
            if (isPositive) {
                for (key in this.positiveDots) {
                    removed.push(this.positiveDots[key]);
                    amount--;
                    if (amount === 0) {
                        break;
                    }
                }
            } else {
                for (key in this.negativeDots) {
                    removed.push(this.negativeDots[key]);
                    amount--;
                    if (amount === 0) {
                        break;
                    }
                }
            }
        }
        return removed;
    }

    checkOvercrowding(){
        let dotOverload = false;
        if(Object.keys(this.positiveDots).length > this.base[1]-1) {
            this.dotsCounterContainer.setStyle(0xff0000);
            let frameTotal = this.positiveDotsContainer.children[0].totalFrames;
            this.positiveDotsContainer.children.forEach(sprite => {
                sprite.animationSpeed = 0.2;
                sprite.gotoAndPlay(randomFromTo(frameTotal - 15, frameTotal - 1));
            });
            dotOverload = true;
        }else{
            this.positiveDotsContainer.children.forEach(sprite => {
                sprite.gotoAndStop(0);
            });
            this.dotsCounterContainer.setStyle(0x444444);
        }

        if (this.negativePresent) {
            if (Object.keys(this.negativeDots).length > this.base[1] - 1) {
                this.negativeDotsCounterContainer.setStyle(0xff0000);
                let frameTotal = this.negativeDotsContainer.children[0].totalFrames;
                this.negativeDotsContainer.children.forEach(sprite => {
                    sprite.animationSpeed = 0.2;
                    sprite.gotoAndPlay(randomFromTo(frameTotal - 15, frameTotal - 1));
                });
                dotOverload = true;
            } else {
                this.negativeDotsContainer.children.forEach(sprite => {
                    sprite.gotoAndStop(0);
                });
                this.negativeDotsCounterContainer.setStyle(0xDDDDDD);
            }
        }
        return dotOverload;
    }

    checkPositiveNegativePresence(isOverload){
        if(this.negativePresent && this.base[1] != BASE.BASE_X){
            if(isOverload === false && Object.keys(this.positiveDots).length > 0 && Object.keys(this.negativeDots).length > 0) {
                let tween = TweenMax.fromTo(
                    this.positiveDotsContainer,
                    0.3,
                    {y:this.positiveDotsContainer.y - 1},
                    {y:"+=1", ease:RoughEase.ease.config({strength:8, points:20, template:Linear.easeNone, randomize:false}),
                        clearProps:"x"
                    }
                );
                tween.repeat(-1).repeatDelay(2).yoyo(true).play();
                let tween2 = TweenMax.fromTo(
                    this.negativeDotsContainer,
                    0.3,
                    {y:this.negativeDotsContainer.y - 1},
                    {y:"+=1", ease:RoughEase.ease.config({strength:8, points:20, template:Linear.easeNone, randomize:false}),
                        clearProps:"x"
                    }
                );
                tween2.repeat(-1).repeatDelay(2).yoyo(true).play();
                return true;
            }else{
                TweenMax.killTweensOf(this.positiveDotsContainer);
                TweenMax.killTweensOf(this.negativeDotsContainer);
                this.positiveDotsContainer.position.copy(this.originalPositiveBoxPosition);
                this.negativeDotsContainer.position.copy(this.originalNegativeBoxPosition);
                return false;
            }
        }
    }

    baseChange(base){
        //console.log(base);
        this.base = base;
        if (this.base[1] === BASE.BASE_X) {
            this.setValueText('X');
            if(this.placeValueExponent !== null){
                this.placeValueExponent.text = '2';
            }
        } else {
            if (base[0] === 1 || this.zonePosition === 0) {
                this.setValueText(String(Math.pow(base[1], this.zonePosition)));
            } else {
                this.setValueText(String(Math.pow(base[1], this.zonePosition) + '/' + Math.pow(base[0], this.zonePosition)));
            }
        }
    }

    setValueText(text){
        this.placeValueText.text = text;
    }

    setValueTextAlpha(alpha){
        this.placeValueText.alpha = alpha;
        if(this.placeValueExponent !== null){
            this.placeValueExponent.alpha = alpha;
        }
    }

    precalculateDotsForDivision(){
        this.positiveDotCount = Object.keys(this.positiveDots).length;
        this.negativeDotCount = Object.keys(this.negativeDots).length;
    }

    setBackgroundColor(status) {
        //console.log(this.zonePosition, this.isActive, status);
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

    getDotsForDivision(amount, isPositive){
        let dotsRemoved;
        if(isPositive) {
            if(Object.keys(this.positiveDots).length > amount - 1) {
                dotsRemoved = this.getDotsFromHash(this.positiveDots, amount);
            }
        }else {
            if (Object.keys(this.negativeDots).length > amount - 1) {
                dotsRemoved = this.getDotsFromHash(this.negativeDots, amount);
            }
        }
        return dotsRemoved;
    }

    addDivisionValue(positive){
        if (this.positiveDividerText != null && this.negativeDividerText != null) {
            if (positive) {
                this.positiveDividerText.text = Number(this.positiveDividerText.text) + 1;
                // check if division value exceed base
                if (this.base[1] != BASE.BASE_X && Number(this.positiveDividerText.text) >= this.base[1]) {
                    if(this.zonePosition != this.totalZoneCount - 1) {
                        // do animate if not the leftmost box
                        this.positiveDivideCounter.texture = this.textures['dot_div_value_r.png'];
                        this.eventEmitter.emit(PowerZone.DIVIDER_OVERLOAD, this.zonePosition, positive);
                    }else{
                        this.positiveDividerText.style.fill = 0xff0000;
                    }
                }
            } else {
                //console.log(Number(this.negativeDividerText.text), (Number(this.negativeDividerText.text) + 1));
                this.negativeDividerText.text = '-' + (Math.abs(Number(this.negativeDividerText.text)) + 1);
                // check if division value exceed base
                if (this.base[1] != BASE.BASE_X && Math.abs(Number(this.negativeDividerText.text)) >= this.base[1]) {
                    if(this.zonePosition != this.totalZoneCount - 1) {
                        // do animate if not the leftmost box
                        this.negativeDivideCounter.texture = this.textures['antidot_div_value_r.png'];
                        this.eventEmitter.emit(PowerZone.DIVIDER_OVERLOAD, this.zonePosition, positive);
                    }else{
                        this.negativeDividerText.style.fill = 0xff0000;
                    }
                }
            }
        }
    }

    onDividerOverloadSolved(isPositive){
        if(isPositive){
            this.positiveDividerText.text = '0';
            this.positiveDivideCounter.texture = this.textures['dot_div_value.png'];
        }else{
            this.negativeDividerText.text = '0';
            this.negativeDivideCounter.texture = this.textures['antidot_div_value.png'];
        }
    }

    onDividerAutoPopulated(isPositive){
        if(isPositive){
            this.positiveDividerText.text = String(Number(this.positiveDividerText.text) + 1);
            this.positiveDividerText.style.fill = 0x565656;
        }else{
            this.negativeDividerText.text = String(Number(this.negativeDividerText.text) + 1);
            this.negativeDividerText.style.fill = 0x565656;
        }
    }

    update(){
        //console.log('update');
        if(this.negativePresent){
            this.negativeProximityManager.draw();
            this.positiveProximityManager.draw();
        }else{
            this.positiveProximityManager.draw();
        }
    }

    reset(){
        if (this.positiveDividerText != null && this.negativeDividerText != null) {
            this.positiveDividerText.text = ' ';
            this.negativeDividerText.text = ' ';
            this.positiveDividerText.style.fill = 0x565656;
            this.negativeDividerText.style.fill = 0x565656;
        }
    }
}
