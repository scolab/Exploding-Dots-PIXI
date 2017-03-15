import {BASE, OPERATOR_MODE, USAGE_MODE, BOX_INFO, POSITION_INFO, MAX_DOT} from '../../Constants'
import {ProximityManager} from '../../utils/ProximityManager';
import {EventEmitter} from 'eventemitter3';
import {convertBase} from '../../utils/MathUtils'
import { TweenMax, RoughEase, Linear} from "gsap";

export class PowerZone extends PIXI.Container{

    static CREATE_DOT = 'CREATE_DOT';

    positiveDots = [];
    negativeDots = [];
    positiveDotsContainer = null;
    negativeDotsContainer = null;
    positiveProximityManager = null;
    negativeProximityManager = null;
    positiveDotNotDisplayed = [];
    negativeDotNotDisplayed = [];
    zonePosition = 0;
    negativePresent = false;
    base = [];
    totalZoneCount = 0;
    greyFilter = new PIXI.filters.ColorMatrixFilter();
    maxDotsByZone = 0;
    dotsCounterText = null;
    negativeDotsCounterText = null;
    spritePool = null;
    dotPool = null;

    constructor(position, textures, base, negativePresent, usage_mode, operator_mode, totalZoneCount, spritePool, dotPool, zoneCreated) {
        super();
        this.zonePosition = totalZoneCount - position - 1;
        this.negativePresent = negativePresent;
        this.base = base;
        this.totalZoneCount = totalZoneCount;
        this.spritePool = spritePool;
        this.dotPool = dotPool;
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
        //console.log('createDot', e);
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

    checkTextAndAlpha(){
        let positiveZoneIsEmpty = this.getZoneTextAndAlphaStatus(this.positiveDots, this.dotsCounterText);
        let negativeZoneIsEmpty = this.getZoneTextAndAlphaStatus(this.negativeDots, this.negativeDotsCounterText, false);
        if(positiveZoneIsEmpty === true && (this.negativePresent === false || negativeZoneIsEmpty === true)){
            this.filters = [this.greyFilter];
        }else{
            this.filters = null;
        }

    }

    getZoneTextAndAlphaStatus(dots, valueText, isPositive = true){
        let zoneAreEmpty = false;
        if(dots.length !== 0){
            if(this.base[1] !== 12) {
                valueText.text = dots.length;
            }else{
                valueText.text = convertBase(dots.length.toString(), 10, 12);
            }
        }else if(isPositive || this.negativePresent){
            if (dots.length !== 0) {
                valueText.text = '0';
            }else{
                if(this.zonePosition != 0) {
                    valueText.text = '';
                    zoneAreEmpty = true;
                }else{
                    valueText.text = '0';
                }
            }
        }
        return zoneAreEmpty;
    }

    addDot(dot){
        console.log('addDot');
        let dotSprite;
        if(dot.isPositive) {
            dotSprite = this.doAddDot(dot, this.positiveDotsContainer, this.positiveDotNotDisplayed);
            this.positiveDots.push(dot);
            if(dotSprite) {
                this.positiveProximityManager.addItem(dotSprite);
                dot.sprite = dotSprite;
                dotSprite.dot = dot;
            }
        }else{
            dotSprite = this.doAddDot(dot, this.negativeDotsContainer, this.negativeDotNotDisplayed);
            this.negativeDots.push(dot);
            if(dotSprite) {
                this.negativeProximityManager.addItem(dotSprite);
                dot.sprite = dotSprite;
                dotSprite.dot = dot;
            }
        }
        return dotSprite;
    }

    doAddDot(dot, container, notDisplayed){
        let dotSprite;
        if(container.children.length < this.maxDotsByZone) {
            if(dot.color !== 'two'){
                dotSprite = this.spritePool.get('one', dot.isPositive);
            }else{
                dotSprite = this.spritePool.get('two', dot.isPositive);
            }
            container.addChild(dotSprite);
        }else{
            notDisplayed.push(dot);
        }
        return dotSprite;
    }

    removeFromProximityManager(sprite){
        if(sprite.dot.isPositive) {
            this.positiveProximityManager.removeItem(sprite);
        }else{
            this.negativeProximityManager.removeItem(sprite);
        }
    }

    getANotDisplayedDot(isPositive){
        if(isPositive) {
            return this.positiveDotNotDisplayed.pop();
        }else{
            return this.negativeDotNotDisplayed.pop();
        }
    }

    removeDotFromArray(dot, isPositive){
        if(isPositive){
            this.positiveDots.splice(this.positiveDots.indexOf(dot), 1);
        }else{
            this.negativeDots.splice(this.negativeDots.indexOf(dot), 1);
        }
        this.dotPool.dispose(dot);
    }

    addDotToArray(dot, isPositive){
        if(isPositive){
            this.positiveDots.push(dot);
        }else{
            this.negativeDots.push(dot);
        }
    }

    removeDotsIfNeeded(storeArray){
        let removedDots = [];
        removedDots.concat(this.removeDotsFromArray(this.positiveDots, storeArray));
        removedDots.concat(this.removeDotsFromArray(this.positiveDotNotDisplayed, storeArray));
        removedDots.concat(this.removeDotsFromArray(this.negativeDots, storeArray));
        removedDots.concat(this.removeDotsFromArray(this.negativeDotNotDisplayed, storeArray));
        return removedDots;
    }

    removeDotsFromArray(localArray, storeArray){
        let removedDots = [];
        let j = localArray.length;
        while(j--){
            let isPresent = false;
            let k = storeArray.length;
            while(k--){
                if(storeArray[k].id === localArray[j].id === true){
                    isPresent = true;
                    break;
                }
            }
            if(isPresent === false && localArray[j] != undefined) {
                let dot = localArray.splice(localArray.indexOf(localArray[j]), 1);
                this.dotPool.dispose(dot);
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
        }
        return removedDots;
    }

    checkIfNotDisplayedSpriteCanBe(){
        let addedDots = [];
        addedDots.concat(this.displayHiddenDots(this.positiveDotNotDisplayed, this.positiveDotsContainer));
        addedDots.concat(this.displayHiddenDots(this.negativeDotNotDisplayed, this.negativeDotsContainer));
        return addedDots;
    }

    displayHiddenDots(notShowedArray, container){
        let addedDots = [];
        while(notShowedArray.length > 0 && container.children.length < this.maxDotsByZone){
            let dot = notShowedArray.pop();
            let dotSprite;
            if(dot.color !== 'two'){
                dotSprite = this.spritePool.get('one', true);
            }else{
                dotSprite = this.spritePool.get('two', true);
            }
            dot.sprite = dotSprite;
            dotSprite.dot = dot;
            addedDots.push(dot);
            container.addChild(dotSprite);
        }
        return addedDots;
    }

    addDotsFromStateChange(storePositiveDotsArray, storeNegaitiveDotsArray) {
        console.log('addDotsFromStateChange', this.zonePosition, storePositiveDotsArray);
        let addedDots = [];
        addedDots.concat(this.doAddDotsFromStateChange(storePositiveDotsArray, this.positiveDots));
        addedDots.concat(this.doAddDotsFromStateChange(storeNegaitiveDotsArray, this.negativeDots));
    }

    doAddDotsFromStateChange(storeArray, localArray){
        let addedDots = [];
        storeArray.forEach((dot) => {
            var identicalDot = false;
            for (let i = 0; i < localArray.length; i++) {
                if (localArray[i].id === dot.id) {
                    identicalDot = true;
                    break;
                }
            }
            if (identicalDot === false) {
                addedDots.push(dot);
                this.addDot(dot);
            }
        });
        return addedDots;
    }

    checkPositiveNegativePresence(){
        if(this.negativePresent && this.base[1] != BASE.BASE_X){
            if(this.positiveDots.length > 0 && this.negativeDots.length > 0) {
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

    checkOvercrowding(){
        let dotOverload = false;
        if(this.positiveDots.length > this.base[1]-1) {
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
            if (this.negativeDots.length > this.base[1] - 1) {
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
        /*if (this.state.negativePresent && dotOverload === false){
            if(this.positiveDots.length > 0 && this.negativeDots.length > 0) {
                let tween = TweenMax.fromTo(this.state.allZones[i], 0.3,
                    {x: this.state.allZones[i].x - 1}, {
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
                TweenMax.killTweensOf(this.state.allZones[i]);
            }
        }*/
    }

    setValueText(text){
        console.log('setValueText', text);
        this.placeValueText.text = text;
    }

    setValueTextAlpha(alpha){
        this.placeValueText.alpha = alpha;
    }
}
