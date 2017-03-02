import React, {Component, PropTypes} from 'react';
import {isPointInRectangle, randomFromTo, convertBase, findQuadrant} from '../../utils/MathUtils'
import { TweenMax, RoughEase, Linear} from "gsap";
import {Point} from 'pixi.js';
import {BASE, OPERATOR_MODE, USAGE_MODE, SETTINGS, POSITION_INFO} from '../../Constants'

class CanvasPIXI extends Component {

    boxWidth = 160;
    boxHeight = 242;
    halfBoxHeight = 115;

    static propTypes = {
        addDot: PropTypes.func.isRequired,
        addMultipleDots: PropTypes.func.isRequired,
        rezoneDot: PropTypes.func.isRequired,
        removeDot: PropTypes.func.isRequired,
        removeMultipleDots: PropTypes.func.isRequired,
        activateMagicWand: PropTypes.func.isRequired,
        activityStarted: PropTypes.func.isRequired,
        positivePowerZoneDots: PropTypes.arrayOf(React.PropTypes.arrayOf(React.PropTypes.shape({
            x: PropTypes.number.isRequired,
            y: PropTypes.number.isRequired,
            powerZone: PropTypes.number.isRequired,
            id: PropTypes.string.isRequired,
            isPositive: PropTypes.bool.isRequired,
        }))).isRequired,
        negativePowerZoneDots: PropTypes.arrayOf(React.PropTypes.arrayOf(React.PropTypes.shape({
            x: PropTypes.number.isRequired,
            y: PropTypes.number.isRequired,
            powerZone: PropTypes.number.isRequired,
            id: PropTypes.string.isRequired,
            isPositive: PropTypes.bool.isRequired,
        }))).isRequired,
        base: PropTypes.array.isRequired,
        operator_mode: PropTypes.oneOf([OPERATOR_MODE.DISPLAY, OPERATOR_MODE.ADDITION, OPERATOR_MODE.SUBTRACT, OPERATOR_MODE.MULTIPLY, OPERATOR_MODE.DIVIDE]).isRequired,
        usage_mode: PropTypes.oneOf([USAGE_MODE.FREEPLAY, USAGE_MODE.OPERATION, USAGE_MODE.EXERCISE]),
        placeValueOn: PropTypes.bool.isRequired,
        cdnBaseUrl: PropTypes.string.isRequired,
        numZone: PropTypes.number.isRequired,
        maxViewableDots: PropTypes.number.isRequired,
        magicWandIsActive: PropTypes.bool.isRequired,
        startActivity: PropTypes.bool.isRequired,
        operandA: PropTypes.string.isRequired,
        operandB: PropTypes.string.isRequired,
    };

    constructor(props){
        super(props);
        this.state = {};
        this.state.maxX = SETTINGS.GAME_WIDTH;
        this.state.minX = 0;
        this.state.maxY = SETTINGS.GAME_HEIGHT;
        this.state.minY = 0;
        this.state.isWebGL = false;
        this.state.allZones = [];
        this.state.localPositiveDotsPerZone = [];
        this.state.localNegativeDotsPerZone = [];
        this.state.positiveValueText = [];
        this.state.negativeValueText = [];
        this.state.divisionValueText = [];
        this.state.divisionNegativeValueText = [];
        this.state.placeValueText = [];
        this.state.positivePowerZone = [];
        this.state.positivePowerZoneDotNotDisplayed = [];
        this.state.negativePowerZone = [];
        this.state.negativePowerZoneDotNotDisplayed = [];
        this.state.numOfZone = 0;
        this.state.isInteractive = true;
        this.state.negativePresent = (props.operator_mode == OPERATOR_MODE.SUBTRACT || props.operator_mode == OPERATOR_MODE.DIVIDE || props.base[1] === BASE.BASE_X);
        this.state.maxDotsByZone = this.state.negativePresent ? 75 : 150;

        for(let i = 0; i < this.props.numZone; i++){
            this.state.localPositiveDotsPerZone.push([]);
            this.state.localNegativeDotsPerZone.push([]);
            this.state.positivePowerZoneDotNotDisplayed.push([]);
            this.state.negativePowerZoneDotNotDisplayed.push([]);
        }

        // to accomodate for pixel padding in TexturePacker
        PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;

        let loader = new PIXI.loaders.Loader(props.cdnBaseUrl);
        if (window.devicePixelRatio >= 4) {
            loader.add("machineAssets", "/images/machine@4x.json");
        } else if (window.devicePixelRatio >= 3) {
            loader.add("machineAssets", "/images/machine@3x.json");
        } else if (window.devicePixelRatio >= 2) {
            loader.add("machineAssets", "/images/machine@2x.json");
        } else {
            loader.add("machineAssets", "/images/machine@1x.json");
        }
        loader.once('complete', this.onAssetsLoaded.bind(this));
        loader.once('error', this.onAssetsError.bind(this));
        loader.load();
    }

    componentDidMount(){
        //console.log('componentDidMount', this.state, this.props);

        var options = {
            view: this.canvas,
            transparent: true,
            antialias: true,
            preserveDrawingBuffer: false,
            resolution: window.devicePixelRatio,
            autoResize: true
        };

        let preventWebGL = false;
        this.state.app = new PIXI.Application(SETTINGS.GAME_WIDTH, SETTINGS.GAME_HEIGHT, options, preventWebGL);
        this.state.stage = this.state.app.stage;
        this.state.renderer = this.state.app.renderer;
        this.state.container = new PIXI.Container();
        this.state.stage.addChild(this.state.container);

        this.state.movingDotsContainer = new PIXI.Container();
        this.state.movingDotsContainer.x = 100;
        this.state.movingDotsContainer.y = 100;
        this.state.movingDotsContainer.height = SETTINGS.GAME_HEIGHT - 200;
        this.state.movingDotsContainer.width = SETTINGS.GAME_WIDTH - 200;
        this.state.stage.addChild(this.state.movingDotsContainer);

        this.state.isWebGL = this.state.renderer instanceof PIXI.WebGLRenderer;

        requestAnimationFrame(this.animationCallback.bind(this));
        window.addEventListener('resize', this.resize.bind(this));
    }

