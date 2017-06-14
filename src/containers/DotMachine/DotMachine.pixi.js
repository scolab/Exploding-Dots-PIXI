import React from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { addDot, removeDot, rezoneDot, removeMultipleDots, addMultipleDots, changeBase,
    resetMachine, showHidePlaceValue, activateMagicWand, operandChanged,
    startActivity, startActivityDone, operatorChanged, error, userMessage,
    resetUserMessage, setDivisionResult } from '../../actions/';
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
import { OPERATOR_MODE, USAGE_MODE, OPERAND_POS } from '../../Constants';

const DotsMachine = (props) => {
  return (
    <div>
      <ErrorDisplay
        errorMessage={props.dotsMachine.machineState.errorMessage}
        onClose={props.resetMachine}
        title={props.dotsMachine.machineState.title}
      />
      <MessageDisplay
        userMessage={props.dotsMachine.machineState.userMessage}
        onClose={props.resetUserMessage}
      />
      <TopMenuItem>
        {props.dotsMachine.machineState.placeValueSwitchVisible === true &&
          <PlaceValueSwitch
            onClick={props.showHidePlaceValue}
          />
                    }
        {props.dotsMachine.machineState.baseSelectorVisible === true &&
          <BaseSelector
            base={props.dotsMachine.machineState.base}
            onClick={props.changeBase}
          />
                    }
        {props.dotsMachine.machineState.magicWandVisible === true &&
          <MagicWand
            onClick={props.activateMagicWand}
          />
                    }
        {props.dotsMachine.machineState.resetVisible === true &&
          <ResetButton
            onClick={() => props.resetMachine(null, props.dotsMachine.machineState.title)}
          />
                    }
      </TopMenuItem>
      <ActivityDescriptor>
        <Text
          operator_mode={props.dotsMachine.machineState.operator_mode}
          usage_mode={props.dotsMachine.machineState.usage_mode}
        />
        <Operand
          value={props.dotsMachine.machineState.operandA}
          onChange={props.operandChanged}
          operator_mode={props.dotsMachine.machineState.operator_mode}
          usage_mode={props.dotsMachine.machineState.usage_mode}
          pos={OPERAND_POS.LEFT}
          activityStarted={props.dotsMachine.machineState.activityStarted}
          base={props.dotsMachine.machineState.base}
          onEnter={props.startActivityFunc}
        />
        <Operator
          operator_mode={props.dotsMachine.machineState.operator_mode}
          usage_mode={props.dotsMachine.machineState.usage_mode}
          activityStarted={props.dotsMachine.machineState.activityStarted}
          onChange={props.operatorChanged}
        />
        <Operand
          value={props.dotsMachine.machineState.operandB}
          operator_mode={props.dotsMachine.machineState.operator_mode}
          usage_mode={props.dotsMachine.machineState.usage_mode}
          onChange={props.operandChanged}
          pos={OPERAND_POS.RIGHT}
          activityStarted={props.dotsMachine.machineState.activityStarted}
          base={props.dotsMachine.machineState.base}
          onEnter={props.startActivityFunc}
        />
        {props.dotsMachine.machineState.usage_mode === USAGE_MODE.OPERATION &&
        <GoButton
          onClick={props.startActivityFunc}
          activityStarted={props.dotsMachine.machineState.activityStarted}
        />
          }
      </ActivityDescriptor>
      <CanvasPIXI
        title={props.dotsMachine.machineState.title}
        totalZoneCount={props.dotsMachine.machineState.zones}
        dots={props.dotsMachine.dots}
        positivePowerZoneDots={props.dotsMachine.positivePowerZoneDots}
        negativePowerZoneDots={props.dotsMachine.negativePowerZoneDots}
        positiveDividerDots={props.dotsMachine.positiveDividerDots}
        negativeDividerDots={props.dotsMachine.negativeDividerDots}
        positiveDividerResult={props.dotsMachine.positiveDividerResult}
        negativeDividerResult={props.dotsMachine.negativeDividerResult}
        base={props.dotsMachine.machineState.base}
        operator_mode={props.dotsMachine.machineState.operator_mode}
        usage_mode={props.dotsMachine.machineState.usage_mode}
        magicWandIsActive={props.dotsMachine.machineState.magicWandIsActive}
        activateMagicWand={props.activateMagicWand}
        addDot={props.addDot}
        removeDot={props.removeDot}
        rezoneDot={props.rezoneDot}
        addMultipleDots={props.addMultipleDots}
        removeMultipleDots={props.removeMultipleDots}
        placeValueOn={props.dotsMachine.machineState.placeValueOn}
        cdnBaseUrl={props.dotsMachine.machineState.cdnBaseUrl}
        startActivityFunc={props.startActivityFunc}
        startActivity={props.dotsMachine.machineState.startActivity}
        startActivityDoneFunc={props.startActivityDoneFunc}
        activityStarted={props.dotsMachine.machineState.activityStarted}
        operandA={props.dotsMachine.machineState.operandA}
        operandB={props.dotsMachine.machineState.operandB}
        error={props.error}
        displayUserMessage={props.userMessage}
        userMessage={props.dotsMachine.machineState.userMessage}
        muted={props.dotsMachine.machineState.muted}
        wantedResult={props.dotsMachine.machineState.wantedResult}
        setDivisionResult={props.setDivisionResult}
        guideReminder={props.dotsMachine.machineState.guideReminder}
        guideFeedback={props.dotsMachine.machineState.guideFeedback}
      />
    </div>
  );
};

