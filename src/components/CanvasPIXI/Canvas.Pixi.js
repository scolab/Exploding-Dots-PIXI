import React, {Component, PropTypes} from 'react';
import {randomFromTo} from '../../utils/MathUtils'
import {BASE, OPERATOR_MODE, USAGE_MODE, SETTINGS, POSITION_INFO, ERROR_MESSAGE, BOX_INFO, MAX_DOT} from '../../Constants'
import {SpritePool} from '../../utils/SpritePool';
import {PowerZoneManager} from './PowerZoneManager';

class CanvasPIXI extends Component {

    static propTypes = {
        addDot: PropTypes.func.isRequired,
        addMultipleDots: PropTypes.func.isRequired,
        rezoneDot: PropTypes.func.isRequired,
        removeDot: PropTypes.func.isRequired,
        removeMultipleDots: PropTypes.func.isRequired,
        activateMagicWand: PropTypes.func.isRequired,
        activityStarted: PropTypes.func.isRequired,
        positivePowerZoneDots: PropTypes.arrayOf(React.PropTypes.objectOf(React.PropTypes.shape({
            x: PropTypes.number.isRequired,
            y: PropTypes.number.isRequired,
            powerZone: PropTypes.number.isRequired,
            id: PropTypes.string.isRequired,
            isPositive: PropTypes.bool.isRequired,
        }))).isRequired,
        negativePowerZoneDots: PropTypes.arrayOf(React.PropTypes.objectOf(React.PropTypes.shape({
            x: PropTypes.number.isRequired,
            y: PropTypes.number.isRequired,
            powerZone: PropTypes.number.isRequired,
            id: PropTypes.string.isRequired,
            isPositive: PropTypes.bool.isRequired,
        }))).isRequired,
        positiveDividerDots: PropTypes.arrayOf(React.PropTypes.objectOf(React.PropTypes.shape({
            powerZone: PropTypes.number.isRequired,
            id: PropTypes.string.isRequired,
            isPositive: PropTypes.bool.isRequired,
        }))).isRequired,
        negativeDividerDots: PropTypes.arrayOf(React.PropTypes.objectOf(React.PropTypes.shape({
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
        displayUserMessage: PropTypes.func.isRequired,
        userMessage: PropTypes.string,
    };

    constructor(props){
        super(props);
        this.state = {};
        /*this.state.maxX = SETTINGS.GAME_WIDTH;
        this.state.minX = 0;
        this.state.maxY = operator_mode === OPERATOR_MODE.DIVIDE ? SETTINGS.GAME_HEIGHT_DIVIDE : SETTINGS.GAME_HEIGHT;
        this.state.minY = 0;*/
        this.state.isWebGL = false;
        this.state.negativePresent = (props.operator_mode == OPERATOR_MODE.SUBTRACT || props.operator_mode == OPERATOR_MODE.DIVIDE || props.base[1] === BASE.BASE_X);
        this.state.maxDotsByZone = this.state.negativePresent ? MAX_DOT.MIX : MAX_DOT.ONLY_POSITIVE;
        this.powerZoneManager = null;
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
        this.state.app = new PIXI.Application(SETTINGS.GAME_WIDTH, (this.props.operator_mode === OPERATOR_MODE.DIVIDE ? SETTINGS.GAME_HEIGHT_DIVIDE : SETTINGS.GAME_HEIGHT), options, preventWebGL);
        //this.state.app = new PIXI.Application(SETTINGS.GAME_WIDTH, SETTINGS.GAME_HEIGHT, options, preventWebGL);
        this.state.stage = this.state.app.stage;
        this.state.renderer = this.state.app.renderer;
        this.powerZoneManager = new PowerZoneManager(
            this.props.addDot,
            this.props.removeDot,
            this.props.addMultipleDots,
            this.props.removeMultipleDots,
            this.props.rezoneDot,
            this.props.displayUserMessage
        );
        this.state.stage.addChild(this.powerZoneManager);
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
            this.textures = loader.resources.machineAssets.textures;
            this.spritePool = new SpritePool(this.textures);
            this.powerZoneManager.init(
                this.textures,
                this.spritePool,
                this.props.base,
                this.props.usage_mode,
                this.props.operator_mode,
                this.props.totalZoneCount,
                this.props.placeValueOn,
                this.state.negativePresent,
            );
            this.powerZoneManager.createZones();
            this.resize();
            this.powerZoneManager.inititalPopulate(this.props.positivePowerZoneDots);
            this.powerZoneManager.inititalPopulate(this.props.negativePowerZoneDots);
        }
    }

    resize(event) {
        const w = window.innerWidth;
        const h = window.innerHeight;
        let ratio = Math.min( w / SETTINGS.GAME_WIDTH, h / (this.props.operator_mode === OPERATOR_MODE.DIVIDE ? SETTINGS.GAME_HEIGHT_DIVIDE : SETTINGS.GAME_HEIGHT));
        this.state.stage.scale.x = this.state.stage.scale.y = ratio;
        this.state.renderer.resize(Math.ceil(SETTINGS.GAME_WIDTH * ratio), Math.ceil((this.props.operator_mode === OPERATOR_MODE.DIVIDE ? SETTINGS.GAME_HEIGHT_DIVIDE : SETTINGS.GAME_HEIGHT) * ratio));
    };

    animationCallback(...args){
        //this.state.stats.begin();
        this.state.renderer.render(this.state.stage);
        //requestAnimationFrame(this.animationCallback.bind(this));
        //this.state.stats.end();
    }

    shouldComponentUpdate(nextProps){
        //console.log('shouldComponentUpdate', nextProps);
        this.powerZoneManager.checkPendingAction(nextProps);
        this.checkBaseChange(nextProps);
        this.props = nextProps;
        //this.powerZoneManager.positivePowerZoneDots = this.props.positivePowerZoneDots;
        this.powerZoneManager.removeDotsFromStateChange(this.props.positivePowerZoneDots, this.props.negativePowerZoneDots);
        this.powerZoneManager.addDotsFromStateChange(this.props.positivePowerZoneDots, this.props.negativePowerZoneDots);
        if(this.props.operator_mode === OPERATOR_MODE.DIVIDE) {
            this.powerZoneManager.removeDividerDotFromStateChange(this.props.positiveDividerDots, this.props.negativeDividerDots);
            this.powerZoneManager.addDividerDotFromStateChange(this.props.positiveDividerDots, this.props.negativeDividerDots);
        }
        this.powerZoneManager.checkInstability();
        this.powerZoneManager.setZoneTextAndAlphaStatus();
        this.checkMachineStateValue();
        return false;
    }

    checkBaseChange(nextProps){
        if(this.props.base !==  nextProps.base){
            this.powerZoneManager.doBaseChange(nextProps.base, nextProps.placeValueOn);
            /*this.state.allZones.forEach(zone => {
               zone.baseChange(nextProps.base, nextProps.placeValueOn);
            });*/
        }
    }

    checkMachineStateValue(){
        //console.log('checkMachineStateValue', this.props.placeValueOn);
        this.powerZoneManager.setValueTextAlpha(this.props.placeValueOn);
        if(this.props.magicWandIsActive) {
            console.log('magicWandIsActive');
            // Overcrowding
            this.powerZoneManager.magicWand();
            this.props.activateMagicWand(false);
        }else if(this.props.startActivity) {
            // ACTIVITY START
            if(this.props.usage_mode == USAGE_MODE.OPERATION) {
                let dotsPerZoneA = this.props.operandA.split('|');
                let dotsPerZoneB = this.props.operandB.split('|');
                dotsPerZoneA.reverse();
                dotsPerZoneB.reverse();
                let dotsPos = [];
                let totalDot;
                let operandA;
                let operandB;
                let invalidEntry = false;
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
                                let j = 0;
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
                        operandA = this.props.operandA.substr(0);
                        operandB = this.props.operandB.substr(0);
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
                                for (j = 0; j < Number(Math.abs(dotsPerZoneA[i])); ++j) {
                                    dotsPos.push(this.getDot(i, dotsPerZoneA[i].indexOf('-') === -1));
                                }

                                for (j = 0; j < Number(Math.abs(dotsPerZoneB[i])); ++j) {
                                    dotsPos.push(this.getDot(i, dotsPerZoneB[i].indexOf('-') !== -1, 'two'));
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
                        let dividePos = [];
                        operandA = this.props.operandA.substr(0);
                        operandB = this.props.operandB.substr(0);
                        if(operandA.indexOf('|') === -1 && operandB.indexOf('|') === -1) {
                            let leftIsPositive = true;
                            let rightIsPositive = true;
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
                                rightIsPositive = false;
                                operandB = operandB.substr(1);
                                if(operandB.length === 0){
                                    invalidEntry = true;
                                }
                            }
                            if(invalidEntry === false) {
                                for (let i = 0; i < Number(Math.abs(operandA)); ++i) {
                                    dotsPos.push(this.getDot(0, leftIsPositive));
                                }
                                for (let i = 0; i < Number(Math.abs(operandB)); ++i) {
                                    dividePos.push(this.getDividerDot(0, rightIsPositive));
                                }
                                this.props.activityStarted(dotsPos, null, null, dividePos);
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
                                for (j = 0; j < Number(Math.abs(dotsPerZoneA[i])); ++j) {
                                    dotsPos.push(this.getDot(i, dotsPerZoneA[i].indexOf('-') === -1));
                                }

                                for (j = 0; j < Number(Math.abs(dotsPerZoneB[i])); ++j) {
                                    dividePos.push(this.getDividerDot(i, dotsPerZoneB[i].indexOf('-') === -1, 'two'));
                                }
                            }
                            // remove | bar and calculate the real value
                            this.calculateValueWithoutVerticalBar(dotsPerZoneA);
                            this.calculateValueWithoutVerticalBar(dotsPerZoneB);

                            let operandAValue = dotsPerZoneA.reverse().join('').replace(/\b0+/g, '');
                            let operandBValue = dotsPerZoneB.reverse().join('').replace(/\b0+/g, '');
                            this.props.activityStarted(dotsPos, operandAValue, operandBValue, dividePos);
                        }
                        this.powerZoneManager.showDivider();
                        break;
                }
            }
        }
    }

    getDot(zone, isPositive, color = 'one'){
        //console.log('getDot', zone, isPositive);
        let dot = {};
        dot.x = randomFromTo(POSITION_INFO.DOT_RAYON, BOX_INFO.BOX_WIDTH - POSITION_INFO.DOT_RAYON);
        if(this.state.negativePresent){
            dot.y = randomFromTo(POSITION_INFO.DOT_RAYON, BOX_INFO.HALF_BOX_HEIGHT - POSITION_INFO.DOT_RAYON - POSITION_INFO.BOX_BOTTOM_GREY_ZONE);
        }else{
            dot.y = randomFromTo(POSITION_INFO.DOT_RAYON, BOX_INFO.BOX_HEIGHT - POSITION_INFO.DOT_RAYON - POSITION_INFO.BOX_BOTTOM_GREY_ZONE);
        }
        dot.zoneId = zone;
        dot.isPositive = isPositive;
        dot.color = color;
        return dot;
    }

    getDividerDot(zone, isPositive){
        let dot = {};
        dot.zoneId = zone;
        dot.isPositive = isPositive;
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

    render() {
        return (
            <canvas ref={(canvas) => { this.canvas = canvas; }} />
        );
    }
}

export default CanvasPIXI;
