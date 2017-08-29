import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { addDot, removeDot, rezoneDot, removeMultipleDots, addMultipleDots, changeBase,
    resetMachine, showHidePlaceValue, activateMagicWand, operandChanged,
    startActivity, startActivityDone, error, setDivisionResult, successFunction } from '../../actions/';
import CanvasPIXI from '../../components/CanvasPIXI/Canvas.Pixi';
import BaseSelector from '../../components/BaseSelector';
import PlaceValueSwitch from '../../components/PlaceValueSwitch';
import ResetButton from '../../components/ResetButton';
import MagicWand from '../../components/MagicWand';
import TopMenuItem from '../../components/TopMenuItem';
import ActivityDescriptor from '../../components/ActivityDescriptor';
import Operand from '../../components/Operand';
import Operator from '../../components/Operator';
import ValueBoxes from '../../components/ValueBoxes';
import GoButton from '../../components/GoButton';
import DivisionResult from '../../components/DivisionResult';
import { USAGE_MODE, OPERAND_POS, IUSAGE_MODE, IOPERATOR_MODE, OPERATOR_MODE, BASE } from '../../Constants';
import {DotVO} from '../../VO/DotVO';
import {DividerDotVO} from '../../VO/DividerDotVO';
import ObservablePoint = PIXI.ObservablePoint;
import Point = PIXI.Point;
import { IMachineState } from '../../reducers/DotsReducer';
import styled from 'styled-components';
import { operationItem } from '../../components/StylesForComponents';

