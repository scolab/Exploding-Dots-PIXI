import React, {Component, PropTypes} from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import { addDot, removeDot, rezoneDot, removeMultipleDots, addMultipleDots, changeBase, resetMachine,
    showHidePlaceValue, activateMagicWand, stabilize, operandChanged, startActivity, startActivityDone,
    operatorChanged, error, userMessage, resetUserMessage} from '../../actions/'
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
import ErrorDisplay from '../../components/ErrorDisplay';
import MessageDisplay from '../../components/MessageDisplay';
import {OPERATOR_MODE, USAGE_MODE, OPERAND_POS} from '../../Constants';

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
        operatorChanged: operatorChanged,
        startActivity: startActivity,
        startActivityDone: startActivityDone,
        error: error,
        userMessage: userMessage,
        resetUserMessage: resetUserMessage,
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
            machineState: PropTypes.shape({
                placeValueSwitchVisible: PropTypes.bool.isRequired,
                baseSelectorVisible: PropTypes.bool.isRequired,
                magicWandVisible: PropTypes.bool.isRequired,
                magicWandIsActive: PropTypes.bool.isRequired,
                resetVisible: PropTypes.bool.isRequired,
                loginVisible: PropTypes.bool.isRequired,
                base: PropTypes.array.isRequired,
                maxViewableDots: PropTypes.number.isRequired,
                operator_mode: PropTypes.oneOf([OPERATOR_MODE.DISPLAY, OPERATOR_MODE.ADDITION, OPERATOR_MODE.SUBTRACT, OPERATOR_MODE.MULTIPLY, OPERATOR_MODE.DIVIDE]).isRequired,
                zones: PropTypes.number.isRequired,
                placeValueOn: PropTypes.bool.isRequired,
                cdnBaseUrl: PropTypes.string.isRequired,
                startActivity: PropTypes.bool.isRequired,
                activityStarted: PropTypes.bool.isRequired,
                operandA: PropTypes.string.isRequired,
                operandB: PropTypes.string.isRequired,
                errorMessage: PropTypes.string.isRequired,
                userMessage: PropTypes.string.isRequired,
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

    render() {
        //console.log('render', this.props);
        return (
            <div>
                <ErrorDisplay errorMessage={this.props.dotsMachine.machineState.errorMessage}
                                onClose={this.props.resetMachine}/>
                <MessageDisplay userMessage={this.props.dotsMachine.machineState.userMessage}
                              onClose={this.props.resetUserMessage}/>
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
                                     onClick={() => this.props.resetMachine()}/>
                    }
                </TopMenuItem>
                <ActivityDescriptor>
                    <Text operator_mode={this.props.dotsMachine.machineState.operator_mode}
                          usage_mode={this.props.dotsMachine.machineState.usage_mode}
                    />
                    <Operand value={this.props.dotsMachine.machineState.operandA}
                             onChange={this.props.operandChanged}
                             operator_mode={this.props.dotsMachine.machineState.operator_mode}
                             usage_mode={this.props.dotsMachine.machineState.usage_mode}
                             pos={OPERAND_POS.LEFT}
                             activityStarted={this.props.dotsMachine.machineState.activityStarted}
                    />
                    <Operator operator_mode={this.props.dotsMachine.machineState.operator_mode}
                              usage_mode={this.props.dotsMachine.machineState.usage_mode}
                              activityStarted={this.props.dotsMachine.machineState.activityStarted}
                              onChange={this.props.operatorChanged}
                    />
                    <Operand value={this.props.dotsMachine.machineState.operandB}
                             operator_mode={this.props.dotsMachine.machineState.operator_mode}
                             usage_mode={this.props.dotsMachine.machineState.usage_mode}
                             onChange={this.props.operandChanged}
                             pos={OPERAND_POS.RIGHT}
                             activityStarted={this.props.dotsMachine.machineState.activityStarted}
                    />
                    {this.props.dotsMachine.machineState.usage_mode === USAGE_MODE.OPERATION &&
                        <GoButton onClick={this.props.startActivity} activityStarted={this.props.dotsMachine.machineState.activityStarted}>GO</GoButton>
                    }
                </ActivityDescriptor>
                <CanvasPIXI
                    totalZoneCount={this.props.dotsMachine.machineState.zones}
                    dots={this.props.dotsMachine.dots}
                    positivePowerZoneDots={this.props.dotsMachine.positivePowerZoneDots}
                    negativePowerZoneDots={this.props.dotsMachine.negativePowerZoneDots}
                    positiveDividerDots={this.props.dotsMachine.positiveDividerDots}
                    negativeDividerDots={this.props.dotsMachine.negativeDividerDots}
                    base={this.props.dotsMachine.machineState.base}
                    operator_mode={this.props.dotsMachine.machineState.operator_mode}
                    usage_mode={this.props.dotsMachine.machineState.usage_mode}
                    magicWandIsActive={this.props.dotsMachine.machineState.magicWandIsActive}
                    activateMagicWand={this.props.activateMagicWand}
                    addDot={this.props.addDot}
                    removeDot={this.props.removeDot}
                    rezoneDot={this.props.rezoneDot}
                    addMultipleDots={this.props.addMultipleDots}
                    removeMultipleDots={this.props.removeMultipleDots}
                    placeValueOn={this.props.dotsMachine.machineState.placeValueOn}
                    cdnBaseUrl={this.props.dotsMachine.machineState.cdnBaseUrl}
                    maxViewableDots={this.props.dotsMachine.machineState.maxViewableDots}
                    startActivity={this.props.dotsMachine.machineState.startActivity}
                    activityStarted={this.props.startActivityDone}
                    operandA={this.props.dotsMachine.machineState.operandA}
                    operandB={this.props.dotsMachine.machineState.operandB}
                    error={this.props.error}
                    displayUserMessage={this.props.userMessage}
                    userMessage={this.props.dotsMachine.machineState.userMessage}
                />

            </div>
        );
    }
}

export default DotsMachine;
