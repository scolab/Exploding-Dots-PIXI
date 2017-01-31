import React, {Component, PropTypes} from 'react';
import {Stage} from 'react-pixi';

import dot from '../CanvasPIXI/images/dot.png';


class CanvasPIXI extends Component {

    static propTypes = {
        addDot: PropTypes.func,
        rezoneDot: PropTypes.func,
        removeDot: PropTypes.func,
    };

    constructor(props){
        super(props);
        this.state = {};
        this.state.id = props.id;
        this.state.GAME_WIDTH = 800;
        this.state.GAME_HEIGHT = 600;
        this.state.gravity = 0.75;

        this.state.maxX = this.state.GAME_WIDTH;
        this.state.minX = 0;
        this.state.maxY = this.state.GAME_HEIGHT;
        this.state.minY = 0;
        this.state.dots = [];


        this.state.dotTexture = new PIXI.Texture.fromImage(dot);
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

        console.log('constructor is webGL', (this.state.renderer instanceof PIXI.WebGLRenderer));
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
