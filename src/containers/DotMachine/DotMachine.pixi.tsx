import React from 'react';
import { Component } from 'react';
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
import ToolMenu from '../../components/ToolMenu';
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

class DotsMachine extends Component<IProps, {}> {

  private machineDiv: HTMLDivElement;
  private placeHolder: HTMLDivElement;
  private placeholderImage = require('./images/loading.gif');
  private doubleArrow = require('../../components/images/double_arrows.png');

  constructor(props: IProps) {
    super(props);
  }

  public onMachineReady(): void {
    if (this.machineDiv) {
      this.machineDiv.style.visibility = 'visible';
      this.machineDiv.style.overflow = 'visible';
      this.placeHolder.style.display = 'none';
    }
  }

  public render(): JSX.Element {
    const negativePresent: boolean = this.props.dotsMachine.machineState.operator_mode === OPERATOR_MODE.SUBTRACT
      || this.props.dotsMachine.machineState.operator_mode === OPERATOR_MODE.DIVIDE
      || this.props.dotsMachine.machineState.base[1] === BASE.BASE_X;
    return (
      <div>
        <PlaceHolderDiv
          innerRef={(placeholder) => {
            this.placeHolder = placeholder as HTMLDivElement;
          }}
        >
          <PlaceHolderImg
            src={this.placeholderImage}
            role='presentation'
          />
        </PlaceHolderDiv>
        <AllMachineDiv
          innerRef={(machineDiv) => { this.machineDiv = machineDiv as HTMLDivElement; }}
        >
          <ActivityDescriptor>
            {this.props.dotsMachine.machineState.numberValueVisible === true &&
            <Operand
              value={this.props.dotsMachine.machineState.operandA}
              onChange={this.props.operandChanged}
              operator_mode={this.props.dotsMachine.machineState.operator_mode}
              usage_mode={this.props.dotsMachine.machineState.usage_mode}
              pos={OPERAND_POS.LEFT}
              activityStarted={this.props.dotsMachine.machineState.activityStarted}
              base={this.props.dotsMachine.machineState.base}
              onEnter={this.props.startActivityFunc}
            />
            }
            {this.props.dotsMachine.machineState.numberValueVisible === true &&
            <Operator
              operator_mode={this.props.dotsMachine.machineState.operator_mode}
              usage_mode={this.props.dotsMachine.machineState.usage_mode}
              activityStarted={this.props.dotsMachine.machineState.activityStarted}
            />
            }
            {(this.props.dotsMachine.machineState.operator_mode !== OPERATOR_MODE.DISPLAY &&
              this.props.dotsMachine.machineState.numberValueVisible) &&
            <Operand
              value={this.props.dotsMachine.machineState.operandB}
              operator_mode={this.props.dotsMachine.machineState.operator_mode}
              usage_mode={this.props.dotsMachine.machineState.usage_mode}
              onChange={this.props.operandChanged}
              pos={OPERAND_POS.RIGHT}
              activityStarted={this.props.dotsMachine.machineState.activityStarted}
              base={this.props.dotsMachine.machineState.base}
              onEnter={this.props.startActivityFunc}
            />
            }
            {((this.props.dotsMachine.machineState.usage_mode === USAGE_MODE.EXERCISE &&
              this.props.dotsMachine.machineState.operator_mode !== OPERATOR_MODE.DISPLAY) &&
              this.props.dotsMachine.machineState.operator_mode !== OPERATOR_MODE.DIVIDE &&
              this.props.dotsMachine.machineState.numberValueVisible) &&
            <ArrowImg
              src={this.doubleArrow}
              role='presentation'
            />
            }
            {((this.props.dotsMachine.machineState.operator_mode === OPERATOR_MODE.DISPLAY ||
              this.props.dotsMachine.machineState.usage_mode === USAGE_MODE.EXERCISE)
              && this.props.dotsMachine.machineState.operator_mode !== OPERATOR_MODE.DIVIDE &&
              this.props.dotsMachine.machineState.machineCodeVisible) &&
            <ValueBoxes
              positivePowerZoneDots={this.props.dotsMachine.positivePowerZoneDots}
              negativePowerZoneDots={this.props.dotsMachine.negativePowerZoneDots}
              base={this.props.dotsMachine.machineState.base}
              isInline={true}
              negativePresent={negativePresent}
            />
            }
            {this.props.dotsMachine.machineState.usage_mode === USAGE_MODE.OPERATION &&
            <GoButton
              onClick={this.props.startActivityFunc}
              activityStarted={this.props.dotsMachine.machineState.activityStarted}
            />
            }
          </ActivityDescriptor>
          {((this.props.dotsMachine.machineState.operator_mode !== OPERATOR_MODE.DISPLAY &&
            this.props.dotsMachine.machineState.usage_mode !== USAGE_MODE.EXERCISE)
            && this.props.dotsMachine.machineState.operator_mode !== OPERATOR_MODE.DIVIDE) &&
          <ValueContainerDiv>
            <ValueBoxes
              positivePowerZoneDots={this.props.dotsMachine.positivePowerZoneDots}
              negativePowerZoneDots={this.props.dotsMachine.negativePowerZoneDots}
              base={this.props.dotsMachine.machineState.base}
              isInline={false}
              negativePresent={negativePresent}
            />
          </ValueContainerDiv>
          }
          {this.props.dotsMachine.machineState.operator_mode === OPERATOR_MODE.DIVIDE &&
          <DivisionResult
            operandA={this.props.dotsMachine.machineState.operandA}
            operandB={this.props.dotsMachine.machineState.operandB}
            positivePowerZoneDots={this.props.dotsMachine.positivePowerZoneDots}
            negativePowerZoneDots={this.props.dotsMachine.negativePowerZoneDots}
            positiveDividerResult={this.props.dotsMachine.positiveDividerResult}
            negativeDividerResult={this.props.dotsMachine.negativeDividerResult}
            base={this.props.dotsMachine.machineState.base}
            usage_mode={this.props.dotsMachine.machineState.usage_mode}
            activityStarted={this.props.dotsMachine.machineState.activityStarted}
            success={this.props.dotsMachine.machineState.success}
          />
          }
          <CanvasPIXI
            title={this.props.dotsMachine.machineState.title}
            totalZoneCount={this.props.dotsMachine.machineState.zones}
            positivePowerZoneDots={this.props.dotsMachine.positivePowerZoneDots}
            negativePowerZoneDots={this.props.dotsMachine.negativePowerZoneDots}
            positiveDividerDots={this.props.dotsMachine.positiveDividerDots}
            negativeDividerDots={this.props.dotsMachine.negativeDividerDots}
            positiveDividerResult={this.props.dotsMachine.positiveDividerResult}
            negativeDividerResult={this.props.dotsMachine.negativeDividerResult}
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
            startActivityFunc={this.props.startActivityFunc}
            startActivity={this.props.dotsMachine.machineState.startActivity}
            startActivityDoneFunc={this.props.startActivityDoneFunc}
            activityStarted={this.props.dotsMachine.machineState.activityStarted}
            operandA={this.props.dotsMachine.machineState.operandA}
            operandB={this.props.dotsMachine.machineState.operandB}
            error={this.props.error}
            displayUserMessageAction={this.props.dotsMachine.machineState.displayUserMessageAction}
            muted={this.props.dotsMachine.machineState.muted}
            wantedResult={this.props.dotsMachine.machineState.wantedResult}
            setDivisionResult={this.props.setDivisionResult}
            successAction={this.props.dotsMachine.machineState.successAction}
            activitySuccessFunc={this.props.successFunction}
            success={this.props.dotsMachine.machineState.success}
            isReady={this.onMachineReady.bind(this)}
          />
          <ToolMenu
            operatorMode={this.props.dotsMachine.machineState.operator_mode}
          >
            {this.props.dotsMachine.machineState.placeValueSwitchVisible === true &&
            <PlaceValueSwitch
              onClick={this.props.showHidePlaceValue}
              placeValueOn={this.props.dotsMachine.machineState.placeValueOn}
            />
            }
            <ResetButton
              onClick={() => this.props.resetMachine(null, this.props.dotsMachine.machineState.title)}
              resetAction={this.props.dotsMachine.machineState.resetAction}
              title={this.props.dotsMachine.machineState.title}
              visible={this.props.dotsMachine.machineState.resetVisible}
            />
            {this.props.dotsMachine.machineState.magicWandVisible === true &&
            <MagicWand
              onClick={this.props.activateMagicWand}
              hidden={this.props.dotsMachine.machineState.success}
            />
            }
            {this.props.dotsMachine.machineState.baseSwitchVisible === true &&
            <BaseSelector
              base={this.props.dotsMachine.machineState.base}
              onClick={this.props.changeBase}
              allBase={this.props.dotsMachine.machineState.allBases}
            />
            }
          </ToolMenu>
        </AllMachineDiv>
      </div>
    );
  }
}

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
      allBases: any[];
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

const ArrowImg = styled.img`
 ${operationItem}
  margin-bottom: -2px;
  width: 30px;
  height: auto;
`;

const AllMachineDiv = styled.div`
  visibility: hidden;
  overflow: hidden;
`;

const PlaceHolderDiv = styled.div`
  padding-bottom: 36.8%;
  position: relative;
  width: 100%;
`;
const PlaceHolderImg = styled.img`
  display: block;
  position: absolute;
  margin: -10% 0 0 -10%;
  left: 50%;
  width: 20%;
  height: auto;
  top: 50%;
`;