    onAssetsError(loader){
        console.log('onAssetsError', loader.onStart);
        loader.onStart = null;
    }

    onAssetsLoaded(loader){
        if(loader.resources.machineAssets.error === null) {
            this.state.textures = loader.resources.machineAssets.textures;
            this.createZones();
            this.props.positivePowerZoneDots.forEach((dotsInZone) => {
                dotsInZone.forEach((dot) =>{
                    this.addDotToZone(dot)
                });
            });
            this.props.negativePowerZoneDots.forEach((dotsInZone) => {
                dotsInZone.forEach((dot) =>{
                    this.addDotToZone(dot)
                });
            });
            this.setZoneTextAndAlphaStatus();
        }
    }

    createZones() {
        for(let i = this.props.numZone - 1; i >= 0; i--){
            this.createPowerZone(i);
        }
        this.resize();
    }

    createPowerZone(position) {
        let container = new PIXI.Container();
        let textures = this.state.textures;
        let boxYPos = 70;
        let gutterWidth = 23;
        /*let boxWidth = 160;
        let boxHeight = 242;
        let halfBoxHeight = 115;*/
        let leftGutter = 66;
        let dotsCounter = new PIXI.Sprite(textures["dot_value.png"]);
        dotsCounter.anchor.x = 0.5;
        dotsCounter.x = (position * (this.boxWidth + gutterWidth)) + (this.boxWidth / 2) + 3;
        dotsCounter.y = 0;
        container.addChild(dotsCounter);

        let dotsCounterText = new PIXI.Text(position, {
            fontFamily: 'museo-slab',
            fontSize: 22,
            fill: 0x6D6D6D,
            align: 'center',
        });
        dotsCounterText.anchor.x = 0.5;
        dotsCounterText.x = (position * (this.boxWidth + gutterWidth)) + (this.boxWidth / 2);
        dotsCounterText.y = 45;
        dotsCounterText.text = '';
        container.addChild(dotsCounterText);
        this.state.positiveValueText.push(dotsCounterText);

        if (this.state.negativePresent) {

            let dotsCounterNegative = new PIXI.Sprite(textures["antidot_value.png"]);
            dotsCounterNegative.anchor.x = 0.5;
            dotsCounterNegative.x = (position * (this.boxWidth + gutterWidth)) + (this.boxWidth / 2) + 5;
            dotsCounterNegative.y = this.boxHeight + 20;
            container.addChild(dotsCounterNegative);

            let dotsCounterText = new PIXI.Text(position, {
                fontFamily: 'museo-slab',
                fontSize: 22,
                fill: 0xFFFFFF,
                align: 'center'
            });
            dotsCounterText.anchor.x = 0.5;
            dotsCounterText.x = (position * (this.boxWidth + gutterWidth)) + (this.boxWidth / 2);
            dotsCounterText.y = this.boxHeight + 70;
            dotsCounterText.text = '1';
            container.addChild(dotsCounterText);
            this.state.negativeValueText.push(dotsCounterText);
        }

        let bgBox = new PIXI.Sprite(textures["box.png"]);
        bgBox.x = position * (this.boxWidth + gutterWidth);
        bgBox.y = boxYPos;
        container.addChild(bgBox);

        if (this.props.base[1] === 'x') {
            var placeValueText = new PIXI.Text('X' + (this.state.numOfZone), {
                fontFamily: 'museo-slab',
                fontSize: 40,
                fill: 0xBCBCBC,
                align: 'center'
            });
        } else {
            let text;
            if(this.props.base[0] === 1 || this.state.numOfZone === 0) {
                text = String(Math.pow(this.props.base[1], this.state.numOfZone));
            }else{
                text = '(' + String(Math.pow(this.props.base[1], this.state.numOfZone) + '/' + Math.pow(this.props.base[0], this.state.numOfZone)) + ')';
            }
            var placeValueText = new PIXI.Text(text, {
                fontFamily: 'museo-slab',
                fontSize: 40,
                fill: 0xBCBCBC,
                align: 'center'
            });

        }
        //placeValueText.scale.x = placeValueText.scale.y = 0.5;
        placeValueText.anchor.x = 0.5;
        placeValueText.x = (position * (this.boxWidth + gutterWidth)) + (this.boxWidth / 2);
        placeValueText.y = boxYPos + (this.boxHeight / 2) - 30;
        container.addChild(placeValueText);
        this.state.placeValueText.push(placeValueText);

        this.state.placeValueText.forEach((text) => {
            text.alpha = this.props.placeValueOn ? 1 : 0;
        });

        if (this.state.negativePresent) {
            let separator = new PIXI.Sprite(textures['separator.png']);
            separator.x = (position * (this.boxWidth + gutterWidth)) + 5;
            separator.y = boxYPos + (this.boxHeight / 2) - 5;
            container.addChild(separator);

            let dotsContainerPositive = new PIXI.Container();
            dotsContainerPositive.x = position * (this.boxWidth + gutterWidth);
            dotsContainerPositive.y = boxYPos;
            this.state.positivePowerZone.push(dotsContainerPositive);
            container.addChild(dotsContainerPositive);
            dotsContainerPositive.interactive = true;

            dotsContainerPositive.hitArea = new PIXI.Rectangle(0, 0, this.boxWidth, this.halfBoxHeight);
            dotsContainerPositive.powerZone = this.props.numZone - position - 1;
            dotsContainerPositive.isPositive = true;
            if(this.props.usage_mode === USAGE_MODE.FREEPLAY) {
                dotsContainerPositive.buttonMode = true;
                dotsContainerPositive.on('pointerup', this.createDot.bind(this));
            }

            let dotsContainerNegative = new PIXI.Container();
            dotsContainerNegative.x = position * (this.boxWidth + gutterWidth);
            dotsContainerNegative.y = boxYPos + this.halfBoxHeight;
            this.state.negativePowerZone.push(dotsContainerNegative);
            container.addChild(dotsContainerNegative);
            dotsContainerNegative.interactive = true;

            dotsContainerNegative.hitArea = new PIXI.Rectangle(-0, 0, this.boxWidth, this.halfBoxHeight);
            dotsContainerNegative.powerZone = this.props.numZone - position - 1;
            dotsContainerNegative.isPositive = false;
            if(this.props.usage_mode === USAGE_MODE.FREEPLAY) {
                dotsContainerNegative.buttonMode = true;
                dotsContainerNegative.on('pointerup', this.createDot.bind(this));
            }
        }else{
            let dotsContainer = new PIXI.Container();
            dotsContainer.x = position * (this.boxWidth + gutterWidth);
            dotsContainer.y = boxYPos;
            this.state.positivePowerZone.push(dotsContainer);
            container.addChild(dotsContainer);
            dotsContainer.interactive = true;

            dotsContainer.hitArea = new PIXI.Rectangle(0, 0, this.boxWidth, this.boxHeight);
            dotsContainer.powerZone = this.props.numZone - position - 1;
            dotsContainer.isPositive = true;
            if(this.props.usage_mode === USAGE_MODE.FREEPLAY) {
                dotsContainer.buttonMode = true;
                dotsContainer.on('pointerup', this.createDot.bind(this));
            }
        }

        if(this.props.operator_mode === OPERATOR_MODE.DIVIDE) {
            let dividerCounter = new PIXI.Sprite(textures["dot_div_value.png"]);
            dividerCounter.x = (position * (this.boxWidth + gutterWidth)) + this.boxWidth - dividerCounter.width;
            dividerCounter.y = boxYPos;
            container.addChild(dividerCounter);

            let dividerValueText = new PIXI.Text('1',{fontFamily : 'museo-slab', fontSize: 16, fill : 0x565656, align : 'center'});
            dividerValueText.anchor.x = 0.5;
            dividerValueText.x = (position * (this.boxWidth + gutterWidth)) + this.boxWidth - (dividerCounter.width / 2);
            dividerValueText.y = boxYPos + 3;
            container.addChild(dividerValueText);
            this.state.divisionValueText.push(dividerValueText);

            if(this.props.operator_mode === OPERATOR_MODE.DIVIDE && this.props.base[1] === BASE.BASE_X) {
                let negativeDividerCounter = new PIXI.Sprite(textures["antidot_div_value.png"]);
                negativeDividerCounter.x = (position * (this.boxWidth + gutterWidth));
                negativeDividerCounter.y = this.boxHeight + boxYPos - negativeDividerCounter.height - 10;
                container.addChild(negativeDividerCounter);

                let dividerNegativeValueText = new PIXI.Text('1',{fontFamily : 'museo-slab', fontSize: 16, fill : 0x565656, align : 'center'});
                dividerNegativeValueText.anchor.x = 0.5;
                dividerNegativeValueText.x = (position * (this.boxWidth + gutterWidth)) + 15;
                dividerNegativeValueText.y = negativeDividerCounter.y + 15;
                container.addChild(dividerNegativeValueText);
                this.state.divisionNegativeValueText.push(dividerNegativeValueText);
            }
        }
        container.x += leftGutter;
        this.state.container.addChild(container);
        this.state.allZones.push(container);
        this.state.numOfZone++;
    }

