import React, {Component, PropTypes} from 'react';
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
        this.state.dotValueText = [];
        this.state.dotNegativeValueText = [];
        this.state.divisionValueText = [];
        this.state.divisionNegativeValueText = [];
        this.state.placeValueText = [];
        this.state.numOfZone = 0;

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
            this.createZones()
        }
    }

    createZones() {
        for(let i = 0; i < this.props.numZone; ++i){
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

        let zoneValueText = new PIXI.Text('0', {
            fontFamily: 'museo-sans',
            fontSize: 24,
            fill: 0x444444,
            align: 'center'
        });
        zoneValueText.anchor.x = 0.5;
        zoneValueText.x = (position * 300) + 150;
        zoneValueText.y = 55;
        this.state.container.addChild(zoneValueText);
        this.state.dotValueText.unshift(zoneValueText);

        if (this.props.mode == 'subtract' || this.props.mode == 'divide' || this.props.base[1] === 'x') {
            let zoneValueNegative = new PIXI.Sprite(textures["dot_value.png"]);
            zoneValueNegative.anchor.x = 0.5;
            zoneValueNegative.x = (position * 300) + 150;
            zoneValueNegative.y = 582;
            zoneValueNegative.rotation = 180 * Math.PI / 180;
            this.state.container.addChild(zoneValueNegative);

            let zoneNegativeValueText = new PIXI.Text('0', {
                fontFamily: 'museo-sans',
                fontSize: 24,
                fill: 0x444444,
                align: 'center'
            });
            zoneNegativeValueText.anchor.x = 0.5;
            zoneNegativeValueText.x = (position * 300) + 150;
            zoneNegativeValueText.y = 500;
            this.state.container.addChild(zoneNegativeValueText);
            this.state.dotNegativeValueText.unshift(zoneNegativeValueText);
        }

        let bgBox = new PIXI.Sprite(textures["box.png"]);
        bgBox.x = position * 300;
        bgBox.y = boxYPos;
        this.state.container.addChild(bgBox);

        if (this.props.placeValueOn){
            if(this.props.base[1] === 'x'){
                var zonePlaceValueText = new PIXI.Text('X' + (this.props.numZone - this.state.numOfZone - 1), {
                    fontFamily: 'museo-sans',
                    fontSize: 120,
                    fill: 0xDDDDDD,
                    align: 'center'
                });
            }else {
                console.log(this.props.numZone, this.state.numOfZone);
                var zonePlaceValueText = new PIXI.Text(String(Math.pow(this.props.base[1], (this.props.numZone - this.state.numOfZone - 1))), {
                    fontFamily: 'museo-sans',
                    fontSize: 80,
                    fill: 0xDDDDDD,
                    align: 'center'
                });
            }
            zonePlaceValueText.anchor.x = 0.5;
            zonePlaceValueText.x = (position * 300) + 150;
            zonePlaceValueText.y = boxYPos + 150;
            this.state.container.addChild(zonePlaceValueText);
            this.state.placeValueText.unshift(zonePlaceValueText);

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
            this.state.divisionValueText.unshift(dividerValueText);

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
                this.state.divisionNegativeValueText.unshift(dividerNegativeValueText);
            }
        }
        this.state.numOfZone++;
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
        this.state.view = this.state.renderer.view;
        this.state.container = new PIXI.Container();
        this.state.stage.addChild(this.state.container);

        ///console.log('is webGL', (this.state.renderer instanceof PIXI.WebGLRenderer));
        this.state.renderer.view.style["transform"] = "translatez(0)";

        this.props.addDot(this.state.id, 0, [100,100]);
        requestAnimationFrame(this.animationCallback.bind(this));
        window.addEventListener('resize', this.resize.bind(this));
    }

    resize(event) {
        const w = window.innerWidth;
        const h = window.innerHeight;
        let ratio = Math.min( w / this.state.GAME_WIDTH, h / this.state.GAME_HEIGHT);
        this.state.stage.scale.x = this.state.stage.scale.y = ratio;
        this.state.renderer.resize(Math.ceil(this.state.GAME_WIDTH * ratio), Math.ceil(this.state.GAME_HEIGHT * ratio));
    };

    animationCallback(...args){
        /*this.state.stats.begin();
         this.state.renderer.render(this.state.stage);
         requestAnimationFrame(this.animationCallback.bind(this));
         this.state.stats.end();*/
    }


    shouldComponentUpdate(nextProps){
        return false;
    }

    render() {
        console.log('render PIXI canvas');
        return (
            <canvas ref={(canvas) => { this.canvas = canvas; }} />
        );
    }
}

export default CanvasPIXI;
