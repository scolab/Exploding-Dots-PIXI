import {BASE, OPERATOR_MODE, USAGE_MODE, BOX_INFO, POSITION_INFO, MAX_DOT} from '../../Constants'
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

    positiveDots = {};
    negativeDots = {};
    positiveDotNotDisplayed = {};
    negativeDotNotDisplayed = {};
    positiveDotCount;
    negativeDotCount;
    positiveDotsContainer = null;
    negativeDotsContainer = null;
    positiveDividerText = '';
    negativeDividerText = '';
    positiveProximityManager = null;
    negativeProximityManager = null;
    originalPositiveBoxPosition;
    originalNegativeBoxPosition;
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

    constructor(position, textures, base, negativePresent, usage_mode, operator_mode, totalZoneCount, spritePool, zoneCreated) {
        super();
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
        let boxYPos = 70;
        let gutterWidth = 23;
        let leftGutter = 66;
        this.dotsCounterContainer = new DotCounter(position, textures["dot_value_left.png"], textures["dot_value_center.png"], textures["dot_value_right.png"]);
        this.dotsCounterContainer.y = 40;
        this.dotsCounterContainer.x = (position * (BOX_INFO.BOX_WIDTH + gutterWidth)) + (BOX_INFO.BOX_WIDTH / 2) - (this.dotsCounterContainer.getWidth() / 2);
        this.addChild(this.dotsCounterContainer);

        if (negativePresent) {
            this.negativeDotsCounterContainer = new DotCounter(position, textures["antidot_value_left.png"], textures["antidot_value_center.png"], textures["antidot_value_right.png"]);
            this.negativeDotsCounterContainer.x = (position * (BOX_INFO.BOX_WIDTH + gutterWidth)) + (BOX_INFO.BOX_WIDTH / 2) - (this.negativeDotsCounterContainer.getWidth() / 2);
            this.negativeDotsCounterContainer.y = BOX_INFO.BOX_HEIGHT + 70;
            this.addChild(this.negativeDotsCounterContainer);
            this.negativeDotsCounterContainer.setStyle(0xFFFFFF);
        }

        this.bgBoxTextures.push(textures["box.png"]);
        this.bgBoxTextures.push(textures["box_yes.png"]);
        this.bgBoxTextures.push(textures["box_no.png"]);
        this.bgBox = new PIXI.Sprite(this.bgBoxTextures[0]);
        this.bgBox.x = position * (BOX_INFO.BOX_WIDTH + gutterWidth);
        this.bgBox.y = boxYPos;
        this.addChild(this.bgBox);

        if (base[1] === 'x') {
            this.placeValueText = new PIXI.Text('X' + (zoneCreated), {
                fontFamily: 'museo-slab',
                fontSize: 40,
                fill: 0xBCBCBC,
                align: 'center'
            });
        } else {
            let text;
            if (base[0] === 1 || zoneCreated === 0) {
                text = String(Math.pow(base[1], zoneCreated));
            } else {
                text = '(' + String(Math.pow(base[1], zoneCreated) + '/' + Math.pow(base[0], zoneCreated)) + ')';
            }

            this.placeValueText = new PIXI.Text(text, {
                fontFamily: 'museo-slab',
                fontSize: 40,
                fill: 0xBCBCBC,
                align: 'center'
            });
        }
        this.placeValueText.anchor.x = 0.5;
        this.placeValueText.x = (position * (BOX_INFO.BOX_WIDTH + gutterWidth)) + (BOX_INFO.BOX_WIDTH / 2);
        this.placeValueText.y = boxYPos + (BOX_INFO.BOX_HEIGHT / 2) - 30;
        this.addChild(this.placeValueText);

        if (operator_mode === OPERATOR_MODE.DIVIDE) {
            let dividerCounter = new PIXI.Sprite(textures["dot_div_value.png"]);
            dividerCounter.x = (position * (BOX_INFO.BOX_WIDTH + gutterWidth)) + BOX_INFO.BOX_WIDTH - dividerCounter.width;
            dividerCounter.y = boxYPos;
            this.addChild(dividerCounter);

            this.positiveDividerText = new PIXI.Text('', {
                fontFamily: 'museo-slab',
                fontSize: 16,
                fill: 0x565656,
                align: 'center'
            });
            this.positiveDividerText.anchor.x = 0.5;
            this.positiveDividerText.x = (position * (BOX_INFO.BOX_WIDTH + gutterWidth)) + BOX_INFO.BOX_WIDTH - (dividerCounter.width / 2);
            this.positiveDividerText.y = boxYPos + 3;
            this.addChild(this.positiveDividerText);

            if (operator_mode === OPERATOR_MODE.DIVIDE) {
                let negativeDividerCounter = new PIXI.Sprite(textures["antidot_div_value.png"]);
                negativeDividerCounter.x = (position * (BOX_INFO.BOX_WIDTH + gutterWidth));
                negativeDividerCounter.y = BOX_INFO.BOX_HEIGHT + boxYPos - negativeDividerCounter.height - 10;
                this.addChild(negativeDividerCounter);

                this.negativeDividerText = new PIXI.Text('', {
                    fontFamily: 'museo-slab',
                    fontSize: 16,
                    fill: 0x565656,
                    align: 'center'
                });
                this.negativeDividerText.anchor.x = 0.5;
                this.negativeDividerText.x = (position * (BOX_INFO.BOX_WIDTH + gutterWidth)) + 15;
                this.negativeDividerText.y = negativeDividerCounter.y + 15;
                this.addChild(this.negativeDividerText);
            }
        }

        if (negativePresent) {
            let separator = new PIXI.Sprite(textures['separator.png']);
            separator.x = (position * (BOX_INFO.BOX_WIDTH + gutterWidth)) + 5;
            separator.y = boxYPos + (BOX_INFO.BOX_HEIGHT / 2) - 5;
            this.addChild(separator);

            this.positiveDotsContainer = new PIXI.Container();
            this.positiveDotsContainer.x = position * (BOX_INFO.BOX_WIDTH + gutterWidth);
            this.positiveDotsContainer.y = boxYPos;
            this.addChild(this.positiveDotsContainer);
            this.positiveDotsContainer.interactive = true;
            this.originalPositiveBoxPosition = new PIXI.Point(this.positiveDotsContainer.position.x, this.positiveDotsContainer.position.y);

            this.positiveDotsContainer.hitArea = new PIXI.Rectangle(0, 0, BOX_INFO.BOX_WIDTH, BOX_INFO.HALF_BOX_HEIGHT);
            this.positiveProximityManager = new ProximityManager(100, this.positiveDotsContainer.hitArea);
            this.positiveDotsContainer.powerZone = totalZoneCount - position - 1;
            this.positiveDotsContainer.isPositive = true;
            if (usage_mode === USAGE_MODE.FREEPLAY) {
                this.positiveDotsContainer.buttonMode = true;
                this.positiveDotsContainer.on('pointerup', this.createDot.bind(this));
            }

            this.negativeDotsContainer = new PIXI.Container();
            this.negativeDotsContainer.x = position * (BOX_INFO.BOX_WIDTH + gutterWidth);
            this.negativeDotsContainer.y = boxYPos + BOX_INFO.HALF_BOX_HEIGHT;
            this.addChild(this.negativeDotsContainer);
            this.negativeDotsContainer.interactive = true;
            this.originalNegativeBoxPosition = new PIXI.Point(this.negativeDotsContainer.position.x, this.negativeDotsContainer.position.y);

            this.negativeDotsContainer.hitArea = new PIXI.Rectangle(-0, 0, BOX_INFO.BOX_WIDTH, BOX_INFO.HALF_BOX_HEIGHT);
            this.negativeProximityManager = new ProximityManager(100, this.negativeDotsContainer.hitArea);
            this.negativeDotsContainer.powerZone = totalZoneCount - position - 1;
            this.negativeDotsContainer.isPositive = false;
            if (usage_mode === USAGE_MODE.FREEPLAY) {
                this.negativeDotsContainer.buttonMode = true;
                this.negativeDotsContainer.on('pointerup', this.createDot.bind(this));
            }
        } else {
            this.positiveDotsContainer = new PIXI.Container();
            this.positiveDotsContainer.x = position * (BOX_INFO.BOX_WIDTH + gutterWidth);
            this.positiveDotsContainer.y = boxYPos;
            this.addChild(this.positiveDotsContainer);
            this.positiveDotsContainer.interactive = true;

            this.positiveDotsContainer.hitArea = new PIXI.Rectangle(0, 0, BOX_INFO.BOX_WIDTH, BOX_INFO.BOX_HEIGHT);
            this.positiveProximityManager = new ProximityManager(100, this.positiveDotsContainer.hitArea);
            this.positiveDotsContainer.powerZone = totalZoneCount - position - 1;
            this.positiveDotsContainer.isPositive = true;
            if (usage_mode === USAGE_MODE.FREEPLAY) {
                this.positiveDotsContainer.buttonMode = true;
                //this.positiveDotsContainer.on('pointerup', (e) => {this.eventEmitter.emit('CreateDot', e)});
                this.positiveDotsContainer.on('pointerup', this.createDot.bind(this));
            }
        }

        this.x += leftGutter;
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
        }else if(clickPos.y > hitArea.height - POSITION_INFO.DOT_RAYON - POSITION_INFO.BOX_BOTTOM_GREY_ZONE){
            clickModifiedPos.push(hitArea.height - POSITION_INFO.DOT_RAYON - POSITION_INFO.BOX_BOTTOM_GREY_ZONE);
        }else{
            clickModifiedPos.push(clickPos.y);
        }
        this.eventEmitter.emit(PowerZone.CREATE_DOT, e.target.powerZone, clickModifiedPos, e.target.isPositive);
    }

    checkTextAndAlpha(doCheck){
        if(doCheck) {
            let positiveZoneIsEmpty = this.getZoneTextAndAlphaStatus(this.positiveDots, this.dotsCounterContainer, false);
            let negativeZoneIsEmpty = true;
            if(this.negativePresent) {
                negativeZoneIsEmpty = this.getZoneTextAndAlphaStatus(this.negativeDots, this.negativeDotsCounterContainer, !positiveZoneIsEmpty);
            }
            if(negativeZoneIsEmpty == false && positiveZoneIsEmpty){
                positiveZoneIsEmpty = this.getZoneTextAndAlphaStatus(this.positiveDots, this.dotsCounterContainer, true);
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
            this.filters = null;
            this.isActive = true;
            this.getZoneTextAndAlphaStatus(this.positiveDots, this.dotsCounterContainer, true);
            if(this.negativePresent) {
                this.getZoneTextAndAlphaStatus(this.negativeDots, this.negativeDotsCounterContainer, false);
            }
            return false;
        }
    }

    getZoneTextAndAlphaStatus(dots, counter, populate) {
        var zoneAreEmpty = false;
        if (Object.keys(dots).length !== 0) {
            if (this.base[1] !== 12) {
                counter.setText(Object.keys(dots).length);
            } else {
                counter.setText(convertBase(Object.keys(dots).length.toString(), 10, 12));
            }
        } else {
            if (populate || this.zonePosition === 0) {
                counter.setText('0');
            } else {
                zoneAreEmpty = true;
                counter.setText('');
            }
        }
        return zoneAreEmpty;
    }

    checkDivideResultText(doCheck){
        if(doCheck) {
            let dividerIsEmpty = this.getDividerTextStatus(this.positiveDividerText, false);
            let negativeDividerIsEmpty = this.getDividerTextStatus(this.negativeDividerText, !dividerIsEmpty);
            if(negativeDividerIsEmpty == false && dividerIsEmpty){
                dividerIsEmpty = this.getDividerTextStatus(this.positiveDividerText, true);
            }
            return dividerIsEmpty && negativeDividerIsEmpty;
        }else{
            this.getDividerTextStatus(this.positiveDividerText, true);
            this.getDividerTextStatus(this.negativeDividerText, false);
            return false;
        }
    }

    getDividerTextStatus(dividerText, populate) {
        var zoneAreEmpty = false;
        if (Number(dividerText.valueOf()) === 0) {
            if (populate || this.zonePosition === 0) {
                dividerText.text = '0';
            } else {
                zoneAreEmpty = true;
                dividerText.text = '';
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
                this.positiveProximityManager.addItem(dotSprite);
                dot.sprite = dotSprite;
                dotSprite.dot = dot;
            }
        }else{
            dotSprite = this.doAddDot(dot, this.negativeDotsContainer, this.negativeDotNotDisplayed);
            if(dotSprite) {
                this.negativeProximityManager.addItem(dotSprite);
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
            if(dot.color !== 'two'){
                dotSprite = this.spritePool.getOne('one', dot.isPositive);
            }else{
                dotSprite = this.spritePool.getOne('two', dot.isPositive);
            }
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
                    this.spritePool.dispose(dotSprite);
                    if (dotSprite.particleEmitter) {
                        dotSprite.particleEmitter.stop();
                    }
                }
                dot.sprite = null;
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
            if(dot.color !== 'two'){
                dotSprite = this.spritePool.getOne('one', true);
            }else{
                dotSprite = this.spritePool.getOne('two', true);
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
        if(Object.keys(this.positiveDots).length > amount){
            dotsRemoved = this.getOvercrowdedDots(this.positiveDots, amount);
        }else if(Object.keys(this.negativeDots).length > amount){
            dotsRemoved = this.getOvercrowdedDots(this.negativeDots, amount);
        }
        return dotsRemoved;
    }

    getOvercrowdedDots(hash, amount){
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
            /*let tween = TweenMax.fromTo(this.positiveDotsContainer, 0.3,
                {x:this.positiveDotsContainer.x - 1},
                {x:"+=1",
                    ease:RoughEase.ease.config({
                        strength:8,
                        points:20,
                        template:Linear.easeNone,
                        randomize:false
                    }),
                    clearProps:"x"});
            tween.repeat(-1).yoyo(true).play();*/
            this.dotsCounterContainer.setStyle(0xff0000);
            let frameTotal = this.positiveDotsContainer.children[0].totalFrames;
            this.positiveDotsContainer.children.forEach(sprite => {
                sprite.animationSpeed = 0.2;
                sprite.gotoAndPlay(randomFromTo(frameTotal - 15, frameTotal - 1));
            });
            dotOverload = true;
        }else{
            //TweenMax.killTweensOf(this.positiveDotsContainer);
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
                //TweenMax.killTweensOf(this.negativeDotsContainer);
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
                let tween = TweenMax.fromTo(this.positiveDotsContainer, 0.3, {y:this.positiveDotsContainer.y - 1}, {y:"+=1", ease:RoughEase.ease.config({strength:8, points:20, template:Linear.easeNone, randomize:false}) , clearProps:"x"});
                tween.repeat(-1).yoyo(true).play();
                let tween2 = TweenMax.fromTo(this.negativeDotsContainer, 0.3, {y:this.negativeDotsContainer.y - 1}, {y:"+=1", ease:RoughEase.ease.config({strength:8, points:20, template:Linear.easeNone, randomize:false}) , clearProps:"x"});
                tween2.repeat(-1).yoyo(true).play();
            }else{
                TweenMax.killTweensOf(this.positiveDotsContainer);
                TweenMax.killTweensOf(this.negativeDotsContainer);
                this.positiveDotsContainer.position.copy(this.originalPositiveBoxPosition);
                this.negativeDotsContainer.position.copy(this.originalNegativeBoxPosition);
            }
        }
    }

    baseChange(base){
        //console.log(base);
        this.base = base;
        if (this.base[1] === BASE.BASE_X) {
            this.setValueText('X' + i);
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
                    //console.log('111');
                    this.bgBox.texture = this.bgBoxTextures[1];
                    break;
                case PowerZone.BG_RED:
                    //console.log('222');
                    this.bgBox.texture = this.bgBoxTextures[2];
                    break;
                default:
                    //console.log('333');
                    this.bgBox.texture = this.bgBoxTextures[0];
            }
        }
    }
}