    setZoneTextAndAlphaStatus(){
        // Don't display leading zeroes
        //console.log('setZoneTextAndAlphaStatus', this.state.localPositiveDotsPerZone.length);
        let positiveZoneAreEmpty = [];
        let negativeZoneAreEmpty = [];
        for(let i = 0; i < this.props.numZone; ++i) {
            positiveZoneAreEmpty.push(false);
            negativeZoneAreEmpty.push(false);
        }
        for(let i = 0; i < this.state.localPositiveDotsPerZone.length; i++){
            let zoneDotCount = this.state.localPositiveDotsPerZone[i].length;
            if(zoneDotCount !== 0){
                if(this.props.base[1] !== 12) {
                    this.state.positiveValueText[i].text = zoneDotCount;
                }else{
                    this.state.positiveValueText[i].text = convertBase(zoneDotCount.toString(), 10, 12);
                }
            }else{
                for(let j = i; j < this.props.numZone; ++j){
                    if (this.state.localPositiveDotsPerZone[j].length !== 0) {
                        this.state.positiveValueText[i].text = '0';
                        positiveZoneAreEmpty[i] = false;
                        break;
                    }else{
                        if(i != 0) {
                            this.state.positiveValueText[i].text = '';
                            positiveZoneAreEmpty[i] = true;
                        }else{
                            this.state.positiveValueText[i].text = '0';
                        }
                    }
                }

            }
        }

        for(let i = 0; i < this.state.localNegativeDotsPerZone.length; i++){
            let zoneDotCount = this.state.localNegativeDotsPerZone[i].length;
            if(zoneDotCount !== 0){
                if(this.props.base[1] !== 12) {
                    this.state.negativeValueText[i].text = zoneDotCount;
                }else{
                    this.state.negativeValueText[i].text = convertBase(zoneDotCount.toString(), 10, 12);
                }
            }else if(this.state.negativePresent){
                for(let j = i; j < this.props.numZone; ++j){
                    if (this.state.localNegativeDotsPerZone[j].length !== 0) {
                        this.state.negativeValueText[i].text = '0';
                        negativeZoneAreEmpty[i] = false;
                        break;
                    }else{
                        if(i != 0) {
                            this.state.negativeValueText[i].text = '';
                            negativeZoneAreEmpty[i] = true;
                        }else{
                            this.state.negativeValueText[i].text = '0';
                        }
                    }
                }
            }
        }
        var filter = new PIXI.filters.ColorMatrixFilter();
        /*var colorMatrix =  [
            1,0,0,-0.3,
            0,1,0,-0.3,
            0,0,1,-0.3,
            0,0,0,1
        ];
        filter.matrix = colorMatrix;*/
        filter.greyscale(0.3, true);
        for(let i = 0; i < this.props.numZone; ++i) {
            if(positiveZoneAreEmpty[i] === true && (this.state.negativePresent === false || negativeZoneAreEmpty[i] === true)){
                this.state.allZones[i].filters = [filter];
            }else{
                this.state.allZones[i].filters = null;

            }
        }
    }

