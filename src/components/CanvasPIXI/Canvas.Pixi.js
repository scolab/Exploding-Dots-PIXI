import React, {Component, PropTypes} from 'react';
import {isPointInRectangle, randomFromTo} from '../../utils/MathUtils'
import { TweenMax, RoughEase, Linear} from "gsap";
import {Point} from 'pixi.js';
import {BASE, OPERATOR_MODE, USAGE_MODE, SETTINGS} from '../../Constants'

class CanvasPIXI extends Component {

    boxWidth = 160;
    boxHeight = 242;
    halfBoxHeight = 115;

    static propTypes = {
        addDot: PropTypes.func.isRequired,
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
        addMultipleDots: PropTypes.func.isRequired,
        rezoneDot: PropTypes.func.isRequired,
        removeDot: PropTypes.func.isRequired,
        removeMultipleDots: PropTypes.func.isRequired,
        activateMagicWand: PropTypes.func.isRequired,
        dots: PropTypes.array.isRequired,
        base: PropTypes.array.isRequired,
        operator_mode: PropTypes.oneOf([OPERATOR_MODE.DISPLAY, OPERATOR_MODE.ADDITION, OPERATOR_MODE.SUBTRACT, OPERATOR_MODE.MULTIPLY, OPERATOR_MODE.DIVIDE]).isRequired,
        usage_mode: PropTypes.oneOf([USAGE_MODE.FREEPLAY, USAGE_MODE.OPERATION]),
        placeValueOn: PropTypes.bool.isRequired,
        numZone: PropTypes.number.isRequired,
        maxViewableDots: PropTypes.number.isRequired,
        magicWandIsActive: PropTypes.bool.isRequired,
    };

    constructor(props){
        super(props);
        this.state = {};
        this.state.id = props.id;
        this.state.maxX = SETTINGS.GAME_WIDTH;
        this.state.minX = 0;
        this.state.maxY = SETTINGS.GAME_HEIGHT;
        this.state.minY = 0;
        this.state.isWebGL = false;
        this.state.allZones = [];
        this.state.positiveDotsPerZone = [];
        this.state.negativeDotsPerZone = [];
        this.state.positiveValueText = [];
        this.state.negativeValueText = [];
        this.state.divisionValueText = [];
        this.state.divisionNegativeValueText = [];
        this.state.placeValueText = [];
        this.state.positivePowerZone = [];
        this.state.negativePowerZone = [];
        this.state.numOfZone = 0;
        this.state.isInteractive = true;
        this.state.negativePresent = (props.base == OPERATOR_MODE.SUBTRACT || props.base == OPERATOR_MODE.DIVIDE || props.base[1] === BASE.BASE_X);

        for(let i = 0; i < this.props.numZone; i++){
            this.state.positiveDotsPerZone.push([]);
            this.state.negativeDotsPerZone.push([]);
        }

        // to accomodate for pixel padding in TexturePacker
        PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;

        let loader = new PIXI.loaders.Loader();
        if (window.devicePixelRatio >= 4) {
            loader.add("machineAssets", "./images/machine@4x.json");
        } else if (window.devicePixelRatio >= 3) {
            loader.add("machineAssets", "./images/machine@3x.json");
        } else if (window.devicePixelRatio >= 2) {
            loader.add("machineAssets", "./images/machine@2x.json");
        } else {
            loader.add("machineAssets", "./images/machine@1x.json");
        }
        loader.once('complete', this.onAssetsLoaded.bind(this));
        loader.once('error', this.onAssetsError.bind(this));
        loader.load();
    }

