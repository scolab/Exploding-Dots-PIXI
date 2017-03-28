import React, {Component, PropTypes} from 'react';
import {randomFromTo} from '../../utils/MathUtils'
import {makeBothArrayTheSameLength} from '../../utils/ArrayUtils';
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
        }
    }

    checkMachineStateValue(){
        //console.log('checkMachineStateValue', this.props.placeValueOn);
        this.powerZoneManager.setValueTextAlpha(this.props.placeValueOn);
        if(this.props.magicWandIsActive) {
            console.log('magicWandIsActive');
            this.powerZoneManager.magicWand();
            this.props.activateMagicWand(false);
        }else if(this.props.startActivity) {
            // ACTIVITY START
            let advancedMode = false;
            if(this.props.usage_mode == USAGE_MODE.OPERATION) {
                let dotsPerZoneA;
                let dotsPerZoneB;
                if(this.props.operandA.indexOf('|') !== -1 || this.props.operandB.indexOf('|') !== -1){
                    // advanced mode, if one side is split with |, split both side
                    advancedMode = true;
                    if(this.props.operandA.indexOf('|') !== -1) {
                        dotsPerZoneA = this.props.operandA.split('|');
                    }else{
                        dotsPerZoneA = this.props.operandA.split('');
                    }
                    dotsPerZoneA.forEach(entry => {
                        if(entry === '-'){
                            dotsPerZoneA[dotsPerZoneA.indexOf(entry)] = 0;
                        }
                    });
                    console.log(dotsPerZoneA);
                    if(this.props.operator_mode !== OPERATOR_MODE.MULTIPLY){
                        // don't split multiplication operand B
                        if(this.props.operandB.indexOf('|') !== -1) {
                            dotsPerZoneB = this.props.operandB.split('|');
                        }else{
                            dotsPerZoneB = this.props.operandB.split('');
                        }
                    }else{
                        // there is no | possible in operandB, but I need it as an array anyway, so split with impossible character.
                        dotsPerZoneB = this.props.operandB.split('|');
                    }
                }else{
                    // normal mode, split in certain condition
                    if(this.props.operator_mode === OPERATOR_MODE.DISPLAY){
                        // no | split in display mode, but I need it as an array anyway, so split with impossible character.
                        dotsPerZoneA = this.props.operandA.split('|');
                        // no zone B in DISPLAY mode, just pretend to prevent crash
                        dotsPerZoneB = [];
                    }else{
                        dotsPerZoneA = this.props.operandA.split('');
                        dotsPerZoneB = this.props.operandB.split('');
                    }

                }
                if(advancedMode === false) {
                    if (dotsPerZoneA[0] === '-') {
                        dotsPerZoneA.splice(0, 1);
                        for (let i = 0; i < dotsPerZoneA.length; i++) {
                            dotsPerZoneA[i] = '-' + dotsPerZoneA[i];
                        }
                    }
                    if (dotsPerZoneB[0] === '-') {
                        dotsPerZoneB.splice(0, 1);
                        for (let i = 0; i < dotsPerZoneB.length; i++) {
                            dotsPerZoneB[i] = '-' + dotsPerZoneB[i];
                        }
                    }
                }
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
                        makeBothArrayTheSameLength(dotsPerZoneA, dotsPerZoneB);
                        for (let i = 0; i < dotsPerZoneA.length; ++i) {
                            let j = 0;
                            for (j = 0; j < Number(dotsPerZoneA[i]); ++j) {
                                dotsPos.push(this.getDot(i, true));
                            }

                            for (j = 0; j < Number(dotsPerZoneB[i]); ++j) {
                                dotsPos.push(this.getDot(i, true, 'two'));
                            }
                        }
                        let operandAValue = this.calculateValueWithoutVerticalBar(dotsPerZoneA);//dotsPerZoneA.reverse().join('').replace(/\b0+/g, '');
                        let operandBValue = this.calculateValueWithoutVerticalBar(dotsPerZoneB);//dotsPerZoneB.reverse().join('').replace(/\b0+/g, '');
                        this.props.activityStarted(dotsPos, operandAValue, operandBValue);
                        break;
                    case OPERATOR_MODE.MULTIPLY:
                        for (let i = 0; i < dotsPerZoneA.length; ++i) {
                            let totalDotInZone = 0;
                            totalDotInZone = Number(dotsPerZoneA[i]) * Number(this.props.operandB);
                            for (let j = 0; j < totalDotInZone; ++j) {
                                dotsPos.push(this.getDot(i, true));
                            }
                        }
                        operandAValue = this.calculateValueWithoutVerticalBar(dotsPerZoneA);
                        this.props.activityStarted(dotsPos, operandAValue);
                        break;
                    case OPERATOR_MODE.SUBTRACT:
                        if(dotsPerZoneA.length === 1 && dotsPerZoneA[0] === '-'){
                            invalidEntry = true;
                        }
                        if(dotsPerZoneB.length === 1 && dotsPerZoneB[0] === '-'){
                            invalidEntry = true;
                        }
                        if(invalidEntry === false){
                            makeBothArrayTheSameLength(dotsPerZoneA, dotsPerZoneB);
                            for (let i = 0; i < dotsPerZoneA.length; ++i) {
                                let j = 0;
                                for (j = 0; j < Math.abs(Number(dotsPerZoneA[i])); ++j) {
                                    dotsPos.push(this.getDot(i, dotsPerZoneA[i].indexOf('-') === -1));
                                }
                                for (j = 0; j < Math.abs(Number(dotsPerZoneB[i])); ++j) {
                                    dotsPos.push(this.getDot(i, dotsPerZoneB[i].indexOf('-') !== -1));
                                }
                            }
                            let operandAValue = this.calculateValueWithoutVerticalBar(dotsPerZoneA);
                            let operandBValue = this.calculateValueWithoutVerticalBar(dotsPerZoneB);
                            this.props.activityStarted(dotsPos, operandAValue, operandBValue);
                        }else{
                            this.props.error(ERROR_MESSAGE.INVALID_ENTRY);
                        }
                        break;
                    case OPERATOR_MODE.DIVIDE:
                        let dividePos = [];
                        if(dotsPerZoneA.length === 1 && dotsPerZoneA[0] === '-'){
                            invalidEntry = true;
                        }
                        if(dotsPerZoneB.length === 1 && dotsPerZoneB[0] === '-'){
                            invalidEntry = true;
                        }
                        if(invalidEntry === false){
                            makeBothArrayTheSameLength(dotsPerZoneA, dotsPerZoneB);

                            for (let i = 0; i < dotsPerZoneA.length; ++i) {
                                let j = 0;
                                for (j = 0; j < Math.abs(Number(dotsPerZoneA[i])); ++j) {
                                    dotsPos.push(this.getDot(i, dotsPerZoneA[i].indexOf('-') === -1));
                                }
                                for (j = 0; j < Math.abs(Number(dotsPerZoneB[i])); ++j) {
                                    dividePos.push(this.getDot(i, dotsPerZoneB[i].indexOf('-') === -1));
                                }
                            }
                            let operandAValue = this.calculateValueWithoutVerticalBar(dotsPerZoneA);
                            let operandBValue = this.calculateValueWithoutVerticalBar(dotsPerZoneB);
                            this.props.activityStarted(dotsPos, operandAValue, operandBValue, dividePos);

                        }else{
                            this.props.error(ERROR_MESSAGE.INVALID_ENTRY);
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
        let value = 0;
        for(let i = 0; i < arr.length; i++){
            value += arr[i] * Math.pow(this.props.base[1], i);
        }
        return value;
    }

    render() {
        return (
            <canvas ref={(canvas) => { this.canvas = canvas; }} />
        );
    }
}

export default CanvasPIXI;