    createDot(e){
        let hitArea = e.data.target.hitArea;
        let clickPos = e.data.getLocalPosition(e.data.target);
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

        if(this.state.isInteractive) {
            this.props.addDot(e.data.target.powerZone, clickModifiedPos, e.data.target.isPositive);
        }
    }

    addDotToZone(dot){
        //console.log('addDotToZone', new Date().getTime());
        let dotSprite;
        if(dot.isPositive) {
            //dotSprite = new PIXI.Sprite(this.state.textures["inactive_dot.png"]);
            if(this.state.positivePowerZone[dot.powerZone].children.length < this.state.maxDotsByZone) {
                dotSprite = new PIXI.Sprite(this.state.textures["inactive_dot.png"]);
                this.state.positivePowerZone[dot.powerZone].addChild(dotSprite);
            }else{
                this.state.positivePowerZoneDotNotDisplayed[dot.powerZone].push(dot);
            }
            this.state.localPositiveDotsPerZone[dot.powerZone].push(dot);
        }else{
            if(this.state.negativePowerZone[dot.powerZone].children.length < this.state.maxDotsByZone) {
                dotSprite = new PIXI.Sprite(this.state.textures["inactive_antidot.png"]);
                this.state.negativePowerZone[dot.powerZone].addChild(dotSprite);
            }else{
                this.state.negativePowerZoneDotNotDisplayed[dot.powerZone].push(dot);
            }
            this.state.localNegativeDotsPerZone[dot.powerZone].push(dot);
        }
        if(dotSprite) {
            this.addDotSpriteProperty(dot, dotSprite);
        }
    }

    addDotSpriteProperty(dot, dotSprite){
        dotSprite.anchor.set(0.5);
        dotSprite.x = dot.x;
        dotSprite.y = dot.y;
        dot.sprite = dotSprite;
        dotSprite.dot = dot;
        dotSprite.interactive = true;
        dotSprite.buttonMode = true;
        dotSprite.world = this;
        dotSprite.on('pointerdown', this.onDragStart);
        dotSprite.on('pointerup', this.onDragEnd);
        dotSprite.on('pointerupoutside', this.onDragEnd);
        dotSprite.on('mousemove', this.onDragMove);
        dotSprite.alpha = 0;
        TweenMax.to(dotSprite, 1, {alpha: 1});
    }

    onDragStart(e, canvas){
        if(this.world.state.isInteractive) {
            let oldParent = this.parent;
            this.origin = new Point(this.x, this.y);
            this.data = e.data;
            this.dragging = true;
            this.world.state.movingDotsContainer.addChild(this);
            var newPosition = this.data.getLocalPosition(this.parent);
            let originDiff = this.data.getLocalPosition(oldParent);
            this.originInMovingContainer = newPosition;
            this.originInMovingContainer.x += this.origin.x - originDiff.x;
            this.originInMovingContainer.y += this.origin.y - originDiff.y;
            this.position.x = newPosition.x;
            this.position.y = newPosition.y;
        }
    }

    onDragMove(e){
        if(this.world.state.isInteractive) {
            if (this.dragging) {
                var newPosition = this.data.getLocalPosition(this.parent);
                this.position.x = newPosition.x;
                this.position.y = newPosition.y;
            }
        }
    }

    onDragEnd(e){
        if(this.world.state.isInteractive) {
            this.dragging = false;
            this.data = null;
            this.world.verifyDroppedOnZone(this, e.data);
        }
        e.stopPropagation();
    }

