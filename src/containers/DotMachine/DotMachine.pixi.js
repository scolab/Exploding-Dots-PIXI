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
        dotsMachine: store.dotsMachine
    }
};

const mapDispatchToProps = (dispatch) =>{
    return bindActionCreators({
        addDot: addDot,
        removeDot: removeDot,
        rezoneDot: rezoneDot
    }, dispatch);
};

@connect(
    mapStateToProps,
    mapDispatchToProps
)

class DotsMachine extends Component {

    static propTypes = {
        addDot: React.PropTypes.func.isRequired,
        removeDot:React.PropTypes.func.isRequired,
        dotsMachine:React.PropTypes.shape({
            dots: React.PropTypes.array,
            machineState: React.PropTypes.shape({
                placeValueSwitch: React.PropTypes.bool.isRequired,
                baseSelectorDisplay: React.PropTypes.bool.isRequired,
                base: React.PropTypes.array.isRequired,
                dots: React.PropTypes.array,
                maxViewableDots: React.PropTypes.number.isRequired,
                mode: React.PropTypes.oneOf(['display', 'add', 'subtract', 'multiply', 'divide']).isRequired,
                zones: React.PropTypes.number.isRequired
            })
        })
    };

    constructor(props) {
        console.log('DotsMachine constructor props', props);
        super(props);
    }

    componentDidMount(){
        //window.addEventListener('resize', this.resize.bind(this));
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

    rezoneDot(id, zone, position){

    }

    changeBase(){

    }

    render() {
        return (
            <div>
                <BaseSelector base={this.props.dotsMachine.machineState.base}/>
                <PlaceValueSwitch />
                <ResetButton />
                <MagicWand />
                <ActivityDescriptor>
                    <Operand/>
                    <Operator/>
                    <Operand/>
                    <button/>
                </ActivityDescriptor>
                <CanvasPIXI numZone={this.props.dotsMachine.machineState.zones} dots={this.props.dotsMachine.dots} base={this.props.dotsMachine.machineState.base} mode={this.props.dotsMachine.machineState.mode} addDot={this.addDot.bind(this)} removeDot={this.removeDot.bind(this)} rezoneDot={this.rezoneDot.bind(this)} placeValueOn={this.props.dotsMachine.machineState.placeValueSwitch} />
            </div>
        );
    }
}

export default DotsMachine;
