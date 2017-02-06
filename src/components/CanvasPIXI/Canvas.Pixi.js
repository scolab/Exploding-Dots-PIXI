import React, {Component, PropTypes} from 'react';
import {isIntersecting} from '../../utils/MathUtils'
import {Stage} from 'react-pixi';

import dot from '../CanvasPIXI/images/dot.png';

class CanvasPIXI extends Component {

    static propTypes = {
        addDot: PropTypes.func.isRequired,
        rezoneDot: PropTypes.func.isRequired,
        removeDot: PropTypes.func.isRequired,
        dots: PropTypes.array.isRequired,
        base: PropTypes.array.isRequired,
        mode: React.PropTypes.oneOf(['display', 'add', 'subtract', 'multiply', 'divide']).isRequired,
        placeValueOn: PropTypes.bool.isRequired,
        numZone: PropTypes.number.isRequired
    };

    constructor(props){
        super(props);
        this.state = {};
        this.state.id = props.id;
        this.state.GAME_WIDTH = 1024;
        this.state.GAME_HEIGHT = 377;

        this.state.maxX = this.state.GAME_WIDTH;
        this.state.minX = 0;
        this.state.maxY = this.state.GAME_HEIGHT;
        this.state.minY = 0;
        this.state.dots = [];
        this.state.dotsPerZone = [];
        this.state.dotValueText = [];
        this.state.dotNegativeValueText = [];
        this.state.divisionValueText = [];
        this.state.divisionNegativeValueText = [];
        this.state.placeValueText = [];
        this.state.dotsContainers = [];
        this.state.negativedotsContainers = [];
        this.state.numOfZone = 0;

        for(let i = 0; i < this.props.numZone; i++){
            this.state.dotsPerZone.push([]);//this.props.dots.filter((dot)=>{return dot.zone===i});
        }

        //console.log('this.state.dotsPerZone', this.state.dotsPerZone);

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
        console.log('componentDidMount', this.state);

        var options = {
            view: this.canvas,
            transparent: true,
            antialias: false,
            preserveDrawingBuffer: false,
            resolution: window.devicePixelRatio,
            autoResize: true
        };

        let preventWebGL = false;
        this.state.app = new PIXI.Application(this.state.GAME_WIDTH, this.state.GAME_HEIGHT, options, preventWebGL);
        this.state.stage = this.state.app.stage;
        this.state.renderer = this.state.app.renderer;
        this.state.container = new PIXI.Container();
        this.state.stage.addChild(this.state.container);

        this.state.movingDotsContainer = new PIXI.Container();
        this.state.movingDotsContainer.x = 100;
        this.state.movingDotsContainer.y = 100;
        this.state.movingDotsContainer.height = this.state.GAME_HEIGHT - 200;
        this.state.movingDotsContainer.width = this.state.GAME_WIDTH - 200;
        this.state.stage.addChild(this.state.movingDotsContainer);

        ///console.log('is webGL', (this.state.renderer instanceof PIXI.WebGLRenderer));
        //this.state.renderer.view.style["transform"] = "translatez(0)";

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
            this.props.dots.forEach(dot => {this.addDotToZone(dot)});
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
        let boxWidth = 160;
        let gutterWidth = 23;
        let boxHeight = 242;
        let boxActiveHeight = 230;
        let leftGutter = 66;
        let dotsCounter = new PIXI.Sprite(textures["dot_value.png"]);
        dotsCounter.anchor.x = 0.5;
        dotsCounter.x = (position * (boxWidth + gutterWidth)) + (boxWidth / 2);
        dotsCounter.y = 0;
        container.addChild(dotsCounter);

        let dotsCounterText = new PIXI.Text(position, {
            fontFamily: 'museo-slab',
            fontSize: 24,
            fill: 0x444444,
            align: 'center'
        });
        dotsCounterText.anchor.x = 0.5;
        dotsCounterText.x = (position * (boxWidth + gutterWidth)) + (boxWidth / 2);
        dotsCounterText.y = 45;
        dotsCounterText.text = '1';
        container.addChild(dotsCounterText);
        this.state.dotValueText.push(dotsCounterText);

        if (this.props.mode == 'subtract' || this.props.mode == 'divide' || this.props.base[1] === 'x') {

            let dotsCounterNegative = new PIXI.Sprite(textures["antidot_value.png"]);
            dotsCounterNegative.anchor.x = 0.5;
            dotsCounterNegative.x = (position * (boxWidth + gutterWidth)) + (boxWidth / 2);
            dotsCounterNegative.y = boxHeight + 20;
            container.addChild(dotsCounterNegative);

            let dotsCounterText = new PIXI.Text(position, {
                fontFamily: 'museo-slab',
                fontSize: 22,
                fill: 0xDDDDDD,
                align: 'center'
            });
            dotsCounterText.anchor.x = 0.5;
            dotsCounterText.x = (position * (boxWidth + gutterWidth)) + (boxWidth / 2);
            dotsCounterText.y = boxHeight + 68;
            dotsCounterText.text = '1';
            container.addChild(dotsCounterText);
            this.state.dotNegativeValueText.push(dotsCounterText);
        }

        let bgBox = new PIXI.Sprite(textures["box.png"]);
        bgBox.x = position * (boxWidth + gutterWidth);
        bgBox.y = boxYPos;
        container.addChild(bgBox);

        if (this.props.placeValueOn){
            if(this.props.base[1] === 'x'){
                var placeValueText = new PIXI.Text('X' + (this.props.numZone - this.state.numOfZone - 1), {
                    fontFamily: 'museo-slab',
                    fontSize: 40,
                    fill: 0xDDDDDD,
                    align: 'center'
                });
            }else {
                var placeValueText = new PIXI.Text(String(Math.pow(this.props.base[1], (this.props.numZone - this.state.numOfZone - 1))), {
                    fontFamily: 'museo-slab',
                    fontSize: 40,
                    fill: 0xDDDDDD,
                    align: 'center'
                });
            }
            placeValueText.anchor.x = 0.5;
            placeValueText.x = (position * (boxWidth + gutterWidth)) + (boxWidth / 2);
            placeValueText.y = boxYPos + (boxHeight / 2) - 30;
            container.addChild(placeValueText);
            this.state.placeValueText.push(placeValueText);

        }

        if (this.props.mode == 'subtract' || this.props.mode == 'divide' || this.props.base[1] === 'x') {
            let separator = new PIXI.Sprite(textures['separator.png']);
            separator.x = (position * (boxWidth + gutterWidth)) + 5;
            separator.y = boxYPos + (boxHeight / 2) - 5;
            container.addChild(separator);

            let dotsContainerPositive = new PIXI.Container();
            dotsContainerPositive.x = position * (boxWidth + gutterWidth);
            dotsContainerPositive.y = boxYPos;
            this.state.dotsContainers.push(dotsContainerPositive);
            container.addChild(dotsContainerPositive);
            dotsContainerPositive.interactive = true;
            dotsContainerPositive.buttonMode = true;
            dotsContainerPositive.hitArea = new PIXI.Rectangle(0, 0, boxWidth, (boxActiveHeight / 2));
            dotsContainerPositive.powerZone = this.props.numZone - position - 1;
            dotsContainerPositive.isPositive = true;
            dotsContainerPositive.on('pointerup', this.createDot.bind(this));

            let dotsContainerNegative = new PIXI.Container();
            dotsContainerNegative.x = position * (boxWidth + gutterWidth);
            dotsContainerNegative.y = boxYPos + (boxActiveHeight / 2);
            this.state.negativedotsContainers.push(dotsContainerNegative);
            container.addChild(dotsContainerNegative);
            dotsContainerNegative.interactive = true;
            dotsContainerNegative.buttonMode = true;
            dotsContainerNegative.hitArea = new PIXI.Rectangle(-0, 0, boxWidth, (boxActiveHeight / 2));
            dotsContainerNegative.powerZone = this.props.numZone - position - 1;
            dotsContainerNegative.isPositive = false;
            dotsContainerNegative.on('pointerup', this.createDot.bind(this));
        }else{
            let dotsContainer = new PIXI.Container();
            dotsContainer.x = position * (boxWidth + gutterWidth);
            dotsContainer.y = boxYPos;
            this.state.dotsContainers.push(dotsContainer);
            container.addChild(dotsContainer);
            dotsContainer.interactive = true;
            dotsContainer.buttonMode = true;
            dotsContainer.hitArea = new PIXI.Rectangle(0, 0, boxWidth, boxHeight);
            dotsContainer.powerZone = this.props.numZone - position - 1;
            dotsContainer.isPositive = true;
            dotsContainer.on('pointerup', this.createDot.bind(this));
        }

        if(this.props.mode == 'divide') {
            let dividerCounter = new PIXI.Sprite(textures["dot_div_value.png"]);
            dividerCounter.x = (position * (boxWidth + gutterWidth)) + boxWidth - dividerCounter.width;
            dividerCounter.y = boxYPos;
            container.addChild(dividerCounter);

            let dividerValueText = new PIXI.Text('1',{fontFamily : 'museo-slab', fontSize: 16, fill : 0x444444, align : 'center'});
            dividerValueText.anchor.x = 0.5;
            dividerValueText.x = (position * (boxWidth + gutterWidth)) + boxWidth - (dividerCounter.width / 2);
            dividerValueText.y = boxYPos + 3;
            container.addChild(dividerValueText);
            this.state.divisionValueText.push(dividerValueText);

            if(this.props.mode == 'divide' && this.props.base[1] === 'x') {
                let negativeDividerCounter = new PIXI.Sprite(textures["antidot_div_value.png"]);
                negativeDividerCounter.x = (position * (boxWidth + gutterWidth));
                negativeDividerCounter.y = boxHeight + boxYPos - negativeDividerCounter.height - 10;
                container.addChild(negativeDividerCounter);

                let dividerNegativeValueText = new PIXI.Text('1',{fontFamily : 'museo-slab', fontSize: 16, fill : 0x444444, align : 'center'});
                dividerNegativeValueText.anchor.x = 0.5;
                dividerNegativeValueText.x = (position * (boxWidth + gutterWidth)) + 15;
                dividerNegativeValueText.y = negativeDividerCounter.y + 15;
                container.addChild(dividerNegativeValueText);
                this.state.divisionNegativeValueText.push(dividerNegativeValueText);
            }
        }
        container.x += leftGutter;
        this.state.container.addChild(container);
        this.state.numOfZone++;
    }