    verifyDroppedOnZone(dotSprite, data){
        //console.log('verifyDroppedOnZone', this.state.localNegativeDotsPerZone);
        let originalZoneIndex = dotSprite.dot.powerZone;
        let droppedOnPowerZone = null;
        let droppedOnPowerZoneIndex = -1;


        this.state.positivePowerZone.forEach(zone =>{
            let dataLocalZone = data.getLocalPosition(zone);
            //console.log(dataLocalZone, zone.hitArea.y, zone.hitArea.height, dataLocalZone.y < zone.hitArea.y + zone.hitArea.height);
            if(isPointInRectangle(dataLocalZone, zone.hitArea)){
                droppedOnPowerZone = zone;
                droppedOnPowerZoneIndex = zone.powerZone;
            }
        });
        this.state.negativePowerZone.forEach(zone =>{
            let dataLocalZone = data.getLocalPosition(zone);
            //console.log(dataLocalZone, zone.hitArea.y, zone.hitArea.height);
            if(isPointInRectangle(dataLocalZone, zone.hitArea)){
                droppedOnPowerZone = zone;
                droppedOnPowerZoneIndex = zone.powerZone;
            }
        });

        //console.log('verifyDroppedOnZone', droppedOnPowerZoneIndex, droppedOnPowerZone);
        if(droppedOnPowerZoneIndex !== -1 && droppedOnPowerZone !== null) {
            // has not been dropped outside a zone
            if (droppedOnPowerZoneIndex !== originalZoneIndex) {
                // impossible to move between powerZone AND signed zone
                // impossible to move between powerZone in base X
                if(droppedOnPowerZone.isPositive === dotSprite.dot.isPositive && this.props.base[1] != 'x') {

                    let diffZone = originalZoneIndex - droppedOnPowerZoneIndex;
                    let dotsToRemoveCount = 1;
                    //console.log(originalZoneIndex, droppedOnPowerZoneIndex, diffZone);
                    if (diffZone < 0) {
                        dotsToRemoveCount = Math.pow(this.props.base[1], diffZone * -1);
                    }else{
                        dotsToRemoveCount = this.props.base[0];
                    }
                    //console.log('dotsToRemoveCount', dotsToRemoveCount);
                    //check if possible
                    let finalNbOfDots = -1;
                    if(dotSprite.dot.isPositive) {
                        finalNbOfDots = this.state.localPositiveDotsPerZone[originalZoneIndex].length - dotsToRemoveCount;
                    }else{
                        finalNbOfDots = this.state.localNegativeDotsPerZone[originalZoneIndex].length - dotsToRemoveCount;
                    }
                    //console.log('finalNbOfDots', finalNbOfDots);
                    if (finalNbOfDots < 0 || this.props.base[0] > 1 && Math.abs(diffZone) > 1) {
                        if(finalNbOfDots < 0) {
                            alert("Pas assez de points disponibles pour cette opération");
                        }else if(this.props.base[0] > 1 && Math.abs(diffZone) > 1){
                            alert("Une case à la fois pour les base avec un dénominateur autre que 1");
                        }
                        if (dotSprite.dot.isPositive) {
                            this.backIntoPlace(dotSprite, this.state.positivePowerZone[originalZoneIndex]);
                        } else {
                            this.backIntoPlace(dotSprite, this.state.negativePowerZone[originalZoneIndex]);
                        }
                        return false;
                    }

                    // rezone current dot and thus remove it from the amount to be moved
                    this.addDraggedToNewZone(dotSprite, droppedOnPowerZone, data.getLocalPosition(droppedOnPowerZone), false);
                    dotsToRemoveCount--;

                    //console.log('dotsToRemoveCount', dotsToRemoveCount);
                    // animate zone movement and destroy
                    let dataLocalZone = data.getLocalPosition(droppedOnPowerZone);
                    this.tweenDotsToNewZone(originalZoneIndex, droppedOnPowerZone, dotsToRemoveCount, dataLocalZone);

                    //Add the new dots
                    let dotsPos = [];
                    let newNbOfDots = Math.pow(this.props.base[1], diffZone);
                    newNbOfDots -= this.props.base[0];
                    //console.log('newNbOfDots', newNbOfDots, diffZone);
                    for (let i = 0; i < newNbOfDots; i++) {
                        dotsPos.push({
                            x: randomFromTo(POSITION_INFO.DOT_RAYON, droppedOnPowerZone.hitArea.width - POSITION_INFO.DOT_RAYON),
                            y: randomFromTo(POSITION_INFO.DOT_RAYON, droppedOnPowerZone.hitArea.height - POSITION_INFO.DOT_RAYON - POSITION_INFO.BOX_BOTTOM_GREY_ZONE)
                        })
                    }
                    if (droppedOnPowerZone) {
                        this.props.addMultipleDots(droppedOnPowerZoneIndex, dotsPos, dotSprite.dot.isPositive, false);
                    }

                } else {
                    if (dotSprite.dot.isPositive) {
                        this.backIntoPlace(dotSprite, this.state.positivePowerZone[originalZoneIndex]);
                    } else {
                        this.backIntoPlace(dotSprite, this.state.negativePowerZone[originalZoneIndex]);
                    }
                }
            }else{
                if(dotSprite.dot.isPositive === droppedOnPowerZone.isPositive) {
                    // just mode the dots into the zone
                    droppedOnPowerZone.addChild(dotSprite);
                    let newPosition = data.getLocalPosition(droppedOnPowerZone);
                    dotSprite.position.x = newPosition.x;
                    dotSprite.position.y = newPosition.y;
                }else{
                    // check it possible dot / anti dot destruction
                    console.log('drop in opposite sign zone');
                }
            }
        }else{
            if(this.props.usage_mode == USAGE_MODE.FREEPLAY) {
                this.props.removeDot(originalZoneIndex, dotSprite.dot.id);
            }else{
                if (dotSprite.dot.isPositive) {
                    this.backIntoPlace(dotSprite, this.state.positivePowerZone[originalZoneIndex]);
                } else {
                    this.backIntoPlace(dotSprite, this.state.negativePowerZone[originalZoneIndex]);
                }
            }
        }
    }

    backIntoPlace(dotSprite, currentZone){
        this.state.isInteractive = false;
        TweenMax.to(dotSprite, 1, {x:dotSprite.originInMovingContainer.x, y:dotSprite.originInMovingContainer.y, onComplete: this.backIntoPlaceDone.bind(this), onCompleteParams:[dotSprite, currentZone]});
    }

    backIntoPlaceDone(dotSprite, currentZone, isAllDone){
        currentZone.addChild(dotSprite);
        dotSprite.position = dotSprite.origin;
        this.state.isInteractive = true;
    }

    addDraggedToNewZone(dotSprite, newZone, positionToBeMovedTo, updateValue){
        //console.log('addDraggedToNewZone', newZone.powerZone);
        newZone.addChild(dotSprite);
        dotSprite.position.x = positionToBeMovedTo.x;
        dotSprite.position.y = positionToBeMovedTo.y;
        if(dotSprite.dot.isPositive) {
            this.state.localPositiveDotsPerZone[dotSprite.dot.powerZone].splice(this.state.localPositiveDotsPerZone[dotSprite.dot.powerZone].indexOf(dotSprite.dot), 1);
            this.state.localPositiveDotsPerZone[newZone.powerZone].push(dotSprite.dot);
        }else{
            this.state.localNegativeDotsPerZone[dotSprite.dot.powerZone].splice(this.state.localNegativeDotsPerZone[dotSprite.dot.powerZone].indexOf(dotSprite.dot), 1);
            this.state.localNegativeDotsPerZone[newZone.powerZone].push(dotSprite.dot);
        }
        this.props.rezoneDot(newZone.powerZone, dotSprite.dot, updateValue);
    }

