import React, {Component, PropTypes} from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import { addDot, removeDot, rezoneDot, removeMultipleDots, addMultipleDots, changeBase, resetMachine, showHidePlaceValue, activateMagicWand, stabilize, operandChanged, startActivity} from '../../actions/'
import CanvasPIXI from '../../components/CanvasPIXI/Canvas.Pixi';
import BaseSelector from '../../components/BaseSelector';
import PlaceValueSwitch from '../../components/PlaceValueSwitch';
import ResetButton from '../../components/ResetButton';
import MagicWand from '../../components/MagicWand';
import TopMenuItem from '../../components/TopMenuItem';
import ActivityDescriptor from '../../components/ActivityDescriptor';
import Operand from '../../components/Operand';
import Operator from '../../components/Operator';
import Text from '../../components/Text';
import GoButton from '../../components/GoButton';
import Login from '../../components/Login';
import {OPERATOR_MODE, OPERAND_POS} from '../../Constants';

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
        activateMagicWand: activateMagicWand,
        stabilize: stabilize,
        operandChanged: operandChanged,
        startActivity: startActivity
    }, dispatch);
};

@connect(
    mapStateToProps,
    mapDispatchToProps
)

class DotsMachine extends Component {

    static propTypes = {
        addDot: PropTypes.func.isRequired,
        removeDot:PropTypes.func.isRequired,
        rezoneDot:PropTypes.func.isRequired,
        addMultipleDots: PropTypes.func.isRequired,
        dotsMachine:PropTypes.shape({
            dots: PropTypes.arrayOf(React.PropTypes.shape({
                x: PropTypes.number.isRequired,
                y: PropTypes.number.isRequired,
                powerZone: PropTypes.number.isRequired,
                id: PropTypes.string.isRequired,
                isPositive: PropTypes.bool.isRequired,
            })),
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
            machineState: PropTypes.shape({
                placeValueSwitchVisible: PropTypes.bool.isRequired,
                baseSelectorVisible: PropTypes.bool.isRequired,
                magicWandVisible: PropTypes.bool.isRequired,
                magicWandIsActive: PropTypes.bool.isRequired,
                resetVisible: PropTypes.bool.isRequired,
                base: PropTypes.array.isRequired,
                maxViewableDots: PropTypes.number.isRequired,
                operator_mode: PropTypes.oneOf([OPERATOR_MODE.DISPLAY, OPERATOR_MODE.ADDITION, OPERATOR_MODE.SUBTRACT, OPERATOR_MODE.MULTIPLY, OPERATOR_MODE.DIVIDE]).isRequired,
                zones: PropTypes.number.isRequired
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
        //console.log('render', this.props.dotsMachine.machineState);
        return (
            <div>
                <TopMenuItem>
                    {this.props.dotsMachine.machineState.placeValueSwitchVisible === true &&
                        <PlaceValueSwitch visible={this.props.dotsMachine.machineState.placeValueSwitchVisible}
                                      onClick={this.props.showHidePlaceValue}/>
                    }
                    {this.props.dotsMachine.machineState.baseSelectorVisible === true &&
                        <BaseSelector base={this.props.dotsMachine.machineState.base}
                                  onClick={this.props.changeBase}/>
                    }
                    {this.props.dotsMachine.machineState.magicWandVisible === true &&
                        <MagicWand visible={this.props.dotsMachine.machineState.magicWandVisible}
                               onClick={this.props.activateMagicWand}/>
                    }
                    {this.props.dotsMachine.machineState.resetVisible === true &&
                        <ResetButton visible={this.props.dotsMachine.machineState.resetVisible}
                                 onClick={this.props.resetMachine}/>
                    }
                </TopMenuItem>
                <ActivityDescriptor>
                    <Text mode={this.props.dotsMachine.machineState.operator_mode} />
                    <Operand value={this.props.dotsMachine.machineState.operandA}
                             onChange={this.operandChange.bind(this)}
                             operator_mode={this.props.dotsMachine.machineState.operator_mode}
                             usage_mode={this.props.dotsMachine.machineState.usage_mode}
                             pos={OPERAND_POS.LEFT}/>
                    <Operator operator_mode={this.props.dotsMachine.machineState.operator_mode}/>
                    <Operand value={this.props.dotsMachine.machineState.operandB}
                             operator_mode={this.props.dotsMachine.machineState.operator_mode}
                             usage_mode={this.props.dotsMachine.machineState.usage_mode}
                             onChange={this.operandChange.bind(this)}
                             pos={OPERAND_POS.RIGHT}/>
                    <GoButton onClick={this.props.startActivity}>GO</GoButton>
                </ActivityDescriptor>
                <CanvasPIXI
                            id="0"
                            numZone={this.props.dotsMachine.machineState.zones}
                            dots={this.props.dotsMachine.dots}
                            positivePowerZoneDots={this.props.dotsMachine.positivePowerZoneDots}
                            negativePowerZoneDots={this.props.dotsMachine.negativePowerZoneDots}
                            base={this.props.dotsMachine.machineState.base}
                            operator_mode={this.props.dotsMachine.machineState.operator_mode}
                            usage_mode={this.props.dotsMachine.machineState.usage_mode}
                            magicWandIsActive={this.props.dotsMachine.machineState.magicWandIsActive}
                            activateMagicWand={this.props.activateMagicWand}
                            addDot={this.addDot.bind(this)}
                            removeDot={this.removeDot.bind(this)}
                            rezoneDot={this.rezoneDot.bind(this)}
                            addMultipleDots={this.addMultipleDots.bind(this)}
                            removeMultipleDots={this.removeMultipleDots.bind(this)}
                            placeValueOn={this.props.dotsMachine.machineState.placeValueSwitchVisible}
                            maxViewableDots={this.props.dotsMachine.machineState.maxViewableDots}/>

            </div>
        );
    }
}

export default DotsMachine;