DotsMachine.propTypes = {
  addDot: PropTypes.func.isRequired,
  removeDot: PropTypes.func.isRequired,
  removeMultipleDots: PropTypes.func.isRequired,
  rezoneDot: PropTypes.func.isRequired,
  addMultipleDots: PropTypes.func.isRequired,
  setDivisionResult: PropTypes.func.isRequired,
  changeBase: PropTypes.func.isRequired,
  resetMachine: PropTypes.func.isRequired,
  showHidePlaceValue: PropTypes.func.isRequired,
  activateMagicWand: PropTypes.func.isRequired,
  operandChanged: PropTypes.func.isRequired,
  operatorChanged: PropTypes.func.isRequired,
  startActivityFunc: PropTypes.func.isRequired,
  startActivityDoneFunc: PropTypes.func.isRequired,
  error: PropTypes.func.isRequired,
  userMessage: PropTypes.func.isRequired,
  resetUserMessage: PropTypes.func.isRequired,
  dotsMachine: PropTypes.shape({
    dots: PropTypes.arrayOf(React.PropTypes.shape({
      x: PropTypes.number.isRequired, // eslint-disable-line react/no-unused-prop-types
      y: PropTypes.number.isRequired, // eslint-disable-line react/no-unused-prop-types
      powerZone: PropTypes.number.isRequired, // eslint-disable-line react/no-unused-prop-types
      id: PropTypes.string.isRequired, // eslint-disable-line react/no-unused-prop-types
      isPositive: PropTypes.bool.isRequired, // eslint-disable-line react/no-unused-prop-types
    })),
    positivePowerZoneDots: PropTypes.arrayOf(React.PropTypes.objectOf(React.PropTypes.shape({
      x: PropTypes.number.isRequired, // eslint-disable-line react/no-unused-prop-types
      y: PropTypes.number.isRequired, // eslint-disable-line react/no-unused-prop-types
      powerZone: PropTypes.number.isRequired, // eslint-disable-line react/no-unused-prop-types
      id: PropTypes.string.isRequired, // eslint-disable-line react/no-unused-prop-types
      isPositive: PropTypes.bool.isRequired, // eslint-disable-line react/no-unused-prop-types
    }))).isRequired,
    negativePowerZoneDots: PropTypes.arrayOf(React.PropTypes.objectOf(React.PropTypes.shape({
      x: PropTypes.number.isRequired, // eslint-disable-line react/no-unused-prop-types
      y: PropTypes.number.isRequired, // eslint-disable-line react/no-unused-prop-types
      powerZone: PropTypes.number.isRequired, // eslint-disable-line react/no-unused-prop-types
      id: PropTypes.string.isRequired, // eslint-disable-line react/no-unused-prop-types
      isPositive: PropTypes.bool.isRequired, // eslint-disable-line react/no-unused-prop-types
    }))).isRequired,
    positiveDividerDots: PropTypes.arrayOf(React.PropTypes.objectOf(React.PropTypes.shape({
      powerZone: PropTypes.number.isRequired, // eslint-disable-line react/no-unused-prop-types
      id: PropTypes.string.isRequired, // eslint-disable-line react/no-unused-prop-types
      isPositive: PropTypes.bool.isRequired, // eslint-disable-line react/no-unused-prop-types
    }))).isRequired,
    negativeDividerDots: PropTypes.arrayOf(React.PropTypes.objectOf(React.PropTypes.shape({
      powerZone: PropTypes.number.isRequired, // eslint-disable-line react/no-unused-prop-types
      id: PropTypes.string.isRequired, // eslint-disable-line react/no-unused-prop-types
      isPositive: PropTypes.bool.isRequired, // eslint-disable-line react/no-unused-prop-types
    }))).isRequired,
    positiveDividerResult: PropTypes.array.isRequired,
    negativeDividerResult: PropTypes.array.isRequired,
    machineState: PropTypes.shape({
      title: PropTypes.string.isRequired,
      placeValueSwitchVisible: PropTypes.bool.isRequired,
      baseSelectorVisible: PropTypes.bool.isRequired,
      magicWandVisible: PropTypes.bool.isRequired,
      magicWandIsActive: PropTypes.bool.isRequired,
      resetVisible: PropTypes.bool.isRequired,
      base: PropTypes.array.isRequired,
      operator_mode: PropTypes.oneOf([
        OPERATOR_MODE.DISPLAY,
        OPERATOR_MODE.ADD,
        OPERATOR_MODE.SUBTRACT,
        OPERATOR_MODE.MULTIPLY,
        OPERATOR_MODE.DIVIDE]).isRequired,
      usage_mode: PropTypes.oneOf([
        USAGE_MODE.EXERCISE,
        USAGE_MODE.FREEPLAY,
        USAGE_MODE.OPERATION,
      ]),
      zones: PropTypes.number.isRequired,
      placeValueOn: PropTypes.bool.isRequired,
      cdnBaseUrl: PropTypes.string.isRequired,
      startActivity: PropTypes.bool.isRequired,
      activityStarted: PropTypes.bool.isRequired,
      operandA: PropTypes.string.isRequired,
      operandB: PropTypes.string.isRequired,
      errorMessage: PropTypes.string.isRequired,
      userMessage: PropTypes.string.isRequired,
      muted: PropTypes.bool.isRequired,
      wantedResult: PropTypes.object.isRequired,
      guideReminder: PropTypes.string,
      guideFeedback: PropTypes.string,
    }),
  }),
};


const mapStateToProps = (store) => {
  return {
    dotsMachine: store.dotsMachine,
  };
};

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators({
    addDot,
    removeDot,
    removeMultipleDots,
    rezoneDot,
    addMultipleDots,
    changeBase,
    resetMachine,
    showHidePlaceValue,
    activateMagicWand,
    operandChanged,
    operatorChanged,
    startActivityFunc: startActivity,
    startActivityDoneFunc: startActivityDone,
    error,
    userMessage,
    resetUserMessage,
    setDivisionResult,
  }, dispatch);
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(DotsMachine);