    tweenDotsToNewZone(originalZoneIndex, droppedOnPowerZone, dotsToRemove, positionToBeMovedTo){
        //this.state.isInteractive = false;
        //console.log('tweenDotsToNewZone', positionToBeMovedTo);
        if (droppedOnPowerZone.isPositive) {
            var zone = this.state.positivePowerZone[originalZoneIndex];
        } else {
            var zone = this.state.negativePowerZone[originalZoneIndex];
        }
        //  For 2 > 3 base.
        if(this.props.base[0] > 1){
            dotsToRemove -= (this.props.base[0] - 1);
            let dotsToRezone = this.props.base[0] - 1;
            for(let i=0; i < dotsToRezone; i++) {
                let dotSprite = zone.getChildAt(0);
                dotSprite.origin = new Point();
                dotSprite.origin.copy(dotSprite.position);
                var newPosition = this.state.movingDotsContainer.toLocal(dotSprite.position, dotSprite.parent);
                let adjacentPosition = positionToBeMovedTo.clone();
                let quadrant = findQuadrant(adjacentPosition, droppedOnPowerZone.hitArea);
                switch(quadrant){
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
                }
                var finalPosition = this.state.movingDotsContainer.toLocal(adjacentPosition, droppedOnPowerZone);
                this.state.movingDotsContainer.addChild(dotSprite);
                dotSprite.position.x = newPosition.x;
                dotSprite.position.y = newPosition.y;
                TweenMax.to(dotSprite, 0.5, {
                    x: finalPosition.x,
                    y: finalPosition.y,
                    onComplete: this.addDraggedToNewZone.bind(this),
                    onCompleteParams: [dotSprite, droppedOnPowerZone, adjacentPosition, true]
                });
            }
        }
        let allRemovedDots = [];
        for(let i=0; i < dotsToRemove; i++){
            let dotSprite = zone.getChildAt(0);
            allRemovedDots.push(dotSprite.dot);
            dotSprite.off('pointerdown', this.onDragStart);
            dotSprite.off('pointerup', this.onDragEnd);
            dotSprite.off('pointerupoutside', this.onDragEnd);
            dotSprite.off('mousemove', this.onDragMove);
            dotSprite.origin = new Point();
            dotSprite.origin.copy(dotSprite.position);
            var newPosition = this.state.movingDotsContainer.toLocal(dotSprite.position, dotSprite.parent);
            var finalPosition = this.state.movingDotsContainer.toLocal(positionToBeMovedTo, droppedOnPowerZone);
            this.state.movingDotsContainer.addChild(dotSprite);
            dotSprite.position.x = newPosition.x;
            dotSprite.position.y = newPosition.y;
            if(dotSprite.dot.isPositive) {
                this.state.localPositiveDotsPerZone[dotSprite.dot.powerZone].splice(this.state.localPositiveDotsPerZone[dotSprite.dot.powerZone].indexOf(dotSprite.dot), 1);
            }else{
                this.state.localNegativeDotsPerZone[dotSprite.dot.powerZone].splice(this.state.localNegativeDotsPerZone[dotSprite.dot.powerZone].indexOf(dotSprite.dot), 1);
            }
            TweenMax.to(dotSprite, 0.5, {x:finalPosition.x, y:finalPosition.y, onComplete: this.tweenDotsToNewZoneDone.bind(this), onCompleteParams:[dotSprite]});
        }
        this.props.removeMultipleDots(originalZoneIndex, allRemovedDots, false);
    }

    tweenDotsToNewZoneDone(dotSprite){
        TweenMax.to(dotSprite, 0.3, {alpha:0, onComplete: this.removeTweenDone.bind(this), onCompleteParams:[dotSprite]});
    }

    removeTweenDone(dotSprite){
        dotSprite.parent.removeChild(dotSprite);
        dotSprite.destroy();
    }

    resize(event) {
        const w = window.innerWidth;
        const h = window.innerHeight;
        let ratio = Math.min( w / SETTINGS.GAME_WIDTH, h / SETTINGS.GAME_HEIGHT);
        this.state.stage.scale.x = this.state.stage.scale.y = ratio;
        this.state.renderer.resize(Math.ceil(SETTINGS.GAME_WIDTH * ratio), Math.ceil(SETTINGS.GAME_HEIGHT * ratio));
    };

    animationCallback(...args){
        //this.state.stats.begin();
        this.state.renderer.render(this.state.stage);
        //requestAnimationFrame(this.animationCallback.bind(this));
        //this.state.stats.end();

    }

    shouldComponentUpdate(nextProps){
        //console.log('shouldComponentUpdate', nextProps);
        this.checkBaseChange(nextProps);
        this.props = nextProps;
        this.removeDotsFromStateChange();
        this.addDotsFromStateChange();
        this.checkBase();
        this.setZoneTextAndAlphaStatus();
        this.checkMachineStateValue();
        return false;
    }

    checkBaseChange(nextProps){
        if(this.props.base !==  nextProps.base){
            if (nextProps.placeValueOn){
                if(nextProps.base[1] === BASE.BASE_X){
                    for(let i = 0; i < this.state.placeValueText.length; ++i) {
                        this.state.placeValueText[i].text = 'X' + i;
                    }
                }else {
                    for(let i = 0; i < this.state.placeValueText.length; ++i) {
                        if(nextProps.base[0] === 1 || i === 0) {
                            this.state.placeValueText[i].text = String(Math.pow(nextProps.base[1], i));
                        }else{
                            this.state.placeValueText[i].text = String(Math.pow(nextProps.base[1], i) + '/' + Math.pow(nextProps.base[0], i));
                        }
                    }
                }
            }
        }
    }

