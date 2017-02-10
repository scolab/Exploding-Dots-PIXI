import React, {Component, PropTypes} from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import { addDot, removeDot, rezoneDot, removeMultipleDots, addMultipleDots, changeBase, resetMachine, showHidePlaceValue, oneStepStabilize, stabilize, operandChanged} from '../../actions/'
import CanvasPIXI from '../../components/CanvasPIXI/Canvas.Pixi';
import BaseSelector from '../../components/BaseSelector';
import PlaceValueSwitch from '../../components/PlaceValueSwitch';
import ResetButton from '../../components/ResetButton';
import MagicWand from '../../components/MagicWand';
import ActivityDescriptor from '../../components/ActivityDescriptor';
import Operand from '../../components/Operand';
import Operator from '../../components/Operator';
import Text from '../../components/Text'
import {MODE} from '../../Constants';

const mapStateToProps = (store) => {
    return {
        dotsMachine: store.dotsMachine
    }
};

const mapDispatchToProps = (dispatch) =>{
    return bindActionCreators({
        addDot: addDot,
        removeDot: removeDot,
        removeMultipleDots: removeMultipleDots,
        rezoneDot: rezoneDot,
        addMultipleDots: addMultipleDots,
        changeBase: changeBase,
        resetMachine: resetMachine,
        showHidePlaceValue: showHidePlaceValue,
        oneStepStabilize: oneStepStabilize,
        stabilize: stabilize,
        operandChanged: operandChanged
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
        rezoneDot:React.PropTypes.func.isRequired,
        addMultipleDots: React.PropTypes.func.isRequired,
        dotsMachine:React.PropTypes.shape({
            dots: React.PropTypes.array,
            machineState: React.PropTypes.shape({
                placeValueSwitch: React.PropTypes.bool.isRequired,
                baseSelectorDisplay: React.PropTypes.bool.isRequired,
                magicWandVisible: React.PropTypes.bool.isRequired,
                resetVisible: React.PropTypes.bool.isRequired,
                base: React.PropTypes.array.isRequired,
                dots: React.PropTypes.array,
                maxViewableDots: React.PropTypes.number.isRequired,
                mode: React.PropTypes.oneOf([MODE.DISPLAY, MODE.ADDITION, MODE.SUBTRACT, MODE.MULTIPLY, MODE.DIVIDE]).isRequired,
                zones: React.PropTypes.number.isRequired
            })
        })
    };

    constructor(props) {
        //console.log('DotsMachine constructor props', props);
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

    addDot(id, zone, position, isPositive) {
        this.props.addDot(id, zone, position, isPositive);
    }

    removeDot(id, zone, position){
        this.props.removeDot(id, zone, position);
    }

    removeMultipleDots(id, zone, amount){
        this.props.removeMultipleDots(id, zone, amount);
    }

    rezoneDot(id, zone, position){
        this.props.rezoneDot(id, zone, position);
    }

    addMultipleDots(id, zone, positions, isPositive){
        this.props.addMultipleDots(id, zone, positions, isPositive);
    }

    changeBase(){

    }

    operandChange(e, pos){
        if(e.target.value)
        this.props.operandChanged(this.id, pos, e.target.value);
    }

    render() {
        return (
            <div>
                <BaseSelector visible={this.props.dotsMachine.machineState.baseSelectorDisplay}
                              base={this.props.dotsMachine.machineState.base}
                              onClick={this.props.changeBase}/>
                <PlaceValueSwitch visible={this.props.dotsMachine.machineState.placeValueSwitch}
                                  onClick={this.props.showHidePlaceValue}/>
                <ResetButton visible={this.props.dotsMachine.machineState.resetVisible}
                             onClick={this.props.resetMachine}/>
                <MagicWand visible={this.props.dotsMachine.machineState.magicWandVisible}
                           onClick={this.props.oneStepStabilize}/>
                <ActivityDescriptor>
                    <Text mode={this.props.dotsMachine.machineState.mode} />
                    <Operand value={this.props.dotsMachine.machineState.operandA}
                             onChange={this.operandChange.bind(this)}
                             mode={this.props.dotsMachine.machineState.mode}
                             pos="A"/>
                    <Operator mode={this.props.dotsMachine.machineState.mode}/>
                    <Operand value={this.props.dotsMachine.machineState.operandB}
                             mode={this.props.dotsMachine.machineState.mode}
                             onChange={this.operandChange.bind(this)}
                             pos="B"/>
                    {/*<button>GO</button>*/}
                </ActivityDescriptor>
                <CanvasPIXI
                            id="0"
                            numZone={this.props.dotsMachine.machineState.zones}
                            dots={this.props.dotsMachine.dots}
                            base={this.props.dotsMachine.machineState.base}
                            mode={this.props.dotsMachine.machineState.mode}
                            addDot={this.addDot.bind(this)}
                            removeDot={this.removeDot.bind(this)}
                            rezoneDot={this.rezoneDot.bind(this)}
                            addMultipleDots={this.addMultipleDots.bind(this)}
                            removeMultipleDots={this.removeMultipleDots.bind(this)}
                            placeValueOn={this.props.dotsMachine.machineState.placeValueSwitch}
                            maxViewableDots={this.props.dotsMachine.machineState.maxViewableDots}/>

            </div>
        );
    }
}

export default DotsMachine;