    createDot(e){
        //console.log('createDot', e.data.target);
        let clickPos = e.data.getLocalPosition(e.data.target);
        this.props.addDot(this.state.id, e.data.target.powerZone, [clickPos.x, clickPos.y], e.data.target.isPositive);
    }

    addDotToZone(dot){
        /*let circle = d3.select(this.groups[dot.zone]).append("circle");
        let drag = d3.drag()
            .on("start", this.dragstarted.bind(this, this.groups[dot.zone], circle))
            .on("drag", this.dragged.bind(this, this.groups[dot.zone], circle))
            .on("end", this.dragended.bind(this, this.groups[dot.zone], circle));

        circle.id = dot.id;
        dot.svgCircle = circle;
        circle.attr("cx", dot.x).attr("cy", dot.y).attr("r", 25);
        circle.classed('dotCircle', true);
        circle.call(drag);*/
        //console.log('addDotToZone', this.state.dotsContainers, dot.zone);
        let dotSprite;
        if(dot.isPositive) {
            dotSprite = new PIXI.Sprite(this.state.textures["inactive_dot.png"]);
            this.state.dotsContainers[dot.zone].addChild(dotSprite);
        }else{
            dotSprite = new PIXI.Sprite(this.state.textures["inactive_antidot.png"]);
            this.state.negativedotsContainers[dot.zone].addChild(dotSprite);
        }
        this.state.dotsPerZone[dot.zone].push(dot);
        dotSprite.anchor.set(0.5);
        dotSprite.x = dot.x;
        dotSprite.y = dot.y;
        dot.sprite = dotSprite;
        dotSprite.dot = dot;
        this.state.dots.push(dot);
        dotSprite.interactive = true;
        dotSprite.buttonMode = true;
        dotSprite.world = this;
        dotSprite.on('pointerdown', this.onDragStart);
        dotSprite.on('pointerup', this.onDragEnd);
        dotSprite.on('pointerupoutside', this.onDragEnd);
        dotSprite.on('mousemove', this.onDragMove);
    }