    checkMachineStateValue(){
        //console.log('checkMachineStateValue', this.props.placeValueOn);
        this.state.placeValueText.forEach((text) =>{
            text.alpha = this.props.placeValueOn ? 1 : 0;
        });
        if(this.props.magicWandIsActive) {
            //console.log(this.props.positivePowerZoneDots);
            var base = this.props.base[1];
            for(let i = 0; i < this.props.positivePowerZoneDots.length - 1; ++i){
                if(this.props.positivePowerZoneDots[i].length >= base){
                    let removed = this.props.positivePowerZoneDots[i].splice(0, base);
                    this.props.removeMultipleDots(i, removed, false);
                    this.props.addDot(i + 1, [randomFromTo(0, this.boxWidth), randomFromTo(0, this.boxHeight)], true);
                    break;
                }
            }
            this.props.activateMagicWand(false);
        }
        if(this.props.startActivity) {
            if (this.props.operator_mode == OPERATOR_MODE.DISPLAY && this.props.usage_mode == USAGE_MODE.OPERATION) {
                let dotsPerZone = this.props.operandA.split('|');
                dotsPerZone.reverse();
                let dotsPos = [];
                let total = 0; // calculate the total for | operator, then change the operand A
                for (let i = 0; i < dotsPerZone.length; ++i) {
                    total += dotsPerZone[i] * Math.pow(this.props.base[1], i);
                    for (let j = 0; j < Number(dotsPerZone[i]); ++j) {
                        dotsPos.push({
                            x: randomFromTo(POSITION_INFO.DOT_RAYON, this.state.positivePowerZone[0].hitArea.width - POSITION_INFO.DOT_RAYON),
                            y: randomFromTo(POSITION_INFO.DOT_RAYON, this.state.positivePowerZone[0].hitArea.height - POSITION_INFO.DOT_RAYON - POSITION_INFO.BOX_BOTTOM_GREY_ZONE),
                            zoneId: i,
                            isPositive: true
                        })
                    }
                }
                this.props.activityStarted(dotsPos, total);
            }else if(this.props.usage_mode == USAGE_MODE.OPERATION) {
                let dotsPos = [];
                let totalDot;
                switch (this.props.operator_mode) {
                    case OPERATOR_MODE.ADDITION:
                        totalDot = Number(this.props.operandA) + Number(this.props.operandB);
                        for (let i = 0; i < totalDot; ++i) {
                            dotsPos.push({
                                x: randomFromTo(POSITION_INFO.DOT_RAYON, this.state.positivePowerZone[0].hitArea.width - POSITION_INFO.DOT_RAYON),
                                y: randomFromTo(POSITION_INFO.DOT_RAYON, this.state.positivePowerZone[0].hitArea.height - POSITION_INFO.DOT_RAYON - POSITION_INFO.BOX_BOTTOM_GREY_ZONE),
                                zoneId: 0,
                                isPositive: true
                            })
                        }
                        this.props.activityStarted(dotsPos);
                        break;
                    case OPERATOR_MODE.MULTIPLY:
                        totalDot = Number(this.props.operandA) * Number(this.props.operandB);
                        for (let i = 0; i < totalDot; ++i) {
                            dotsPos.push({
                                x: randomFromTo(POSITION_INFO.DOT_RAYON, this.state.positivePowerZone[0].hitArea.width - POSITION_INFO.DOT_RAYON),
                                y: randomFromTo(POSITION_INFO.DOT_RAYON, this.state.positivePowerZone[0].hitArea.height - POSITION_INFO.DOT_RAYON - POSITION_INFO.BOX_BOTTOM_GREY_ZONE),
                                zoneId: 0,
                                isPositive: true
                            })
                        }
                        this.props.activityStarted(dotsPos);
                        break;
                    case OPERATOR_MODE.SUBTRACT:
                        totalDot = Number(this.props.operandA) - Number(this.props.operandB);
                        for (let i = 0; i < totalDot; ++i) {
                            dotsPos.push({
                                x: randomFromTo(POSITION_INFO.DOT_RAYON, this.state.positivePowerZone[0].hitArea.width - POSITION_INFO.DOT_RAYON),
                                y: randomFromTo(POSITION_INFO.DOT_RAYON, this.state.positivePowerZone[0].hitArea.height - POSITION_INFO.DOT_RAYON - POSITION_INFO.BOX_BOTTOM_GREY_ZONE),
                                zoneId: 0,
                                isPositive: true
                            })
                        }
                        this.props.activityStarted(dotsPos);
                        break;
                    case OPERATOR_MODE.DIVIDE:

                        break;
                }
            }
        }
    }

    removeDotsFromStateChange(){
        for(let i = 0; i < this.state.localPositiveDotsPerZone.length; i++){
            if(this.state.localPositiveDotsPerZone[i].length > 0) {
                let j = this.state.localPositiveDotsPerZone[i].length;
                while(j--){
                    let isPresent = false;
                    let k = this.props.positivePowerZoneDots[i].length;
                    while(k--){
                        if(this.props.positivePowerZoneDots[i][k].id === this.state.localPositiveDotsPerZone[i][j].id === true){
                            isPresent = true;
                            break;
                        }
                    }
                    k = this.state.positivePowerZoneDotNotDisplayed[i].length;
                    while(k--){
                        if(this.state.positivePowerZoneDotNotDisplayed[i][k].id === this.state.localPositiveDotsPerZone[i][j].id === true){
                            this.state.positivePowerZoneDotNotDisplayed[i].splice(k, 1);
                            break;
                        }
                    }
                    if(isPresent === false) {
                        this.removeCircleFromZone(this.state.localPositiveDotsPerZone[i][j]);
                        this.state.localPositiveDotsPerZone[i].splice(this.state.localPositiveDotsPerZone[i].indexOf(this.state.localPositiveDotsPerZone[i][j]), 1);
                    }
                }
            }
        }
        for(let i = 0; i < this.state.negativePowerZone.length; i++){
            if(this.state.negativePowerZone[i].length > 0) {
                let j = this.state.negativePowerZone[i].length;
                while(j--){
                    let isPresent = false;
                    let k = this.props.negativePowerZoneDots[i].length;
                    while(k--){
                        if(this.props.negativePowerZoneDots[i][k].id === this.state.localNegativeDotsPerZone[i][j].id === true){
                            isPresent = true;
                            break;
                        }
                    }
                    k = this.state.negativePowerZoneDotNotDisplayed[i].length;
                    while(k--){
                        if(this.state.negativePowerZoneDotNotDisplayed[i][k].id === this.state.localNegativeDotsPerZone[i][j].id === true){
                            this.state.negativePowerZoneDotNotDisplayed[i].splice(k, 1);
                            break;
                        }
                    }
                     if(isPresent === false) {
                        this.removeCircleFromZone(this.state.negativePowerZone[i][j]);
                        this.state.negativePowerZone[i].splice(this.state.negativePowerZone[i].indexOf(this.state.negativePowerZone[i][j]), 1);
                    }
                }
            }
        }
        this.checkIfNotDisplayedSpriteCanBe();
    }

