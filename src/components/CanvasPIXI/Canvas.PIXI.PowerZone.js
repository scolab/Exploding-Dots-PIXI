import {BASE, OPERATOR_MODE, USAGE_MODE, BOX_INFO, POSITION_INFO, MAX_DOT} from '../../Constants'
import {ProximityManager} from '../../utils/ProximityManager';
import {EventEmitter} from 'eventemitter3';
import {convertBase} from '../../utils/MathUtils'
import { TweenMax, RoughEase, Linear} from "gsap";
//import {ObjPool} from '../../utils/ObjPool';

export class PowerZone extends PIXI.Container{

    static CREATE_DOT = 'CREATE_DOT';

    positiveDots = {};
    negativeDots = {};
    positiveDotsContainer = null;
    negativeDotsContainer = null;
    positiveProximityManager = null;
    negativeProximityManager = null;
    positiveDotNotDisplayed = {};
    negativeDotNotDisplayed = {};
    zonePosition = 0;
    negativePresent = false;
    base = [];
    totalZoneCount = 0;
    greyFilter = new PIXI.filters.ColorMatrixFilter();
    maxDotsByZone = 0;
    dotsCounterText = null;
    negativeDotsCounterText = null;
    spritePool = null;

    constructor(position, textures, base, negativePresent, usage_mode, operator_mode, totalZoneCount, spritePool, zoneCreated) {
        super();
        this.zonePosition = totalZoneCount - position - 1;
        this.negativePresent = negativePresent;
        this.base = base;
        this.totalZoneCount = totalZoneCount;
        this.spritePool = spritePool;
        this.greyFilter.greyscale(0.3, true);
        this.maxDotsByZone = negativePresent ? MAX_DOT.MIX : MAX_DOT.ONLY_POSITIVE;
        this.eventEmitter = new EventEmitter();
        let boxYPos = 70;
        let gutterWidth = 23;
        let leftGutter = 66;
        let dotsCounter = new PIXI.Sprite(textures["dot_value.png"]);
        dotsCounter.anchor.x = 0.5;
        dotsCounter.x = (position * (BOX_INFO.BOX_WIDTH + gutterWidth)) + (BOX_INFO.BOX_WIDTH / 2) + 3;
        dotsCounter.y = 0;
        this.addChild(dotsCounter);
        this.dotsCounterText = new PIXI.Text(position, {
            fontFamily: 'museo-slab',
            fontSize: 22,
            fill: 0x6D6D6D,
            align: 'center',
        });
        this.dotsCounterText.anchor.x = 0.5;
        this.dotsCounterText.x = (position * (BOX_INFO.BOX_WIDTH + gutterWidth)) + (BOX_INFO.BOX_WIDTH / 2);
        this.dotsCounterText.y = 45;
        this.dotsCounterText.text = '';
        this.addChild(this.dotsCounterText);

        if (negativePresent) {
            let dotsCounterNegative = new PIXI.Sprite(textures["antidot_value.png"]);
            dotsCounterNegative.anchor.x = 0.5;
            dotsCounterNegative.x = (position * (BOX_INFO.BOX_WIDTH + gutterWidth)) + (BOX_INFO.BOX_WIDTH / 2) + 5;
            dotsCounterNegative.y = BOX_INFO.BOX_HEIGHT + 20;
            this.addChild(dotsCounterNegative);

            this.negativeDotsCounterText = new PIXI.Text(position, {
                fontFamily: 'museo-slab',
                fontSize: 22,
                fill: 0xFFFFFF,
                align: 'center'
            });
            this.negativeDotsCounterText.anchor.x = 0.5;
            this.negativeDotsCounterText.x = (position * (BOX_INFO.BOX_WIDTH + gutterWidth)) + (BOX_INFO.BOX_WIDTH / 2);
            this.negativeDotsCounterText.y = BOX_INFO.BOX_HEIGHT + 70;
            this.negativeDotsCounterText.text = '1';
            this.addChild(this.negativeDotsCounterText);
        }

        let bgBox = new PIXI.Sprite(textures["box.png"]);
        bgBox.x = position * (BOX_INFO.BOX_WIDTH + gutterWidth);
        bgBox.y = boxYPos;
        this.addChild(bgBox);

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

        if (operator_mode === OPERATOR_MODE.DIVIDE) {
            let dividerCounter = new PIXI.Sprite(textures["dot_div_value.png"]);
            dividerCounter.x = (position * (BOX_INFO.BOX_WIDTH + gutterWidth)) + BOX_INFO.BOX_WIDTH - dividerCounter.width;
            dividerCounter.y = boxYPos;
            this.addChild(dividerCounter);

            this.dividerValueText = new PIXI.Text('1', {
                fontFamily: 'museo-slab',
                fontSize: 16,
                fill: 0x565656,
                align: 'center'
            });
            this.dividerValueText.anchor.x = 0.5;
            this.dividerValueText.x = (position * (BOX_INFO.BOX_WIDTH + gutterWidth)) + BOX_INFO.BOX_WIDTH - (dividerCounter.width / 2);
            this.dividerValueText.y = boxYPos + 3;
            this.addChild(this.dividerValueText);

            if (operator_mode === OPERATOR_MODE.DIVIDE && base[1] === BASE.BASE_X) {
                let negativeDividerCounter = new PIXI.Sprite(textures["antidot_div_value.png"]);
                negativeDividerCounter.x = (position * (BOX_INFO.BOX_WIDTH + gutterWidth));
                negativeDividerCounter.y = BOX_INFO.BOX_HEIGHT + boxYPos - negativeDividerCounter.height - 10;
                this.addChild(negativeDividerCounter);

                this.dividerNegativeValueText = new PIXI.Text('1', {
                    fontFamily: 'museo-slab',
                    fontSize: 16,
                    fill: 0x565656,
                    align: 'center'
                });
                this.dividerNegativeValueText.anchor.x = 0.5;
                this.dividerNegativeValueText.x = (position * (BOX_INFO.BOX_WIDTH + gutterWidth)) + 15;
                this.dividerNegativeValueText.y = negativeDividerCounter.y + 15;
                this.addChild(this.dividerNegativeValueText);
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
            let positiveZoneIsEmpty = this.getZoneTextAndAlphaStatus(this.positiveDots, this.dotsCounterText, false);
            let negativeZoneIsEmpty = true;
            if(this.negativePresent) {
                negativeZoneIsEmpty = this.getZoneTextAndAlphaStatus(this.negativeDots, this.negativeDotsCounterText, !positiveZoneIsEmpty);
            }
            if(negativeZoneIsEmpty == false && positiveZoneIsEmpty){
                positiveZoneIsEmpty = this.getZoneTextAndAlphaStatus(this.positiveDots, this.dotsCounterText, true);
            }
            if (positiveZoneIsEmpty === true && (this.negativePresent === false || negativeZoneIsEmpty === true)) {
                this.filters = [this.greyFilter];
            } else {
                this.filters = null;
            }
            return positiveZoneIsEmpty && negativeZoneIsEmpty;
        }else{
            this.filters = null;
            this.getZoneTextAndAlphaStatus(this.positiveDots, this.dotsCounterText, true);
            if(this.negativePresent) {
                this.getZoneTextAndAlphaStatus(this.negativeDots, this.negativeDotsCounterText, false);
            }
            return false;
        }
    }

    getZoneTextAndAlphaStatus(dots, valueText, populate) {
        var zoneAreEmpty = false;
        if (Object.keys(dots).length !== 0) {
            if (this.base[1] !== 12) {
                valueText.text = Object.keys(dots).length;
            } else {
                valueText.text = convertBase(Object.keys(dots).length.toString(), 10, 12);
            }
        } else {
            if (populate || this.zonePosition === 0) {
                valueText.text = '0';
            } else {
                zoneAreEmpty = true;
                valueText.text = '';
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

    getANotDisplayedDot(isPositive){
        //console.log('getANotDisplayedDot', this.zonePosition);
        if(isPositive) {
            let dot = this.positiveDotNotDisplayed[Object.keys(this.positiveDotNotDisplayed)[0]];
            delete this.positiveDotNotDisplayed[dot.id];
            return dot;
        }else{
            let dot = this.negativeDotNotDisplayed[Object.keys(this.negativeDotNotDisplayed)[0]];
            delete this.negativeDotNotDisplayed[dot.id];
            return dot;
        }
    }

    removeDotFromArray(dot){
        if(dot.isPositive){
            delete this.positiveDots[dot.id];
        }else{
            delete this.negativeDots[dot.id];
        }
        //ObjPool.dispose(dot);
    }

    addDotToArray(dot){
        if(dot.isPositive){
            this.positiveDots[dot.id] = dot;
        }else{
            this.negativeDots[dot.id] = dot;
        }
        //console.log('addDotToArray', this.zonePosition, this.positiveDots, this.negativeDots);
    }

    removeDotsIfNeeded(storeHash, isPositive){
        let removedDots = [];
        if(isPositive) {
            if (Object.keys(this.positiveDots).length + Object.keys(this.positiveDotNotDisplayed).length > Object.keys(storeHash).length) {
                removedDots = removedDots.concat(this.removeDotsFromArray(this.positiveDots, storeHash));
                removedDots = removedDots.concat(this.removeDotsFromArray(this.positiveDotNotDisplayed, storeHash));
                //console.log('removeDotsIfNeeded positive', this.zonePosition, removedDots);

            }
        }else{
            if (Object.keys(this.negativeDots).length + Object.keys(this.negativeDotNotDisplayed).length > Object.keys(storeHash).length) {
                removedDots = removedDots.concat(this.removeDotsFromArray(this.negativeDots, storeHash));
                removedDots = removedDots.concat(this.removeDotsFromArray(this.negativeDotNotDisplayed, storeHash));
                //console.log('removeDotsIfNeeded negative', this.zonePosition, removedDots);
            }
        }
        return removedDots;
    }

    removeDotsFromArray(localHash, storeHash){
        //console.log('removeDotsFromArray', storeHash);
        let removedDots = [];
        Object.keys(localHash).forEach(key => {
            if(storeHash.hasOwnProperty(key) === false){
                let dot = localHash[key];
                delete localHash[key];
                //ObjPool.dispose(dot);
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
        while(Object.keys(notShowedArray).length > 0 && container.children.length < this.maxDotsByZone){
            //let dot = notShowedArray.pop();
            let dot = notShowedArray[Object.keys(notShowedArray)[0]];
            delete notShowedArray[dot.id];
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
        }
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

    checkPositiveNegativePresence(){
        if(this.negativePresent && this.base[1] != BASE.BASE_X){
            if(Object.keys(this.positiveDots).length > 0 && Object.keys(this.negativeDots).length > 0) {
                let tween = TweenMax.fromTo(this.positiveDotsContainer, 0.3, {y:this.positiveDotsContainer.y - 1}, {y:"+=1", ease:RoughEase.ease.config({strength:8, points:20, template:Linear.easeNone, randomize:false}) , clearProps:"x"});
                tween.repeat(-1).yoyo(true).play();
                let tween2 = TweenMax.fromTo(this.negativeDotsContainer, 0.3, {y:this.negativeDotsContainer.y - 1}, {y:"+=1", ease:RoughEase.ease.config({strength:8, points:20, template:Linear.easeNone, randomize:false}) , clearProps:"x"});
                tween2.repeat(-1).yoyo(true).play();
            }else{
                TweenMax.killTweensOf(this.positiveDotsContainer);
                TweenMax.killTweensOf(this.negativeDotsContainer);
            }
        }
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

    checkOvercrowding(){
        let dotOverload = false;
        if(Object.keys(this.positiveDots).length > this.base[1]-1) {
            let tween = TweenMax.fromTo(this.positiveDotsContainer, 0.3,
                {x:this.positiveDotsContainer.x - 1},
                {x:"+=1",
                    ease:RoughEase.ease.config({
                        strength:8,
                        points:20,
                        template:Linear.easeNone,
                        randomize:false
                    }),
                    clearProps:"x"});
            tween.repeat(-1).yoyo(true).play();
            this.dotsCounterText.style.fill = 0xff0000;
            dotOverload = true;
        }else{
            TweenMax.killTweensOf(this.positiveDotsContainer);
            this.dotsCounterText.style.fill = 0x444444;
        }

        if (this.negativePresent) {
            if (Object.keys(this.negativeDots).length > this.base[1] - 1) {
                let tween = TweenMax.fromTo(this.negativeDotsContainer, 0.3,
                    {x: this.negativeDotsContainer.x - 1}, {
                        x: "+=1",
                        ease: RoughEase.ease.config({
                            strength: 8,
                            points: 20,
                            template: Linear.easeNone,
                            randomize: false
                        }),
                        clearProps: "x"
                    });
                tween.repeat(-1).yoyo(true).play();
                this.negativeDotsCounterText.fill = 0xff0000;
                dotOverload = true;
            } else {
                TweenMax.killTweensOf(this.negativeDotsContainer);
                this.negativeDotsCounterText.style.fill = 0xDDDDDD;
            }
        }
        if (this.negativePresent && dotOverload === false){
            if(Object.keys(this.positiveDots).length > 0 && Object.keys(this.negativeDots).length > 0) {
                let tween = TweenMax.fromTo(this, 0.3,
                    {x: this.x - 1}, {
                        x: "+=1",
                        ease: RoughEase.ease.config({
                            strength: 8,
                            points: 20,
                            template: Linear.easeNone,
                            randomize: false
                        }),
                        clearProps: "x"
                    });
                tween.repeat(-1).yoyo(true).play();
            }else{
                TweenMax.killTweensOf(this);
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
}