    onDragStart(e){
        //console.log('onDragStart', this);
        this.data = e.data;
        this.dragging = true;
        this.world.state.movingDotsContainer.addChild(this);
        var newPosition = this.data.getLocalPosition(this.parent);
        this.position.x = newPosition.x;
        this.position.y = newPosition.y;
    }

    onDragMove(e){
        if (this.dragging){
            var newPosition = this.data.getLocalPosition(this.parent);
            this.position.x = newPosition.x;
            this.position.y = newPosition.y;
        }
    }

    onDragEnd(e){
        this.dragging = false;
        this.data = null;
        e.stopPropagation();
        this.world.verifyDroppedOnZone(this, e.data);
    }

    verifyDroppedOnZone(dotSprite, data){
        let originalZoneIndex = dotSprite.dot.zone;
        let currentZone = null;
        let currentZoneIndex = -1;
        console.log(dotSprite);

        this.state.dotsContainers.forEach(zone =>{
            let dataLocalZone = data.getLocalPosition(zone);
            //console.log(dataLocalZone, zone.hitArea.y, zone.hitArea.height, dataLocalZone.y < zone.hitArea.y + zone.hitArea.height);
            if(dataLocalZone.x > zone.hitArea.x &&
                dataLocalZone.x < (zone.hitArea.x + zone.hitArea.width) &&
                dataLocalZone.y > zone.hitArea.y &&
                dataLocalZone.y < zone.hitArea.y + zone.hitArea.height){
                currentZone = zone;
                currentZoneIndex = zone.powerZone;
                /*zone.addChild(dotSprite);
                let newPosition = data.getLocalPosition(zone);
                dotSprite.position.x = newPosition.x;
                dotSprite.position.y = newPosition.y;*/
            }
        });
        this.state.negativedotsContainers.forEach(zone =>{
            let dataLocalZone = data.getLocalPosition(zone);
            //console.log(dataLocalZone, zone.hitArea.y, zone.hitArea.height);
            if(dataLocalZone.x > zone.hitArea.x &&
                dataLocalZone.x < (zone.hitArea.x + zone.hitArea.width) &&
                dataLocalZone.y > zone.hitArea.y &&
                dataLocalZone.y < zone.hitArea.y + zone.hitArea.height){
                currentZone = zone;
                currentZoneIndex = zone.powerZone;
                /*zone.addChild(dotSprite);
                let newPosition = data.getLocalPosition(zone);
                dotSprite.position.x = newPosition.x;
                dotSprite.position.y = newPosition.y;*/
                //console.log(zone.powerZone, zone.isPositive);
            }
        });



        if(currentZoneIndex !== -1 && currentZone !== null) {
            if (currentZoneIndex !== originalZoneIndex) {
                let diffZone = originalZoneIndex - currentZoneIndex;
                let dotsToRemove = 1;
                console.log(this.props.base, originalZoneIndex, currentZoneIndex, diffZone);
                if (diffZone < 0) {
                    dotsToRemove = Math.pow(this.props.base, diffZone * -1);
                }
                console.log('dotsToRemove', dotsToRemove);
                //check if possible
                let finalNbOfDots = this.dotsPerZone[originalZoneIndex].length - dotsToRemove;
                if (finalNbOfDots < 0) {
                    //alert("Pas assez de points disponibles pour cette opération");
                    circle.transition()
                        .attr("cx", circle.origin[0])
                        .attr("cy", circle.origin[1]);
                    return false;
                }

                console.log('finalNbOfDots', finalNbOfDots);

                // rezone current dot and thus remove it from the amount to be moved
                this.props.rezoneDot(this.state.id, currentZoneIndex, dotSprite.dot);
                dotsToRemove--;
                console.log('dotsToRemove', dotsToRemove);

                // remove dots
                this.props.removeDot(this.state.id, originalZoneIndex, dotsToRemove);

                //Add the new dots
                let dotsPos = [];
                let newNbOfDots = Math.pow(this.props.base, diffZone);
                newNbOfDots--;
                for (let i = 0; i < newNbOfDots; i++) {
                    dotsPos.push({
                        x: Math.random() * (currentZone.hitArea.width - zone.hitArea.x),
                        y: Math.random() * (currentZone.hitArea.height - currentZone.hitArea.y)
                    })
                }
                if (currentZone) {
                    this.props.addMultipleDots(this.state.id, currentZoneIndex, dotsPos);
                }
            }
        }else{
            this.props.removeDot(this.state.id, originalZoneIndex, dotSprite.dot.id);
        }
    }