    checkIfNotDisplayedSpriteCanBe(){
        for(let i = 0; i < this.state.positivePowerZoneDotNotDisplayed.length; ++i){
            while(this.state.positivePowerZoneDotNotDisplayed[i].length > 0 && this.state.positivePowerZone[i].children.length < this.state.maxDotsByZone){
                let dot = this.state.positivePowerZoneDotNotDisplayed[i].pop();
                let dotSprite = new PIXI.Sprite(this.state.textures["inactive_dot.png"]);
                this.addDotSpriteProperty(dot, dotSprite);
                this.state.positivePowerZone[i].addChild(dotSprite);
            }
        }

        for(let i = 0; i < this.state.negativePowerZoneDotNotDisplayed.length; ++i){
            while(this.state.negativePowerZoneDotNotDisplayed[i].length > 0 && this.state.negativePowerZone[i].children.length < this.state.maxDotsByZone){
                let dot = this.state.negativePowerZoneDotNotDisplayed[i].pop();
                let dotSprite = new PIXI.Sprite(this.state.textures["inactive_antidot.png"]);
                this.addDotSpriteProperty(dot, dotSprite);
                this.state.negativePowerZone[i].addChild(dotSprite);
            }
        }
    }

    removeCircleFromZone(dot){
        if(dot.sprite) {
            let dotSprite = dot.sprite;
            dotSprite.off('pointerdown', this.onDragStart);
            dotSprite.off('pointerup', this.onDragEnd);
            dotSprite.off('pointerupoutside', this.onDragEnd);
            dotSprite.off('mousemove', this.onDragMove);
            dotSprite.parent.removeChild(dotSprite);
            dot.sprite.destroy();
        }
    }

    addDotsFromStateChange(){
        //console.log('addDotsFromStateChange', this.props.positivePowerZoneDots, this.props.negativePowerZoneDots);
        this.props.positivePowerZoneDots.forEach((zone) => {
            if(zone.length > 0) {
                zone.forEach((dot) => {
                    var identicalDot = false;
                    for(let i = 0; i < this.state.localPositiveDotsPerZone[dot.powerZone].length; ++i){
                        if (this.state.localPositiveDotsPerZone[dot.powerZone][i].id === dot.id) {
                            identicalDot = true;
                            break;
                        }
                    }
                    if (identicalDot === false) {
                        this.addDotToZone(dot);
                    }
                });
            }
        });

        this.props.negativePowerZoneDots.forEach((zone) => {
            if(zone.length > 0) {
                zone.forEach((dot) => {
                    var identicalDot = false;
                    for(let i = 0; i < this.state.localNegativeDotsPerZone[dot.powerZone].length; ++i){
                        if (this.state.localNegativeDotsPerZone[dot.powerZone][i].id === dot.id) {
                            identicalDot = true;
                            break;
                        }
                    }
                    if (identicalDot === false) {
                        this.addDotToZone(dot);
                    }
                });
            }
        });
    }

    checkBase() {
        //Annihilations
        if(this.state.negativePresent && this.props.base[1] != BASE.BASE_X){
            for(let i = 0; i < this.state.localPositiveDotsPerZone.length; i++){
                if(this.state.localPositiveDotsPerZone[i].length > 0 && this.state.localNegativeDotsPerZone.length > 0) {
                    let tween = TweenMax.fromTo(this.state.positivePowerZone[i], 0.3, {y:this.state.positivePowerZone[i].y - 1}, {y:"+=1", ease:RoughEase.ease.config({strength:8, points:20, template:Linear.easeNone, randomize:false}) , clearProps:"x"});
                    tween.repeat(-1).yoyo(true).play();
                    let tween2 = TweenMax.fromTo(this.state.negativePowerZone[i], 0.3, {y:this.state.negativePowerZone[i].y - 1}, {y:"+=1", ease:RoughEase.ease.config({strength:8, points:20, template:Linear.easeNone, randomize:false}) , clearProps:"x"});
                    tween2.repeat(-1).yoyo(true).play();
                }else{
                    TweenMax.killTweensOf(this.state.positivePowerZone[i]);
                    TweenMax.killTweensOf(this.state.negativePowerZone[i]);
                }
            }
        }
        //Overcrowding
        for(let i = 0; i < this.state.localPositiveDotsPerZone.length; i++){
            if(this.state.localPositiveDotsPerZone[i].length > this.props.base[1]-1) {
                let tween = TweenMax.fromTo(this.state.positivePowerZone[i], 0.3, {x:this.state.positivePowerZone[i].x - 1}, {x:"+=1", ease:RoughEase.ease.config({strength:8, points:20, template:Linear.easeNone, randomize:false}) , clearProps:"x"});
                tween.repeat(-1).yoyo(true).play();
                this.state.positiveValueText[i].style.fill = 0xff0000;
            }else{
                TweenMax.killTweensOf(this.state.positivePowerZone[i]);
                this.state.positiveValueText[i].style.fill = 0x444444;
            }
        }
        if (this.state.negativePresent) {
            for (let i = 0; i < this.state.localNegativeDotsPerZone.length; i++) {
                if (this.state.localNegativeDotsPerZone[i].length > this.props.base[1] - 1) {
                    let tween = TweenMax.fromTo(this.state.negativePowerZone[i], 0.3, {x: this.state.negativePowerZone[i].x - 1}, {
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
                    this.state.negativeValueText[i].fill = 0xff0000;
                } else {
                    TweenMax.killTweensOf(this.state.negativePowerZone[i]);
                    this.state.negativeValueText[i].style.fill = 0xDDDDDD;
                }
            }
        }
        //Machine stabilization

    }

    render() {
        return (
            <canvas ref={(canvas) => { this.canvas = canvas; }} />
        );
    }
}

export default CanvasPIXI;