    componentDidMount(){
        //console.log('componentDidMount', this.state);

        var options = {
            view: this.canvas,
            transparent: true,
            antialias: false,
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
            /*this.state.active_dot_sprite = new PIXI.Sprite(textures["active_dot.png"]);
            this.state.active_antidot_sprite = new PIXI.Sprite(textures["active_antidot.png"]);
            this.state.antidot_div_value_sprite = new PIXI.Sprite(textures["antidot_div_value.png"]);
            this.state.antidot_value_sprite = new PIXI.Sprite(textures["antidot_value.png"]);
            this.state.box_sprite = new PIXI.Sprite(textures["box.png"]);
            this.state.dot_div_value_sprite = new PIXI.Sprite(textures["dot_div_value.png"]);
            this.state.dot_value_sprite = new PIXI.Sprite(textures["dot_value.png"]);
            this.state.inactive_antidot_sprite = new PIXI.Sprite(textures["inactive_antidot.png"]);
            this.state.inactive_dot_sprite = new PIXI.Sprite(textures["inactive_dot.png"]);
            this.state.selected_dot_sprite = new PIXI.Sprite(textures["selected_dot.png"]);
            this.state.separator_sprite = new PIXI.Sprite(textures["separator.png"]);*/

            this.createZones();
            /*this.props.dots.forEach((dotsInZone) => {
                dotsInZone.forEach((dot) =>{
                    this.addDotToZone(dot)
                });
            });*/
            this.props.dots.forEach((dot) =>{this.addDotToZone(dot)});

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
        dotsCounter.x = (position * (this.boxWidth + gutterWidth)) + (this.boxWidth / 2);
        dotsCounter.y = 0;
        container.addChild(dotsCounter);

        let dotsCounterText = new PIXI.Text(position, {
            fontFamily: 'museo-slab',
            fontSize: 24,
            fill: 0x444444,
            align: 'center'
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
            dotsCounterNegative.x = (position * (this.boxWidth + gutterWidth)) + (this.boxWidth / 2);
            dotsCounterNegative.y = this.boxHeight + 20;
            container.addChild(dotsCounterNegative);

            let dotsCounterText = new PIXI.Text(position, {
                fontFamily: 'museo-slab',
                fontSize: 22,
                fill: 0xDDDDDD,
                align: 'center'
            });
            dotsCounterText.anchor.x = 0.5;
            dotsCounterText.x = (position * (this.boxWidth + gutterWidth)) + (this.boxWidth / 2);
            dotsCounterText.y = this.boxHeight + 68;
            dotsCounterText.text = '1';
            container.addChild(dotsCounterText);
            this.state.negativeValueText.push(dotsCounterText);
        }

        let bgBox = new PIXI.Sprite(textures["box.png"]);
        bgBox.x = position * (this.boxWidth + gutterWidth);
        bgBox.y = boxYPos;
        container.addChild(bgBox);

        if (this.props.placeValueOn){
            if(this.props.base[1] === 'x'){
                var placeValueText = new PIXI.Text('X' + (this.state.numOfZone), {
                    fontFamily: 'museo-slab',
                    fontSize: 40,
                    fill: 0xDDDDDD,
                    align: 'center'
                });
            }else {
                var placeValueText = new PIXI.Text(String(Math.pow(this.props.base[1], this.state.numOfZone)), {
                    fontFamily: 'museo-slab',
                    fontSize: 40,
                    fill: 0xDDDDDD,
                    align: 'center'
                });
            }
            placeValueText.anchor.x = 0.5;
            placeValueText.x = (position * (this.boxWidth + gutterWidth)) + (this.boxWidth / 2);
            placeValueText.y = boxYPos + (this.boxHeight / 2) - 30;
            container.addChild(placeValueText);
            this.state.placeValueText.push(placeValueText);

        }

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

            let dividerValueText = new PIXI.Text('1',{fontFamily : 'museo-slab', fontSize: 16, fill : 0x444444, align : 'center'});
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

                let dividerNegativeValueText = new PIXI.Text('1',{fontFamily : 'museo-slab', fontSize: 16, fill : 0x444444, align : 'center'});
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
        //console.log('setZoneTextAndAlphaStatus', this.state.positiveDotsPerZone.length);
        let positiveZoneAreEmpty = [];
        let negativeZoneAreEmpty = [];
        for(let i = 0; i < this.props.numZone; ++i) {
            positiveZoneAreEmpty.push(false);
            negativeZoneAreEmpty.push(false);
        }
        for(let i = 0; i < this.state.positiveDotsPerZone.length; i++){
            let zoneDotCount = this.state.positiveDotsPerZone[i].length;
            if(zoneDotCount !== 0){
                if(this.props.base[1] !== 12) {
                    this.state.positiveValueText[i].text = zoneDotCount;
                }else{
                    if(zoneDotCount > (this.props.base[1] - 1)){
                        return zoneDotCount;
                    }else{
                        switch (zoneDotCount){
                            case 10:
                                this.state.positiveValueText[i].text = 'A';
                            case 11:
                                this.state.positiveValueText[i].text = 'B';
                            default:
                                this.state.positiveValueText[i].text = zoneDotCount;
                        }
                    }
                }
            }else{
                for(let j = i; j < this.props.numZone; ++j){
                    if (this.state.positiveDotsPerZone[j].length !== 0) {
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

        for(let i = 0; i < this.state.negativeDotsPerZone.length; i++){
            let zoneDotCount = this.state.negativeDotsPerZone[i].length;
            if(zoneDotCount !== 0){
                if(this.props.base[1] !== 12) {
                    this.state.negativeValueText[i].text = zoneDotCount;
                }else{
                    if(zoneDotCount > (this.props.base[1] - 1)){
                        return zoneDotCount;
                    }else{
                        switch (zoneDotCount){
                            case 10:
                                this.state.negativeValueText[i].text = 'A';
                            case 11:
                                this.state.negativeValueText[i].text = 'B';
                            default:
                                this.state.negativeValueText[i].text = zoneDotCount;
                        }
                    }
                }
            }else if(this.state.negativePresent){
                for(let j = i; j < this.props.numZone; ++j){
                    if (this.state.negativeDotsPerZone[j].length !== 0) {
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

        var colorMatrix =  [
            1,0,0,-0.3,
            0,1,0,-0.3,
            0,0,1,-0.3,
            0,0,0,1
        ];
        var filter = new PIXI.filters.ColorMatrixFilter();
        filter.matrix = colorMatrix;
        for(let i = 0; i < this.props.numZone; ++i) {
            if(positiveZoneAreEmpty[i] === true && (this.state.negativePresent === false || negativeZoneAreEmpty[i] === true)){
                this.state.allZones[i].filters = [filter];
            }else{
                this.state.allZones[i].filters = null;

            }
        }
    }

    createDot(e){
        if(this.state.isInteractive) {
            let clickPos = e.data.getLocalPosition(e.data.target);
            this.props.addDot(this.state.id, e.data.target.powerZone, [clickPos.x, clickPos.y], e.data.target.isPositive);
        }
    }

    addDotToZone(dot){
        console.log('addDotToZone');
        let dotSprite;
        if(dot.isPositive) {
            dotSprite = new PIXI.Sprite(this.state.textures["inactive_dot.png"]);
            this.state.positivePowerZone[dot.powerZone].addChild(dotSprite);
            this.state.positiveDotsPerZone[dot.powerZone].push(dot);
        }else{
            dotSprite = new PIXI.Sprite(this.state.textures["inactive_antidot.png"]);
            this.state.negativePowerZone[dot.powerZone].addChild(dotSprite);
            this.state.negativeDotsPerZone[dot.powerZone].push(dot);
        }

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
        TweenMax.to(dotSprite, 1, {alpha:1});
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
        console.log('verifyDroppedOnZone', this.state.negativeDotsPerZone);
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
            //console.log('verifyDroppedOnZone', droppedOnPowerZoneIndex, originalZoneIndex);
            if (droppedOnPowerZoneIndex !== originalZoneIndex) {
                // impossible to move between powerZone AND signed zone
                // impossible to move between powerZone in base X
                if(droppedOnPowerZone.isPositive === dotSprite.dot.isPositive && this.props.base[1] != 'x') {

                    let diffZone = originalZoneIndex - droppedOnPowerZoneIndex;
                    let dotsToRemoveCount = 1;
                    //console.log(currentBase, originalZoneIndex, droppedOnPowerZoneIndex, diffZone);
                    if (diffZone < 0) {
                        dotsToRemoveCount = Math.pow(this.props.base[1], diffZone * -1);
                    }
                    //console.log('dotsToRemoveCount', dotsToRemoveCount);
                    //check if possible
                    let finalNbOfDots = -1;
                    if(dotSprite.dot.isPositive) {
                        finalNbOfDots = this.state.positiveDotsPerZone[originalZoneIndex].length - dotsToRemoveCount;
                    }else{
                        finalNbOfDots = this.state.negativeDotsPerZone[originalZoneIndex].length - dotsToRemoveCount;
                    }
                    if (finalNbOfDots < 0) {
                        alert("Pas assez de points disponibles pour cette opération");
                        if (dotSprite.dot.isPositive) {
                            this.backIntoPlace(dotSprite, this.state.positivePowerZone[originalZoneIndex]);
                        } else {
                            this.backIntoPlace(dotSprite, this.state.negativePowerZone[originalZoneIndex]);
                        }
                        return false;
                    }

                    // rezone current dot and thus remove it from the amount to be moved
                    this.addDraggedToNewZone(dotSprite, droppedOnPowerZone, data);
                    dotsToRemoveCount--;

                    console.log('dotsToRemoveCount', dotsToRemoveCount);
                    // animate zone movement and destroy
                    this.tweenDotsToNewZone(originalZoneIndex, droppedOnPowerZone, dotsToRemoveCount);

                     //Add the new dots
                     let dotsPos = [];
                     let newNbOfDots = Math.pow(this.props.base[1], diffZone);
                     newNbOfDots--;
                     console.log('newNbOfDots', newNbOfDots);
                     for (let i = 0; i < newNbOfDots; i++) {
                         dotsPos.push({
                         x: Math.random() * (droppedOnPowerZone.hitArea.width - droppedOnPowerZone.hitArea.x),
                         y: Math.random() * (droppedOnPowerZone.hitArea.height - droppedOnPowerZone.hitArea.y)
                         })
                     }
                     if (droppedOnPowerZone) {
                        this.props.addMultipleDots(this.state.id, droppedOnPowerZoneIndex, dotsPos, dotSprite.dot.isPositive);
                     }

                }else{
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
            console.log('this.props.removeDot 2');
            this.props.removeDot(this.state.id, originalZoneIndex, dotSprite.dot.id);
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

    addDraggedToNewZone(dotSprite, newZone, data){
        console.log('addDraggedToNewZone', newZone.powerZone);
        let dataLocalZone = data.getLocalPosition(newZone);
        newZone.addChild(dotSprite);
        dotSprite.position.x = dataLocalZone.x;
        dotSprite.position.y = dataLocalZone.y;
        if(dotSprite.dot.isPositive) {
            this.state.positiveDotsPerZone[dotSprite.dot.powerZone].splice(this.state.positiveDotsPerZone[dotSprite.dot.powerZone].indexOf(dotSprite.dot), 1);
            this.state.positiveDotsPerZone[newZone.powerZone].push(dotSprite.dot);
        }else{
            this.state.negativeDotsPerZone[dotSprite.dot.powerZone].splice(this.state.negativeDotsPerZone[dotSprite.dot.powerZone].indexOf(dotSprite.dot), 1);
            this.state.negativeDotsPerZone[newZone.powerZone].push(dotSprite.dot);
        }
        this.props.rezoneDot(this.state.id, newZone.powerZone, dotSprite.dot);
    }

    tweenDotsToNewZone(originalZoneIndex, droppedOnPowerZone, dotsToRemove){
        //this.state.isInteractive = false;
        if (droppedOnPowerZone.isPositive) {
            var zone = this.state.positivePowerZone[originalZoneIndex];
        } else {
            var zone = this.state.negativePowerZone[originalZoneIndex];
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
            this.state.movingDotsContainer.addChild(dotSprite);
            dotSprite.position.x = newPosition.x;
            dotSprite.position.y = newPosition.y;
            if(dotSprite.dot.isPositive) {
                this.state.positiveDotsPerZone[dotSprite.dot.powerZone].splice(this.state.positiveDotsPerZone[dotSprite.dot.powerZone].indexOf(dotSprite.dot), 1);
            }else{
                this.state.negativeDotsPerZone[dotSprite.dot.powerZone].splice(this.state.negativeDotsPerZone[dotSprite.dot.powerZone].indexOf(dotSprite.dot), 1);
            }
            TweenMax.to(dotSprite, 0.5, {x:dotSprite.x - 160, onComplete: this.tweenDotsToNewZoneDone.bind(this), onCompleteParams:[dotSprite]});
        }
        this.props.removeMultipleDots(this.state.id, originalZoneIndex, allRemovedDots);
    }

    tweenDotsToNewZoneDone(dotSprite){
        TweenMax.to(dotSprite, 0.3, {alpha:0, onComplete: this.removeTweenDone.bind(this), onCompleteParams:[dotSprite]});
        console.log('tweenDotsToNewZoneDone', this.state.positiveDotsPerZone, this.state.negativeDotsPerZone);
    }

    removeTweenDone(dotSprite){
        dotSprite.parent.removeChild(dotSprite);
        dotSprite.destroy();
        console.log('removeTweenDone', this.state.positiveDotsPerZone, this.state.negativeDotsPerZone);
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
        console.log('shouldComponentUpdate', nextProps);
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
                        this.state.placeValueText[i].text = String(Math.pow(nextProps.base[1], i));
                    }
                }
            }
        }
    }

    checkMachineStateValue(){
        this.state.placeValueText.forEach((text) =>{
            text.alpha = this.props.placeValueOn ? 1 : 0;
        });
        if(this.props.magicWandIsActive) {
            console.log(this.props.positivePowerZoneDots);
            var base = this.props.base[1];
            for(let i = 0; i < this.props.positivePowerZoneDots.length - 1; ++i){
                if(this.props.positivePowerZoneDots[i].length >= base){
                    let removed = this.props.positivePowerZoneDots[i].splice(0, base);
                    this.props.removeMultipleDots(this.state.id, i, removed);
                    this.props.addDot(this.state.id, i + 1, [randomFromTo(0, this.boxWidth), randomFromTo(0, this.boxHeight)], true);
                    break;
                }
            }
            this.props.activateMagicWand(false);
        }
    }

    removeDotsFromStateChange(){
        for(let i = 0; i < this.state.positiveDotsPerZone.length; i++){
            if(this.state.positiveDotsPerZone[i].length > 0) {
                let j = this.state.positiveDotsPerZone[i].length;
                while(j--){
                    let isPresent = false;
                    //this.props.positivePowerZoneDots
                    let k = this.props.dots.length;
                    while(k--){
                        if(this.props.dots[k].powerZone===i && this.props.dots[k].id === this.state.positiveDotsPerZone[i][j].id === true){
                            isPresent = true;
                            break;
                        }
                    }
                    if(isPresent === false) {
                        this.removeCircleFromZone(this.state.positiveDotsPerZone[i][j]);
                        this.state.positiveDotsPerZone[i].splice(this.state.positiveDotsPerZone[i].indexOf(this.state.positiveDotsPerZone[i][j]), 1);
                    }
                }
            }
        }
        for(let i = 0; i < this.state.negativePowerZone.length; i++){
            if(this.state.negativePowerZone[i].length > 0) {
                let j = this.state.negativePowerZone[i].length;
                while(j--){
                    let isPresent = false;
                    let k = this.props.dots.length;
                    while(k--){
                        if(this.props.dots[k].powerZone===i && this.props.dots[k].id === this.state.negativePowerZone[i][j].id === true){
                            isPresent = true;
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
    }

    removeCircleFromZone(dot){
        let dotSprite = dot.sprite;
        //console.log('removeCircleFromZone', dot);
        dotSprite.off('pointerdown', this.onDragStart);
        dotSprite.off('pointerup', this.onDragEnd);
        dotSprite.off('pointerupoutside', this.onDragEnd);
        dotSprite.off('mousemove', this.onDragMove);
        dotSprite.parent.removeChild(dotSprite);
        dot.sprite.destroy();
    }

    addDotsFromStateChange(){
        //console.log('addDotsFromStateChange');
        this.props.dots.forEach((dot) => {
            if(dot.isPositive) {
                //console.log('addDotsFromStateChange', dot.powerZone);
                if (this.state.positiveDotsPerZone[dot.powerZone].length > 0) {
                    let identicalDot = false;
                    this.state.positiveDotsPerZone[dot.powerZone].forEach((existingDot) => {
                        if (existingDot.id === dot.id) {
                            identicalDot = true;
                        }
                    });
                    if (identicalDot === false) {
                        this.addDotToZone(dot);
                    }
                } else {
                    this.addDotToZone(dot)
                }
            }else{
                if (this.state.negativeDotsPerZone[dot.powerZone].length > 0) {
                    let identicalDot = false;
                    this.state.negativeDotsPerZone[dot.powerZone].forEach((existingDot) => {
                        if (existingDot.id === dot.id) {
                            identicalDot = true;
                        }
                    });
                    if (identicalDot === false) {
                        this.addDotToZone(dot);
                    }
                } else {
                    this.addDotToZone(dot)
                }
            }
        });
    }

    checkBase() {
        //Annihilations
        if(this.state.negativePresent && this.state.base[1] != BASE.BASE_X){
            for(let i = 0; i < this.state.positiveDotsPerZone.length; i++){
                if(this.state.positiveDotsPerZone[i].length > 0 && this.state.negativeDotsPerZone.length > 0) {
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
        for(let i = 0; i < this.state.positiveDotsPerZone.length; i++){
            if(this.state.positiveDotsPerZone[i].length > this.props.base[1]-1) {
                let tween = TweenMax.fromTo(this.state.positivePowerZone[i], 0.3, {x:this.state.positivePowerZone[i].x - 1}, {x:"+=1", ease:RoughEase.ease.config({strength:8, points:20, template:Linear.easeNone, randomize:false}) , clearProps:"x"});
                tween.repeat(-1).yoyo(true).play();
                this.state.positiveValueText[i].style.fill = 0xff0000;
            }else{
                TweenMax.killTweensOf(this.state.positivePowerZone[i]);
                this.state.positiveValueText[i].style.fill = 0x444444;
            }
        }
        if (this.state.negativePresent) {
            for (let i = 0; i < this.state.negativeDotsPerZone.length; i++) {
                if (this.state.negativeDotsPerZone[i].length > this.props.base[1] - 1) {
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