    resize(event) {
        const w = window.innerWidth;
        const h = window.innerHeight;
        let ratio = Math.min( w / this.state.GAME_WIDTH, h / this.state.GAME_HEIGHT);
        this.state.stage.scale.x = this.state.stage.scale.y = ratio;
        this.state.renderer.resize(Math.ceil(this.state.GAME_WIDTH * ratio), Math.ceil(this.state.GAME_HEIGHT * ratio));
    };

    animationCallback(...args){
        //this.state.stats.begin();
        this.state.renderer.render(this.state.stage);
        //requestAnimationFrame(this.animationCallback.bind(this));
        //this.state.stats.end();

    }


    shouldComponentUpdate(nextProps){
        console.log('shouldComponentUpdate', nextProps);
        this.removeDotsFromStateChange();
        this.addDotsFromStateChange();
        this.checkBase();
        return false;
    }

    removeDotsFromStateChange(){
        for(let i = 0; i < this.state.dotsPerZone.length; i++){
            if(this.state.dotsPerZone[i].length > 0) {
                let j = this.state.dotsPerZone[i].length;
                while(j--){
                    let isPresent = false;
                    let k = this.state.dots.length;
                    while(k--){
                        if(this.state.dots[k].zone===i && this.state.dots[k].id===this.state.dotsPerZone[i][j].id === true){
                            isPresent = true;
                            break;
                        }
                    }
                    if(isPresent === false) {
                        this.removeCircleFromZone(this.state.dotsPerZone[i][j]);
                        this.state.dotsPerZone[i].splice(this.state.dotsPerZone[i].indexOf(this.state.dotsPerZone[i][j]), 1);
                    }
                }
            }
        }
    }

