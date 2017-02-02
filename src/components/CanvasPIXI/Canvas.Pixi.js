import React, {Component, PropTypes} from 'react';
import {degToRad, makeUID} from '../../MathUtils'
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
        this.state.GAME_WIDTH = 1560;
        this.state.GAME_HEIGHT = 800;

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
            loader.add("machineAssets", "./images/machine@4x-0.json");
        } else if (window.devicePixelRatio >= 3) {
            loader.add("machineAssets", "./images/machine@3x-0.json");
        } else if (window.devicePixelRatio >= 2) {
            loader.add("machineAssets", "./images/machine@2x-0.json");
        } else {
            loader.add("machineAssets", "./images/machine@1x-0.json");
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

        this.state.movingdotsContainer = new PIXI.particles.ParticleContainer();
        this.state.stage.addChild(this.state.movingdotsContainer);

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
        let textures = this.state.textures;
        let boxYPos = 70;
        let zoneValue = new PIXI.Sprite(textures["dot_value.png"]);
        zoneValue.anchor.x = 0.5;
        zoneValue.x = (position * 300) + 150;
        zoneValue.y = 0;
        this.state.container.addChild(zoneValue);

        let zoneValueText = new PIXI.Text(position, {
            fontFamily: 'museo-sans',
            fontSize: 24,
            fill: 0x444444,
            align: 'center'
        });
        zoneValueText.anchor.x = 0.5;
        zoneValueText.x = (position * 300) + 150;
        zoneValueText.y = 55;
        this.state.container.addChild(zoneValueText);
        this.state.dotValueText.push(zoneValueText);

        if (this.props.mode == 'subtract' || this.props.mode == 'divide' || this.props.base[1] === 'x') {

            let zoneValueNegative = new PIXI.Sprite(textures["dot_value.png"]);
            zoneValueNegative.anchor.x = 0.5;
            zoneValueNegative.x = (position * 300) + 150;
            zoneValueNegative.y = 582;
            zoneValueNegative.rotation = degToRad(180);//180 * Math.PI / 180;
            this.state.container.addChild(zoneValueNegative);

            let zoneNegativeValueText = new PIXI.Text(position, {
                fontFamily: 'museo-sans',
                fontSize: 24,
                fill: 0x444444,
                align: 'center'
            });
            zoneNegativeValueText.anchor.x = 0.5;
            zoneNegativeValueText.x = (position * 300) + 150;
            zoneNegativeValueText.y = 500;
            this.state.container.addChild(zoneNegativeValueText);
            this.state.dotNegativeValueText.push(zoneNegativeValueText);
        }

        let bgBox = new PIXI.Sprite(textures["box.png"]);
        bgBox.x = position * 300;
        bgBox.y = boxYPos;
        this.state.container.addChild(bgBox);

        if (this.props.mode == 'subtract' || this.props.mode == 'divide' || this.props.base[1] === 'x') {
            let separator = new PIXI.Sprite(textures['separator.png']);
            separator.x = (position * 300) + 25;
            separator.y = boxYPos + (bgBox.height / 2) - 20;
            this.state.container.addChild(separator);

            let dotsContainerPositive = new PIXI.particles.ParticleContainer();
            dotsContainerPositive.x = position * 300;
            dotsContainerPositive.y = boxYPos;
            dotsContainerPositive.width = bgBox.width;
            dotsContainerPositive.height = bgBox.height / 2;
            this.state.dotsContainers.push(dotsContainerPositive);
            this.state.container.addChild(dotsContainerPositive);
            dotsContainerPositive.interactive = true;
            dotsContainerPositive.buttonMode = true;
            dotsContainerPositive.hitArea = new PIXI.Rectangle(0, 0, bgBox.width, bgBox.height / 2);
            dotsContainerPositive.powerZone = this.props.numZone - position - 1;
            dotsContainerPositive.isPositive = true;
            dotsContainerPositive.click = this.createDot.bind(this);

            let dotsContainerNegative = new PIXI.particles.ParticleContainer();
            dotsContainerNegative.x = position * 300;
            dotsContainerNegative.y = dotsContainerPositive.y + (bgBox.height / 2);
            dotsContainerNegative.width = bgBox.width;
            dotsContainerNegative.height = bgBox.height / 2;
            this.state.negativedotsContainers.push(dotsContainerNegative);
            this.state.container.addChild(dotsContainerNegative);
            dotsContainerNegative.interactive = true;
            dotsContainerNegative.buttonMode = true;
            dotsContainerNegative.hitArea = new PIXI.Rectangle(0, 0, bgBox.width, bgBox.height / 2);
            dotsContainerNegative.powerZone = this.props.numZone - position - 1;
            dotsContainerNegative.isPositive = false;
            dotsContainerNegative.click = this.createDot.bind(this);

        }else{
            let dotsContainer = new PIXI.particles.ParticleContainer();
            dotsContainer.x = position * 300;
            dotsContainer.y = boxYPos;
            dotsContainer.width = bgBox.width;
            dotsContainer.height = bgBox.height;
            this.state.dotsContainers.push(dotsContainer);
            this.state.container.addChild(dotsContainer);
            dotsContainer.interactive = true;
            dotsContainer.buttonMode = true;
            dotsContainer.hitArea = new PIXI.Rectangle(0, 0, bgBox.width, bgBox.height);
            dotsContainer.powerZone = this.props.numZone - position - 1;
            dotsContainer.isPositive = true;
            dotsContainer.click = this.createDot.bind(this);
        }

        if (this.props.placeValueOn){
            if(this.props.base[1] === 'x'){
                var zonePlaceValueText = new PIXI.Text('X' + (this.props.numZone - this.state.numOfZone - 1), {
                    fontFamily: 'museo-sans',
                    fontSize: 120,
                    fill: 0xDDDDDD,
                    align: 'center'
                });
            }else {
                var zonePlaceValueText = new PIXI.Text(String(Math.pow(this.props.base[1], (this.props.numZone - this.state.numOfZone - 1))), {
                    fontFamily: 'museo-sans',
                    fontSize: 120,
                    fill: 0xDDDDDD,
                    align: 'center'
                });
            }
            zonePlaceValueText.anchor.x = 0.5;
            zonePlaceValueText.x = (position * 300) + 150;
            zonePlaceValueText.y = boxYPos + 150;
            this.state.container.addChild(zonePlaceValueText);
            this.state.placeValueText.push(zonePlaceValueText);

        }

        if(this.props.mode == 'divide') {
            let dividerCounter = new PIXI.Sprite(textures["dot_div_value.png"]);
            dividerCounter.x = (position * 300) + 235;
            dividerCounter.y = boxYPos + 26;
            this.state.container.addChild(dividerCounter);

            let dividerValueText = new PIXI.Text('1',{fontFamily : 'museo-sans', fontSize: 24, fill : 0x444444, align : 'center'});
            dividerValueText.anchor.x = 0.5;
            dividerValueText.x = (position * 300) + bgBox.width - 60;
            dividerValueText.y = 102;
            this.state.container.addChild(dividerValueText);
            this.state.divisionValueText.push(dividerValueText);

            if(this.props.mode == 'divide' && this.props.base[1] === 'x') {
                let negativeDividerCounter = new PIXI.Sprite(textures["dot_div_value.png"]);
                negativeDividerCounter.rotation = 180 * Math.PI / 180;
                negativeDividerCounter.x = (position * 300) + 75;
                negativeDividerCounter.y = bgBox.height + boxYPos - 50;
                this.state.container.addChild(negativeDividerCounter);

                let dividerNegativeValueText = new PIXI.Text('1',{fontFamily : 'museo-sans', fontSize: 24, fill : 0x444444, align : 'center'});
                dividerNegativeValueText.anchor.x = 0.5;
                dividerNegativeValueText.x = (position * 300) + 50;
                dividerNegativeValueText.y = bgBox.height + boxYPos - 85;
                this.state.container.addChild(dividerNegativeValueText);
                this.state.divisionNegativeValueText.push(dividerNegativeValueText);
            }
        }
        this.state.numOfZone++;
    }

    createDot(e){
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
        if(dot.isPositive) {
            let dotSprite = new PIXI.Sprite(this.state.textures["inactive_dot.png"]);
            dotSprite.x = dot.x;
            dotSprite.y = dot.y;
            this.state.dotsContainers[dot.zone].addChild(dotSprite);
            this.state.dotsPerZone[dot.zone].push(dot);
        }else{
            let dotSprite = new PIXI.Sprite(this.state.textures["inactive_antidot.png"]);
            dotSprite.x = dot.x;
            dotSprite.y = dot.y;
            this.state.negativedotsContainers[dot.zone].addChild(dotSprite);
            this.state.dotsPerZone[dot.zone].push(dot);
        }
        this.state.dots.push(dot);
        //console.log('addDotToZone', this.dotsPerZone);
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
                    };
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