const DotsMachine = (props: IProps) => {
  const negativePresent: boolean = props.dotsMachine.machineState.operator_mode === OPERATOR_MODE.SUBTRACT
    || props.dotsMachine.machineState.operator_mode === OPERATOR_MODE.DIVIDE
    || props.dotsMachine.machineState.base[1] === BASE.BASE_X;
  return (
    <div>
      <TopMenuItem>
        {props.dotsMachine.machineState.placeValueSwitchVisible === true &&
          <PlaceValueSwitch
            onClick={props.showHidePlaceValue}
          />
        }
        {props.dotsMachine.machineState.baseSwitchVisible === true &&
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
        <ResetButton
          onClick={() => props.resetMachine(null, props.dotsMachine.machineState.title)}
          resetAction={props.dotsMachine.machineState.resetAction}
          title={props.dotsMachine.machineState.title}
          visible={props.dotsMachine.machineState.resetVisible}
        />
      </TopMenuItem>
      <ActivityDescriptor>
        {props.dotsMachine.machineState.numberValueVisible === true &&
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
        }
        {props.dotsMachine.machineState.numberValueVisible === true &&
        <Operator
          operator_mode={props.dotsMachine.machineState.operator_mode}
          usage_mode={props.dotsMachine.machineState.usage_mode}
          activityStarted={props.dotsMachine.machineState.activityStarted}
        />
        }
        {(props.dotsMachine.machineState.operator_mode !== OPERATOR_MODE.DISPLAY &&
          props.dotsMachine.machineState.numberValueVisible) &&
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
        }
        {((props.dotsMachine.machineState.usage_mode === USAGE_MODE.EXERCISE &&
          props.dotsMachine.machineState.operator_mode !== OPERATOR_MODE.DISPLAY) &&
          props.dotsMachine.machineState.operator_mode !== OPERATOR_MODE.DIVIDE &&
          props.dotsMachine.machineState.numberValueVisible) &&
        <ArrowDiv>
          ↔
        </ArrowDiv>
        }
        {((props.dotsMachine.machineState.operator_mode === OPERATOR_MODE.DISPLAY ||
          props.dotsMachine.machineState.usage_mode === USAGE_MODE.EXERCISE)
          && props.dotsMachine.machineState.operator_mode !== OPERATOR_MODE.DIVIDE &&
          props.dotsMachine.machineState.machineCodeVisible) &&
        <ValueBoxes
          positivePowerZoneDots={props.dotsMachine.positivePowerZoneDots}
          negativePowerZoneDots={props.dotsMachine.negativePowerZoneDots}
          base={props.dotsMachine.machineState.base}
          isInline={true}
          negativePresent={negativePresent}
        />
        }
        {props.dotsMachine.machineState.usage_mode === USAGE_MODE.OPERATION &&
        <GoButton
          onClick={props.startActivityFunc}
          activityStarted={props.dotsMachine.machineState.activityStarted}
        />
        }
      </ActivityDescriptor>
      {((props.dotsMachine.machineState.operator_mode !== OPERATOR_MODE.DISPLAY &&
        props.dotsMachine.machineState.usage_mode !== USAGE_MODE.EXERCISE)
        && props.dotsMachine.machineState.operator_mode !== OPERATOR_MODE.DIVIDE) &&
        <ValueContainerDiv>
          <ValueBoxes
            positivePowerZoneDots={props.dotsMachine.positivePowerZoneDots}
            negativePowerZoneDots={props.dotsMachine.negativePowerZoneDots}
            base={props.dotsMachine.machineState.base}
            isInline={false}
            negativePresent={negativePresent}
          />
        </ValueContainerDiv>
      }
      {props.dotsMachine.machineState.operator_mode === OPERATOR_MODE.DIVIDE &&
      <ValueContainerDiv>
        <DivisionResult
          operandA={props.dotsMachine.machineState.operandA}
          operandB={props.dotsMachine.machineState.operandB}
          positivePowerZoneDots={props.dotsMachine.positivePowerZoneDots}
          negativePowerZoneDots={props.dotsMachine.negativePowerZoneDots}
          positiveDividerResult={props.dotsMachine.positiveDividerResult}
          negativeDividerResult={props.dotsMachine.negativeDividerResult}
          base={props.dotsMachine.machineState.base}
          usage_mode={props.dotsMachine.machineState.usage_mode}
          activityStarted={props.dotsMachine.machineState.activityStarted}
          success={props.dotsMachine.machineState.success}
        />
      </ValueContainerDiv>
      }
      <CanvasPIXI
        title={props.dotsMachine.machineState.title}
        totalZoneCount={props.dotsMachine.machineState.zones}
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
        displayUserMessageAction={props.dotsMachine.machineState.displayUserMessageAction}
        muted={props.dotsMachine.machineState.muted}
        wantedResult={props.dotsMachine.machineState.wantedResult}
        setDivisionResult={props.setDivisionResult}
        successAction={props.dotsMachine.machineState.successAction}
        activitySuccessFunc={props.successFunction}
        success={props.dotsMachine.machineState.success}
      />
    </div>
  );
};

interface IProps {
  readonly addDot: (zoneId: number,
                    position: number[],
                    isPositive: boolean,
                    color?: string,
                    actionType?: string) => any;
  readonly removeDot: (zoneId: number,
                       dotId: string) => any;
  readonly removeMultipleDots: (zoneId: number,
                                dots: DotVO[],
                                updateValue: boolean) => any;
  readonly rezoneDot: (zoneId: number,
                       dot: DotVO,
                       updateValue: boolean) => any;
  readonly addMultipleDots: (zoneId: number,
                             dotsPos: Point[],
                             isPositive: boolean,
                             color: string,
                             dropPosition: Point | ObservablePoint) => any;
  readonly setDivisionResult: (zoneId: number,
                               divisionValue: number,
                               isPositive: boolean) => any;
  readonly changeBase: () => any;
  readonly resetMachine: (machineState: IMachineState | null,
                          title: string) => any;
  readonly showHidePlaceValue: () => any;
  readonly activateMagicWand: (active: boolean) => any;
  readonly operandChanged: (operandPos: string,
                            value: string) => any;
  readonly startActivityFunc: () => any;
  readonly startActivityDoneFunc: (dotsInfo: DotVO[],
                                   totalA: string,
                                   totalB?: string,
                                   divider?: DotVO[]) => any;
  readonly successFunction: () => any;
  readonly error: () => any;
  dotsMachine: {
    dots: Array<{
      x: number,
      y: number,
      powerZone: number,
      id: string,
      isPositive: boolean,
    }>,
    positivePowerZoneDots: Array<IDotVOHash<DotVO>>;
    negativePowerZoneDots: Array<IDotVOHash<DotVO>>;
    positiveDividerDots: Array<IDividerDotVOHash<DividerDotVO>>;
    negativeDividerDots: Array<IDividerDotVOHash<DividerDotVO>>;
    positiveDividerResult: number[];
    negativeDividerResult: number[];
    machineState: {
      title: string;
      placeValueSwitchVisible: boolean;
      magicWandVisible: boolean;
      magicWandIsActive: boolean;
      resetVisible: boolean;
      baseSwitchVisible: boolean;
      numberValueVisible: boolean;
      machineCodeVisible: boolean;
      base: Array<number | string>;
      operator_mode: IOPERATOR_MODE;
      usage_mode: IUSAGE_MODE;
      zones: number;
      placeValueOn: boolean;
      cdnBaseUrl: string;
      startActivity: boolean;
      activityStarted: boolean;
      operandA: string;
      operandB: string;
      errorMessage: string;
      muted: boolean;
      wantedResult: IWantedResult;
      success: boolean;
      successAction: (name: string) => any;
      resetAction: (name: string) => any;
      displayUserMessageAction: (message: string) => any;
    };
  };
}

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
    startActivityFunc: startActivity,
    startActivityDoneFunc: startActivityDone,
    error,
    setDivisionResult,
    successFunction,
  }, dispatch);
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(DotsMachine);

const ValueContainerDiv = styled.div`
  text-align: center;
  margin-top: 20px;
`;

const ArrowDiv = styled.div`
      ${operationItem}
      font-family: Noto Sans;
      font-size: 50px;
      font-weight: bold;
      margin-top: 2px;
    `;
