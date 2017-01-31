import React, {Component, PropTypes} from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import { addDot, removeDot, rezoneDot, removeMultipleDots, addMultipleDots} from '../../actions/'
import CanvasPIXI from '../../components/CanvasPIXI/Canvas.Pixi';
import BaseSelector from '../../components/BaseSelector';
import PlaceValueSwitch from '../../components/PlaceValueSwitch';
import ResetButton from '../../components/ResetButton';
import MagicWand from '../../components/MagicWand';
import ActivityDescriptor from '../../components/ActivityDescriptor';
import Operand from '../../components/Operand';
import Operator from '../../components/Operator';

const mapStateToProps = (store) => {
    return {
        dots: store.dots,
        base: store.base
    }
};

const mapDispatchToProps = (dispatch) =>{
    return bindActionCreators({
        addDot: addDot,
        removeDot: removeDot
    }, dispatch);
};

@connect(
    mapStateToProps,
    mapDispatchToProps
)

class DotsMachine extends Component {

    static propTypes = {

    };

    constructor(props) {
        super(props);
    }

    componentDidMount(){
        window.addEventListener('resize', this.resize.bind(this));
    }

    resize(event) {
        const w = window.innerWidth;
        const h = window.innerHeight;
        let ratio = Math.min( w / this.state.GAME_WIDTH, h / this.state.GAME_HEIGHT);
        /*this.state.stage.scale.x = this.state.stage.scale.y = ratio;
        this.state.renderer.resize(Math.ceil(this.state.GAME_WIDTH * ratio), Math.ceil(this.state.GAME_HEIGHT * ratio));*/
    };

    addDot(id, zone, position) {
        this.props.addDot(id, zone, position);
    }

    removeDot(id, zone, position){

    }

    moveDot(id, zone, position){

    }

    changeBase(){

    }

    render() {
        console.log('render Dot Machine');
        return (
            <div>
                <BaseSelector />
                <PlaceValueSwitch />
                <ResetButton />
                <MagicWand />
                <ActivityDescriptor>
                    <Operand/>
                    <Operator/>
                    <Operand/>
                    <button/>
                </ActivityDescriptor>
                <CanvasPIXI dots={this.props.dots} base={this.props.base} addDot={this.addDot.bind(this)} removeDot={this.removeDot.bind(this)} moveDot={this.moveDot.bind(this)} />
            </div>
        );
    }
}

export default DotsMachine;
