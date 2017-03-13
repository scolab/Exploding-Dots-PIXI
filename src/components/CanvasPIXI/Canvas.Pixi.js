import React, {Component, PropTypes} from 'react';
import {isPointInRectangle, randomFromTo, convertBase, findQuadrant} from '../../utils/MathUtils'
import { TweenMax, RoughEase, Linear} from "gsap";
import {Point} from 'pixi.js';
import {BASE, OPERATOR_MODE, USAGE_MODE, SETTINGS, POSITION_INFO, ERROR_MESSAGE, BOX_INFO} from '../../Constants'
import {ParticleEmitter} from './ParticleEmitter';
import {SpritePool} from '../../utils/SpritePool';
import {ObjPool} from '../../utils/ObjPool';
import dragJSON from './dot_drag.json';
import explodeJSON from './dot_explod.json';
import {ProximityManager} from '../../utils/ProximityManager';
import {PowerZoneManager} from  './Canvas.PIXI.PowerZoneManager';

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
        totalZoneCount: PropTypes.number.isRequired,
        maxViewableDots: PropTypes.number.isRequired,
        magicWandIsActive: PropTypes.bool.isRequired,
        startActivity: PropTypes.bool.isRequired,
        operandA: PropTypes.string.isRequired,
        operandB: PropTypes.string.isRequired,
        error: PropTypes.func.isRequired,
        userMessage: PropTypes.func.isRequired,
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
        this.state.localPositiveDotsPerZone = [];// All the positive dots in the machine
        this.state.localNegativeDotsPerZone = [];// All the negative dots in the machine
        /*this.state.positiveValueText = [];
        this.state.negativeValueText = [];*/
        //this.state.divisionValueText = [];
        //this.state.divisionNegativeValueText = [];
        this.state.placeValueText = [];
        this.state.positivePowerZone = []; // Positive PowerZone and their sprites
        this.state.positivePowerZoneDotNotDisplayed = []; // Dots that should be in a positive powerZone but no more place...
        this.state.negativePowerZone = []; // Negative PowerZone and their sprites
        this.state.negativePowerZoneDotNotDisplayed = []; // Dots that should be in a negative powerZone but no more place...
        //this.state.numOfZone = 0;
        this.state.isInteractive = true;
        this.state.negativePresent = (props.operator_mode == OPERATOR_MODE.SUBTRACT || props.operator_mode == OPERATOR_MODE.DIVIDE || props.base[1] === BASE.BASE_X);
        this.state.maxDotsByZone = this.state.negativePresent ? 75 : 150;
        this.explodeEmitter = [];
        this.dotPool = new ObjPool();
        this.positiveDotOneTexture = 'red_dot.png';
        this.positiveDotTwoTexture = 'blue_dot.png';
        this.negativeDotOneTexture = 'red_antidot.png';
        this.negativeDotTwoTexture = 'blue_antidot.png';
        this.powerZoneManager = new PowerZoneManager();

        for(let i = 0; i < this.props.totalZoneCount; i++){
            this.state.localPositiveDotsPerZone.push([]);
            this.state.localNegativeDotsPerZone.push([]);
            this.state.positivePowerZoneDotNotDisplayed.push([]);
            this.state.negativePowerZoneDotNotDisplayed.push([]);
        }

        // to accomodate for pixel padding in TexturePacker
        PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;
    }

    componentDidMount(){
        console.log('componentDidMount', this.state, this.props);

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
        this.state.stage.addChild(this.state.movingDotsContainer);

        this.state.isWebGL = this.state.renderer instanceof PIXI.WebGLRenderer;
        requestAnimationFrame(this.animationCallback.bind(this));
        window.addEventListener('resize', this.resize.bind(this));

        let loader = new PIXI.loaders.Loader(this.props.cdnBaseUrl);
        if (window.devicePixelRatio >= 1.50) {
            loader.add("machineAssets", "/images/machine@4x.json");
        } else if (window.devicePixelRatio >= 1.25) {
            loader.add("machineAssets", "/images/machine@3x.json");
        } else if (window.devicePixelRatio >= 1) {
            loader.add("machineAssets", "/images/machine@2x.json");
        } else {
            loader.add("machineAssets", "/images/machine@1x.json");
        }
        loader.once('complete', this.onAssetsLoaded.bind(this));
        loader.once('error', this.onAssetsError.bind(this));
        loader.load();
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
            this.dragParticleEmitter = new ParticleEmitter(this.state.movingDotsContainer, this.state.textures["red_dot.png"], dragJSON);
            this.spritePool = new SpritePool(this.state.textures[this.positiveDotOneTexture],
                                                    this.state.textures[this.positiveDotTwoTexture],
                                                    this.state.textures[this.negativeDotOneTexture],
                                                    this.state.textures[this.negativeDotTwoTexture]
            );
        }
    }

    createZones() {
        for(let i = this.props.totalZoneCount - 1; i >= 0; i--){
            let powerZone = this.powerZoneManager.createZone(i,
                this.state.textures,
                this.props.base,
                this.state.negativePresent,
                this.props.usage_mode,
                this.props.operator_mode,
                this.props.totalZoneCount
            );
            this.state.container.addChild(powerZone);
            this.state.allZones.push(powerZone);
            if(this.state.negativePresent){
                this.state.negativePowerZone.push(powerZone.dotsContainerNegative);
                this.state.positivePowerZone.push(powerZone.dotsContainer);
            }else{
                this.state.positivePowerZone.push(powerZone.dotsContainer);
            }
            powerZone.eventEmitter.on('CreateDot', this.createDot, this);
        }
        this.state.allZones.forEach((zone) => {
            zone.setValueTextAlpha(this.props.placeValueOn ? 1 : 0);
        });
        this.resize();
    }

    /*createPowerZone(position) {
        let container = new PIXI.Container();
        let textures = this.state.textures;
        let boxYPos = 70;
        let gutterWidth = 23;
        let leftGutter = 66;
        let dotsCounter = new PIXI.Sprite(textures["dot_value.png"]);
        dotsCounter.anchor.x = 0.5;
        dotsCounter.x = (position * (BOX_INFO.BOX_WIDTH + gutterWidth)) + (BOX_INFO.BOX_WIDTH / 2) + 3;
        dotsCounter.y = 0;
        container.addChild(dotsCounter);

        let dotsCounterText = new PIXI.Text(position, {
            fontFamily: 'museo-slab',
            fontSize: 22,
            fill: 0x6D6D6D,
            align: 'center',
        });
        dotsCounterText.anchor.x = 0.5;
        dotsCounterText.x = (position * (BOX_INFO.BOX_WIDTH + gutterWidth)) + (BOX_INFO.BOX_WIDTH / 2);
        dotsCounterText.y = 45;
        dotsCounterText.text = '';
        container.addChild(dotsCounterText);
        this.state.positiveValueText.push(dotsCounterText);

        if (this.state.negativePresent) {
            let dotsCounterNegative = new PIXI.Sprite(textures["antidot_value.png"]);
            dotsCounterNegative.anchor.x = 0.5;
            dotsCounterNegative.x = (position * (BOX_INFO.BOX_WIDTH + gutterWidth)) + (BOX_INFO.BOX_WIDTH / 2) + 5;
            dotsCounterNegative.y = BOX_INFO.BOX_HEIGHT + 20;
            container.addChild(dotsCounterNegative);

            let dotsCounterText = new PIXI.Text(position, {
                fontFamily: 'museo-slab',
                fontSize: 22,
                fill: 0xFFFFFF,
                align: 'center'
            });
            dotsCounterText.anchor.x = 0.5;
            dotsCounterText.x = (position * (BOX_INFO.BOX_WIDTH + gutterWidth)) + (BOX_INFO.BOX_WIDTH / 2);
            dotsCounterText.y = BOX_INFO.BOX_HEIGHT + 70;
            dotsCounterText.text = '1';
            container.addChild(dotsCounterText);
            this.state.negativeValueText.push(dotsCounterText);
        }

        let bgBox = new PIXI.Sprite(textures["box.png"]);
        bgBox.x = position * (BOX_INFO.BOX_WIDTH + gutterWidth);
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
        placeValueText.anchor.x = 0.5;
        placeValueText.x = (position * (BOX_INFO.BOX_WIDTH + gutterWidth)) + (BOX_INFO.BOX_WIDTH / 2);
        placeValueText.y = boxYPos + (BOX_INFO.BOX_HEIGHT / 2) - 30;
        container.addChild(placeValueText);
        this.state.placeValueText.push(placeValueText);

        this.state.placeValueText.forEach((text) => {
            text.alpha = this.props.placeValueOn ? 1 : 0;
        });

        if (this.state.negativePresent) {
            let separator = new PIXI.Sprite(textures['separator.png']);
            separator.x = (position * (BOX_INFO.BOX_WIDTH + gutterWidth)) + 5;
            separator.y = boxYPos + (BOX_INFO.BOX_HEIGHT / 2) - 5;
            container.addChild(separator);

            let dotsContainerPositive = new PIXI.Container();
            dotsContainerPositive.x = position * (BOX_INFO.BOX_WIDTH + gutterWidth);
            dotsContainerPositive.y = boxYPos;
            this.state.positivePowerZone.push(dotsContainerPositive);
            container.addChild(dotsContainerPositive);
            dotsContainerPositive.interactive = true;

            dotsContainerPositive.hitArea = new PIXI.Rectangle(0, 0, BOX_INFO.BOX_WIDTH, BOX_INFO.BOX_HEIGHT);
            this.proximityManagerPositive.push(new ProximityManager(100, dotsContainerPositive.hitArea));
            dotsContainerPositive.powerZone = this.props.numZone - position - 1;
            dotsContainerPositive.isPositive = true;
            if(this.props.usage_mode === USAGE_MODE.FREEPLAY) {
                dotsContainerPositive.buttonMode = true;
                dotsContainerPositive.on('pointerup', this.createDot.bind(this));
            }

            let dotsContainerNegative = new PIXI.Container();
            dotsContainerNegative.x = position * (BOX_INFO.BOX_WIDTH + gutterWidth);
            dotsContainerNegative.y = boxYPos + BOX_INFO.BOX_HEIGHT;
            this.state.negativePowerZone.push(dotsContainerNegative);
            container.addChild(dotsContainerNegative);
            dotsContainerNegative.interactive = true;

            dotsContainerNegative.hitArea = new PIXI.Rectangle(-0, 0, BOX_INFO.BOX_WIDTH, BOX_INFO.BOX_HEIGHT);
            this.proximityManagerNegative.push(new ProximityManager(100, dotsContainerNegative.hitArea));
            dotsContainerNegative.powerZone = this.props.numZone - position - 1;
            dotsContainerNegative.isPositive = false;
            if(this.props.usage_mode === USAGE_MODE.FREEPLAY) {
                dotsContainerNegative.buttonMode = true;
                dotsContainerNegative.on('pointerup', this.createDot.bind(this));
            }
        }else{
            let dotsContainer = new PIXI.Container();
            dotsContainer.x = position * (BOX_INFO.BOX_WIDTH + gutterWidth);
            dotsContainer.y = boxYPos;
            this.state.positivePowerZone.push(dotsContainer);
            container.addChild(dotsContainer);
            dotsContainer.interactive = true;

            dotsContainer.hitArea = new PIXI.Rectangle(0, 0, BOX_INFO.BOX_WIDTH, BOX_INFO.BOX_HEIGHT);
            this.proximityManagerPositive.push(new ProximityManager(100, dotsContainer.hitArea));
            dotsContainer.powerZone = this.props.numZone - position - 1;
            dotsContainer.isPositive = true;
            if(this.props.usage_mode === USAGE_MODE.FREEPLAY) {
                dotsContainer.buttonMode = true;
                dotsContainer.on('pointerup', this.createDot.bind(this));
            }
        }

        if(this.props.operator_mode === OPERATOR_MODE.DIVIDE) {
            let dividerCounter = new PIXI.Sprite(textures["dot_div_value.png"]);
            dividerCounter.x = (position * (BOX_INFO.BOX_WIDTH + gutterWidth)) + BOX_INFO.BOX_WIDTH - dividerCounter.width;
            dividerCounter.y = boxYPos;
            container.addChild(dividerCounter);

            let dividerValueText = new PIXI.Text('1',{fontFamily : 'museo-slab', fontSize: 16, fill : 0x565656, align : 'center'});
            dividerValueText.anchor.x = 0.5;
            dividerValueText.x = (position * (BOX_INFO.BOX_WIDTH + gutterWidth)) + BOX_INFO.BOX_WIDTH - (dividerCounter.width / 2);
            dividerValueText.y = boxYPos + 3;
            container.addChild(dividerValueText);
            this.state.divisionValueText.push(dividerValueText);

            if(this.props.operator_mode === OPERATOR_MODE.DIVIDE && this.props.base[1] === BASE.BASE_X) {
                let negativeDividerCounter = new PIXI.Sprite(textures["antidot_div_value.png"]);
                negativeDividerCounter.x = (position * (BOX_INFO.BOX_WIDTH + gutterWidth));
                negativeDividerCounter.y = BOX_INFO.BOX_HEIGHT + boxYPos - negativeDividerCounter.height - 10;
                container.addChild(negativeDividerCounter);

                let dividerNegativeValueText = new PIXI.Text('1',{fontFamily : 'museo-slab', fontSize: 16, fill : 0x565656, align : 'center'});
                dividerNegativeValueText.anchor.x = 0.5;
                dividerNegativeValueText.x = (position * (BOX_INFO.BOX_WIDTH + gutterWidth)) + 15;
                dividerNegativeValueText.y = negativeDividerCounter.y + 15;
                container.addChild(dividerNegativeValueText);
                this.state.divisionNegativeValueText.push(dividerNegativeValueText);
            }
        }
        container.x += leftGutter;
        this.state.container.addChild(container);
        this.state.allZones.push(container);
        this.state.numOfZone++;
    }*/

    setZoneTextAndAlphaStatus(){
        // Don't display leading zeroes
        let positiveZoneAreEmpty = this.getZoneTextAndAlphaStatus(this.state.localPositiveDotsPerZone, this.powerZoneManager.positiveValueText);
        let negativeZoneAreEmpty = this.getZoneTextAndAlphaStatus(this.state.localNegativeDotsPerZone, this.powerZoneManager.negativeValueText, false);
        var filter = new PIXI.filters.ColorMatrixFilter();
        filter.greyscale(0.3, true);
        for(let i = 0; i < this.props.totalZoneCount; ++i) {
            if(positiveZoneAreEmpty[i] === true && (this.state.negativePresent === false || negativeZoneAreEmpty[i] === true)){
                this.state.allZones[i].filters = [filter];
            }else{
                this.state.allZones[i].filters = null;

            }
        }
    }

     getZoneTextAndAlphaStatus(dotsPerZone, valueText, isPositive = true){
        let zoneAreEmpty = [];
        for(let i = 0; i < this.props.totalZoneCount; ++i) {
            zoneAreEmpty.push(false);
        }
        for(let i = 0; i < dotsPerZone.length; i++){
            let zoneDotCount = dotsPerZone[i].length;
            if(zoneDotCount !== 0){
                if(this.props.base[1] !== 12) {
                    valueText[i].text = zoneDotCount;
                }else{
                    valueText[i].text = convertBase(zoneDotCount.toString(), 10, 12);
                }
            }else if(isPositive || this.state.negativePresent){
                for(let j = i; j < this.props.totalZoneCount; ++j){
                    if (dotsPerZone[j].length !== 0) {
                        valueText[i].text = '0';
                        zoneAreEmpty[i] = false;
                        break;
                    }else{
                        if(i != 0) {
                            valueText[i].text = '';
                            zoneAreEmpty[i] = true;
                        }else{
                            valueText[i].text = '0';
                        }
                    }
                }

            }
        }
        return zoneAreEmpty;
    }

    createDot(e){
        console.log('createDot', e);
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

        if(this.state.isInteractive) {
            this.props.addDot(e.target.powerZone, clickModifiedPos, e.target.isPositive);
        }
    }

    addDotToZone(dot){
        //console.log('addDotToZone', dot);
        if(dot.isPositive) {
            this.doAddDotToZone(dot, true, this.state.positivePowerZone, this.state.positivePowerZoneDotNotDisplayed, this.state.localPositiveDotsPerZone);
        }else{
            this.doAddDotToZone(dot, false, this.state.negativePowerZone, this.state.negativePowerZoneDotNotDisplayed, this.state.localNegativeDotsPerZone);
        }
    }

    doAddDotToZone(dot, isPositive, powerZone, powerZoneNotDisplayed, dotsPerZone){
        //console.log('doAddDotToZone', dot, isPositive, powerZone, powerZoneNotDisplayed, dotsPerZone);
        let dotSprite;
        if(powerZone[dot.powerZone].children.length < this.state.maxDotsByZone) {
            if(dot.color !== 'two'){
                dotSprite = this.spritePool.get('one', isPositive);
            }else{
                dotSprite = this.spritePool.get('two', isPositive);
            }
            powerZone[dot.powerZone].addChild(dotSprite);
        }else{
            powerZoneNotDisplayed[dot.powerZone].push(dot);
        }
        dotsPerZone[dot.powerZone].push(dot);
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
        dotSprite.on('pointermove', this.onDragMove);
        dotSprite.alpha = 0;
        TweenMax.to(dotSprite, 1, {alpha: 1});
        if(dot.isPositive) {
            this.powerZoneManager.proximityManagerPositive[dot.powerZone].addItem(dotSprite);
        }else {
            this.powerZoneManager.proximityManagerNegative[dot.powerZone].addItem(dotSprite);
        }
    }

    onDragStart(e, canvas){
        //console.log('onDragStart', this.dot.id, this.world.state.isInteractive);
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
            this.particleEmitter = this.world.dragParticleEmitter;
            this.particleEmitter.updateOwnerPos(newPosition.x, newPosition.y);
            this.particleEmitter.start();
        }
    }

    onDragMove(e){
        if(this.world.state.isInteractive) {
            if (this.dragging) {
                var newPosition = this.data.getLocalPosition(this.parent);
                this.position.x = newPosition.x;
                this.position.y = newPosition.y;
                this.particleEmitter.updateOwnerPos(newPosition.x, newPosition.y);
            }
        }
    }

    onDragEnd(e){
        if(this.world.state.isInteractive && this.dragging) {
            this.dragging = false;
            this.data = null;
            this.world.verifyDroppedOnZone(this, e.data);
            this.particleEmitter.stop();
        }
        e.stopPropagation();
    }

    verifyDroppedOnZone(dotSprite, data){
        //console.log('verifyDroppedOnZone', dotSprite, data);
        let originalZoneIndex = dotSprite.dot.powerZone;
        let droppedOnPowerZone = null;
        let droppedOnPowerZoneIndex = -1;


        this.state.positivePowerZone.forEach(zone =>{
            let dataLocalZone = data.getLocalPosition(zone);
            if(isPointInRectangle(dataLocalZone, zone.hitArea)){
                droppedOnPowerZone = zone;
                droppedOnPowerZoneIndex = zone.powerZone;
            }
        });
        this.state.negativePowerZone.forEach(zone =>{
            let dataLocalZone = data.getLocalPosition(zone);
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
                if(droppedOnPowerZone.isPositive === dotSprite.dot.isPositive && this.props.base[1] != BASE.BASE_X) {

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
                    this.tweenDotsToNewZone(originalZoneIndex, droppedOnPowerZone, dotsToRemoveCount, dataLocalZone, dotSprite.dot.isPositive);

                    //Add the new dots
                    let dotsPos = [];
                    let newNbOfDots = Math.pow(this.props.base[1], diffZone);
                    newNbOfDots -= this.props.base[0];
                    console.log('newNbOfDots', newNbOfDots, diffZone);
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
                    // just move the dots into the zone
                    droppedOnPowerZone.addChild(dotSprite);
                    let newPosition = data.getLocalPosition(droppedOnPowerZone);
                    dotSprite.position.x = newPosition.x;
                    dotSprite.position.y = newPosition.y;
                }else{
                    // check it possible dot / anti dot destruction
                    if(dotSprite.dot.isPositive) {
                        // Positive dot drag into negative zoe
                        if(this.state.localNegativeDotsPerZone.length > 0){
                            let allRemovedDots = [];
                            let negativeSprite = this.state.negativePowerZone[originalZoneIndex].getChildAt(0);
                            allRemovedDots.push(negativeSprite.dot);
                            this.removeDotSpriteListeners(negativeSprite);
                            allRemovedDots.push(dotSprite.dot);
                            this.removeDotSpriteListeners(dotSprite);
                            this.props.removeMultipleDots(originalZoneIndex, allRemovedDots, true);
                        }else{
                            this.backIntoPlace(dotSprite, this.state.positivePowerZone[originalZoneIndex]);
                        }
                    }else{
                        // Negative dot drag into positive zoe
                        if(this.state.localPositiveDotsPerZone.length > 0){
                            let allRemovedDots = [];
                            let positiveSprite = this.state.positivePowerZone[originalZoneIndex].getChildAt(0);
                            allRemovedDots.push(positiveSprite.dot);
                            this.removeDotSpriteListeners(positiveSprite);
                            allRemovedDots.push(dotSprite.dot);
                            this.removeDotSpriteListeners(dotSprite);
                            this.props.removeMultipleDots(originalZoneIndex, allRemovedDots, true);
                        }else{
                            this.backIntoPlace(dotSprite, this.state.negativePowerZone[originalZoneIndex]);
                        }
                    }
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
        // Set the dot into the array here to have his position right.
        if(dotSprite.dot.isPositive) {
            this.dotPool.dispose(this.state.localPositiveDotsPerZone[dotSprite.dot.powerZone].splice(this.state.localPositiveDotsPerZone[dotSprite.dot.powerZone].indexOf(dotSprite.dot), 1));
            this.state.localPositiveDotsPerZone[newZone.powerZone].push(dotSprite.dot);
        }else{
            this.dotPool.dispose(this.state.localNegativeDotsPerZone[dotSprite.dot.powerZone].splice(this.state.localNegativeDotsPerZone[dotSprite.dot.powerZone].indexOf(dotSprite.dot), 1));
            this.state.localNegativeDotsPerZone[newZone.powerZone].push(dotSprite.dot);
        }
        this.props.rezoneDot(newZone.powerZone, dotSprite.dot, updateValue);
    }

    tweenDotsToNewZone(originalZoneIndex, droppedOnPowerZone, dotsToRemove, positionToBeMovedTo, isPositive){
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
            //this.checkIfNotDisplayedSpriteCanBe();
        }
        let allRemovedDots = [];
        for(let i=0; i < dotsToRemove; i++){
            let dotSprite;
            let dot;
            if(zone.children.length > 0) {
                dotSprite = zone.getChildAt(0);
                dot = dotSprite.dot;
                this.removeDotSpriteListeners(dotSprite);
                dotSprite.origin = new Point();
                dotSprite.origin.copy(dotSprite.position);
                var newPosition = this.state.movingDotsContainer.toLocal(dotSprite.position, dotSprite.parent);
                var finalPosition = this.state.movingDotsContainer.toLocal(positionToBeMovedTo, droppedOnPowerZone);
                this.state.movingDotsContainer.addChild(dotSprite);
                dotSprite.position.x = newPosition.x;
                dotSprite.position.y = newPosition.y;
                let explosionEmitter = this.getExplosionEmitter();
                explosionEmitter.updateOwnerPos(newPosition.x, newPosition.y);
                explosionEmitter.start();
                TweenMax.delayedCall(0.2, this.stopExplosionEmitter, [explosionEmitter], this);
                TweenMax.to(dotSprite, 0.5, {
                    x:finalPosition.x,
                    y:finalPosition.y,
                    onComplete: this.tweenDotsToNewZoneDone.bind(this),
                    onCompleteParams:[dotSprite]
                });
            }else{
                if(isPositive) {
                    dot = this.state.positivePowerZoneDotNotDisplayed[originalZoneIndex].pop();
                }else{
                    dot = this.state.negativePowerZoneDotNotDisplayed[originalZoneIndex].pop();
                }
            }
            allRemovedDots.push(dot);
            // Set the dot into the array here to have his position right.
            if(isPositive) {
                this.dotPool.dispose(this.state.localPositiveDotsPerZone[dot.powerZone].splice(this.state.localPositiveDotsPerZone[dot.powerZone].indexOf(dot), 1));
            }else{
                this.dotPool.dispose(this.state.localNegativeDotsPerZone[dot.powerZone].splice(this.state.localNegativeDotsPerZone[dot.powerZone].indexOf(dot), 1));
            }
        }
        //this.checkIfNotDisplayedSpriteCanBe();
        this.props.removeMultipleDots(originalZoneIndex, allRemovedDots, false);
    }

    getExplosionEmitter(){
        if(this.explodeEmitter.length > 0){
            return this.explodeEmitter.pop();
        }else{
            return new ParticleEmitter(this.state.movingDotsContainer, this.state.textures["red_dot.png"], explodeJSON);
        }
    }

    stopExplosionEmitter(explosionEmitter){
        explosionEmitter.stop();
        this.explodeEmitter.push(explosionEmitter);
    }

    tweenDotsToNewZoneDone(dotSprite){
        TweenMax.to(dotSprite, 0.3, {alpha:0, onComplete: this.removeTweenDone.bind(this), onCompleteParams:[dotSprite]});
    }

    removeTweenDone(dotSprite){
        dotSprite.parent.removeChild(dotSprite);
        this.spritePool.dispose(dotSprite);
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

    removeDotSpriteListeners(sprite){
        sprite.off('pointerdown', this.onDragStart);
        sprite.off('pointerup', this.onDragEnd);
        sprite.off('pointerupoutside', this.onDragEnd);
        sprite.off('pointermove', this.onDragMove);
        if(sprite.dot.isPositive) {
            this.powerZoneManager.proximityManagerPositive[sprite.dot.powerZone].removeItem(sprite);
        }else {
            this.powerZoneManager.proximityManagerNegative[sprite.dot.powerZone].removeItem(sprite);
        }
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
        //console.log(this.state.localPositiveDotsPerZone, this.state.positivePowerZone, this.state.positivePowerZoneDotNotDisplayed);
        //this.proximityManagerPositive[0].update();
        //console.log(this.proximityManagerPositive[0].getNeighbors(this.state.positivePowerZone[0].getChildAt(0)));
        return false;
    }

    checkBaseChange(nextProps){
        if(this.props.base !==  nextProps.base){
            if (nextProps.placeValueOn){
                if(nextProps.base[1] === BASE.BASE_X){
                    /*for(let i = 0; i < this.state.placeValueText.length; ++i) {
                        this.state.placeValueText[i].text = 'X' + i;
                    }*/
                    for(let i = 0; i < this.state.allZones.length; ++i) {
                        this.state.allZones[i].setValueText('X' + i);
                    }
                }else {
                    for(let i = 0; i < this.state.allZones.length; ++i) {
                        if(nextProps.base[0] === 1 || i === 0) {
                            this.state.allZones[i].setValueText(String(Math.pow(nextProps.base[1], i)));
                        }else{
                            this.state.allZones[i].setValueText(String(Math.pow(nextProps.base[1], i) + '/' + Math.pow(nextProps.base[0], i)));
                        }
                    }

                    /*for(let i = 0; i < this.state.placeValueText.length; ++i) {
                        if(nextProps.base[0] === 1 || i === 0) {
                            this.state.placeValueText[i].text = String(Math.pow(nextProps.base[1], i));
                        }else{
                            this.state.placeValueText[i].text = String(Math.pow(nextProps.base[1], i) + '/' + Math.pow(nextProps.base[0], i));
                        }
                    }*/
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
                    this.dotPool.dispose(removed);
                    this.props.addDot(i + 1, [randomFromTo(0, BOX_INFO.BOX_WIDTH), randomFromTo(0, BOX_INFO.BOX_HEIGHT)], true);
                    break;
                }
            }
            this.props.activateMagicWand(false);
        }
        if(this.props.startActivity) {
            if(this.props.usage_mode == USAGE_MODE.OPERATION) {
                let dotsPerZoneA = this.props.operandA.split('|');
                let dotsPerZoneB = this.props.operandB.split('|');
                dotsPerZoneA.reverse();
                dotsPerZoneB.reverse();
                let dotsPos = [];
                let totalDot;
                switch (this.props.operator_mode) {
                    case OPERATOR_MODE.DISPLAY:
                        totalDot = 0;
                        for (let i = 0; i < dotsPerZoneA.length; ++i) {
                            totalDot += dotsPerZoneA[i] * Math.pow(this.props.base[1], i);
                            for (let j = 0; j < Number(dotsPerZoneA[i]); ++j) {
                                dotsPos.push(this.getDot(i, true));
                            }
                        }
                        this.props.activityStarted(dotsPos, totalDot);
                        break;
                    case OPERATOR_MODE.ADDITION:
                        if(this.props.operandA.indexOf('|') === -1 && this.props.operandB.indexOf('|') === -1) {
                            totalDot = Number(this.props.operandA) + Number(this.props.operandB);
                            //for (let i = 0; i < totalDot; ++i) {
                            for (let i = 0; i < Number(this.props.operandA); ++i) {
                                dotsPos.push(this.getDot(0, true));
                            }
                            for (let i = 0; i < Number(this.props.operandB); ++i) {
                                dotsPos.push(this.getDot(0, true, 'two'));
                            }
                            this.props.activityStarted(dotsPos);
                        }else{
                            while(dotsPerZoneA.length > dotsPerZoneB.length){
                                dotsPerZoneB.push(0);
                            }
                            while(dotsPerZoneB.length > dotsPerZoneA.length){
                                dotsPerZoneA.push(0);
                            }
                            for (let i = 0; i < dotsPerZoneA.length; ++i) {
                                //let totalDotInZone = Number(dotsPerZoneA[i]) + Number(dotsPerZoneB[i]);
                                let j = 0;
                                //for (let j = 0; j < totalDotInZone; ++j) {
                                for (j = 0; j < Number(dotsPerZoneA[i]); ++j) {
                                    dotsPos.push(this.getDot(i, true));
                                }

                                for (j = 0; j < Number(dotsPerZoneB[i]); ++j) {
                                    dotsPos.push(this.getDot(i, true, 'two'));
                                }
                            }
                            // remove | bar and calculate the real value
                            this.calculateValueWithoutVerticalBar(dotsPerZoneA);
                            this.calculateValueWithoutVerticalBar(dotsPerZoneB);

                            let operandAValue = dotsPerZoneA.reverse().join('').replace(/\b0+/g, '');
                            let operandBValue = dotsPerZoneB.reverse().join('').replace(/\b0+/g, '');
                            this.props.activityStarted(dotsPos, operandAValue, operandBValue);
                        }
                        break;
                    case OPERATOR_MODE.MULTIPLY:
                        if(this.props.operandA.indexOf('|') === -1) {
                            totalDot = Number(this.props.operandA) * Number(this.props.operandB);
                            for (let i = 0; i < totalDot; ++i) {
                                dotsPos.push(this.getDot(0, true));
                            }
                            this.props.activityStarted(dotsPos);
                        }else{
                            for (let i = 0; i < dotsPerZoneA.length; ++i) {
                                let totalDotInZone = 0;
                                totalDotInZone = Number(dotsPerZoneA[i]) * Number(this.props.operandB);
                                for (let j = 0; j < totalDotInZone; ++j) {
                                    dotsPos.push(this.getDot(i, true));
                                }
                            }
                            this.calculateValueWithoutVerticalBar(dotsPerZoneA);
                            let operandAValue = dotsPerZoneA.reverse().join('');
                            this.props.activityStarted(dotsPos, operandAValue);
                        }
                        break;
                    case OPERATOR_MODE.SUBTRACT:
                        let operandA = this.props.operandA.substr(0);
                        let operandB = this.props.operandB.substr(0);
                        let invalidEntry = false;
                        if(operandA.indexOf('|') === -1 && operandB.indexOf('|') === -1) {
                            let leftIsPositive = true;
                            let rightIsPositive = false;
                            let minusPos = this.props.operandA.indexOf('-');
                            if(minusPos !== -1){
                                // leading minus in left operand
                                leftIsPositive = false;
                                operandA = operandA.substr(1);
                                if(operandA.length === 0){
                                    invalidEntry = true;
                                }
                            }
                            minusPos = this.props.operandB.indexOf('-');
                            if(minusPos !== -1){
                                // leading minus in right operand
                                rightIsPositive = true;
                                operandB = operandB.substr(1);
                                if(operandB.length === 0){
                                    invalidEntry = true;
                                }
                            }
                            if(invalidEntry === false) {
                                for (let i = 0; i < Number(operandA); ++i) {
                                    dotsPos.push(this.getDot(0, leftIsPositive));
                                }
                                for (let i = 0; i < Number(operandB); ++i) {
                                    dotsPos.push(this.getDot(0, rightIsPositive));
                                }
                                this.props.activityStarted(dotsPos);
                            }else{
                                this.props.error(ERROR_MESSAGE.INVALID_ENTRY);
                            }
                        }else{
                            while(dotsPerZoneA.length > dotsPerZoneB.length){
                                dotsPerZoneB.push(0);
                            }
                            while(dotsPerZoneB.length > dotsPerZoneA.length){
                                dotsPerZoneA.push(0);
                            }
                            for (let i = 0; i < dotsPerZoneA.length; ++i) {
                                if(dotsPerZoneA[i] == ''){
                                    dotsPerZoneA[i] = '0';
                                }
                                if(dotsPerZoneB[i] == ''){
                                    dotsPerZoneB[i] = '0';
                                }
                                let j = 0;
                                for (j = 0; j < Number(dotsPerZoneA[i]); ++j) {
                                    dotsPos.push(this.getDot(i, true));
                                }

                                for (j = 0; j < Number(dotsPerZoneB[i]); ++j) {
                                    dotsPos.push(this.getDot(i, false, 'two'));
                                }
                            }

                            // remove | bar and calculate the real value
                            this.calculateValueWithoutVerticalBar(dotsPerZoneA);
                            this.calculateValueWithoutVerticalBar(dotsPerZoneB);

                            let operandAValue = dotsPerZoneA.reverse().join('').replace(/\b0+/g, '');
                            let operandBValue = dotsPerZoneB.reverse().join('').replace(/\b0+/g, '');
                            this.props.activityStarted(dotsPos, operandAValue, operandBValue);
                        }
                        break;
                    case OPERATOR_MODE.DIVIDE:

                        break;
                }
            }
        }
    }

    getDot(zone, isPositive, color = 'one'){
        let dot = this.dotPool.get();
        dot.x = randomFromTo(POSITION_INFO.DOT_RAYON, this.state.positivePowerZone[0].hitArea.width - POSITION_INFO.DOT_RAYON);
        dot.y = randomFromTo(POSITION_INFO.DOT_RAYON, this.state.positivePowerZone[0].hitArea.height - POSITION_INFO.DOT_RAYON - POSITION_INFO.BOX_BOTTOM_GREY_ZONE);
        dot.zoneId = zone;
        dot.isPositive = isPositive;
        dot.color = color;
        return dot;
    }

    calculateValueWithoutVerticalBar(arr){
        for(let i = 0; i < arr.length; ++i){
            while(Number(arr[i]) >= this.props.base[1]){
                if(arr[i + 1] !== undefined){
                    arr[i + 1] = Number(arr[i + 1]) + this.props.base[0];
                    arr[i] = Number(arr[i]) - this.props.base[1];
                }else{
                    arr.push(this.props.base[0]);
                    arr[i] = Number(arr[i]) - this.props.base[1];
                }
            }
        }
    }

    removeDotsFromStateChange(){
        //console.log('removeDotsFromStateChange');
        this.removeDotsIfNeeded(this.state.localPositiveDotsPerZone, this.props.positivePowerZoneDots);
        this.removeDotsIfNeeded(this.state.positivePowerZoneDotNotDisplayed, this.props.positivePowerZoneDots);
        this.removeDotsIfNeeded(this.state.localNegativeDotsPerZone, this.props.negativePowerZoneDots);
        this.removeDotsIfNeeded(this.state.negativePowerZoneDotNotDisplayed, this.props.negativePowerZoneDots);
        this.checkIfNotDisplayedSpriteCanBe();
    }

    removeDotsIfNeeded(localArray, storeArray){
        //console.log('removeDotsIfNeeded', localArray, storeArray);
        for(let i = 0; i < localArray.length; i++){
            if(localArray[i].length > 0) {
                let j = localArray[i].length;
                while(j--){
                    let isPresent = false;
                    let k = storeArray[i].length;
                    while(k--){
                        if(storeArray[i][k].id === localArray[i][j].id === true){
                            isPresent = true;
                            break;
                        }
                    }
                    if(isPresent === false && localArray[i][j] != undefined) {
                        this.removeCircleFromZone(localArray[i][j]);
                        this.dotPool.dispose(localArray[i].splice(localArray[i].indexOf(localArray[i][j]), 1));
                    }
                }
            }
        }
    }

    checkIfNotDisplayedSpriteCanBe(){
        for(let i = 0; i < this.state.positivePowerZoneDotNotDisplayed.length; ++i){
            while(this.state.positivePowerZoneDotNotDisplayed[i].length > 0 && this.state.positivePowerZone[i].children.length < this.state.maxDotsByZone){
                let dot = this.state.positivePowerZoneDotNotDisplayed[i].pop();
                let dotSprite;
                if(dot.color !== 'two'){
                    dotSprite = this.spritePool.get('one', true);
                }else{
                    dotSprite = this.spritePool.get('two', true);
                }
                this.addDotSpriteProperty(dot, dotSprite);
                this.state.positivePowerZone[i].addChild(dotSprite);
            }
        }

        for(let i = 0; i < this.state.negativePowerZoneDotNotDisplayed.length; ++i){
            while(this.state.negativePowerZoneDotNotDisplayed[i].length > 0 && this.state.negativePowerZone[i].children.length < this.state.maxDotsByZone){
                let dot = this.state.negativePowerZoneDotNotDisplayed[i].pop();
                let dotSprite;
                if(dot.color !== 'two'){
                    dotSprite = this.spritePool.get('one', false);
                }else{
                    dotSprite = this.spritePool.get('two', false);
                }
                this.addDotSpriteProperty(dot, dotSprite);
                this.state.negativePowerZone[i].addChild(dotSprite);
            }
        }
    }

    removeCircleFromZone(dot){
        if(dot.sprite) {
            let dotSprite = dot.sprite;
            this.removeDotSpriteListeners(dotSprite);
            dotSprite.parent.removeChild(dotSprite);
            this.spritePool.dispose(dotSprite);
            if(dot.sprite.particleEmitter) {
                dot.sprite.particleEmitter.stop();
            }
            dot.sprite = null;
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
        let dotOverload = false;
        for(let i = 0; i < this.state.localPositiveDotsPerZone.length; i++){
            if(this.state.localPositiveDotsPerZone[i].length > this.props.base[1]-1) {
                let tween = TweenMax.fromTo(this.state.positivePowerZone[i], 0.3,
                    {x:this.state.positivePowerZone[i].x - 1},
                    {x:"+=1",
                        ease:RoughEase.ease.config({
                            strength:8,
                            points:20,
                            template:Linear.easeNone,
                            randomize:false
                        }),
                        clearProps:"x"});
                tween.repeat(-1).yoyo(true).play();
                this.powerZoneManager.positiveValueText[i].style.fill = 0xff0000;
                dotOverload = true;
            }else{
                TweenMax.killTweensOf(this.state.positivePowerZone[i]);
                this.powerZoneManager.positiveValueText[i].style.fill = 0x444444;
            }
        }
        if (this.state.negativePresent) {
            for (let i = 0; i < this.state.localNegativeDotsPerZone.length; i++) {
                if (this.state.localNegativeDotsPerZone[i].length > this.props.base[1] - 1) {
                    let tween = TweenMax.fromTo(this.state.negativePowerZone[i], 0.3,
                        {x: this.state.negativePowerZone[i].x - 1}, {
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
                    dotOverload = true;
                } else {
                    TweenMax.killTweensOf(this.state.negativePowerZone[i]);
                    this.state.negativeValueText[i].style.fill = 0xDDDDDD;
                }
            }
        }
        if (this.state.negativePresent && dotOverload === false){
            for (let i = 0; i < this.props.totalZoneCount; i++) {
                if(this.state.localPositiveDotsPerZone[i].length > 0 && this.state.localNegativeDotsPerZone[i].length > 0) {
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