    removeCircleFromZone(dot){
        dot.parent.removeChild(dot);
        /*let drag = d3.drag()
            .on("start", null)
            .on("drag", null)
            .on("end", null);
        dot.svgCircle.call(drag);
        dot.svgCircle.remove();*/
    }

    addDotsFromStateChange(){
        this.props.dots.forEach((dot) => {
            if(this.state.dotsPerZone[dot.zone].length > 0) {
                let identicalDot = false;
                this.state.dotsPerZone[dot.zone].forEach((existingDot) => {
                    if (existingDot.id === dot.id) {
                        identicalDot = true;
                    }
                });
                if(identicalDot === false){
                    this.addDotToZone(dot);
                }
            }else{
                this.addDotToZone(dot)
            }
        });
    }

    checkBase() {
        for(let i = 0; i < this.state.dotsPerZone.length; i++){
            if(this.state.dotsPerZone[i].length > this.props.base-1) {
                this.state.dotsPerZone[i].forEach((dot) =>{
                    //dot.svgCircle.classed('baseIsOver', true);
                });
            }else{
                this.state.dotsPerZone[i].forEach((dot) =>{
                    //dot.svgCircle.classed('baseIsOver', false);
                });
            }
        }
    }

    render() {
        console.log('render PIXI canvas');
        return (
            <canvas ref={(canvas) => { this.canvas = canvas; }} />
        );
    }
}

export default CanvasPIXI;
