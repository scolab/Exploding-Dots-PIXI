import { ACTIONS } from './StoreConstants';
import Point = PIXI.Point;
import ObservablePoint = PIXI.ObservablePoint;
import {DotVO} from '../VO/DotVO';
import {IMachineState} from '../reducers/DotsReducer';

export const addDot = (zoneId: number,
                       position: number[],
                       isPositive: boolean,
                       color: string,
                       actionType: string) => ({
  type: ACTIONS.ADD_DOT,
  zoneId,
  position,
  isPositive,
  color,
  actionType,
});

export const removeDot = (zoneId: number,
                          dotId: string) => ({
  type: ACTIONS.REMOVE_DOT,
  zoneId,
  dotId,
});

export const addMultipleDots = (zoneId: number,
                                dotsPos: Point[],
                                isPositive: boolean,
                                color: string,
                                dropPosition: Point | ObservablePoint) => ({
  type: ACTIONS.ADD_MULTIPLE_DOTS,
  zoneId,
  dotsPos,
  isPositive,
  color,
  dropPosition,
});

export const removeMultipleDots = (zoneId: number,
                                   dots: DotVO[],
                                   updateValue: boolean) => ({
  type: ACTIONS.REMOVE_MULTIPLE_DOTS,
  zoneId,
  dots,
  updateValue,
});

export const rezoneDot = (zoneId: number,
                          dot: DotVO,
                          updateValue: boolean) => ({
  type: ACTIONS.REZONE_DOT,
  zoneId,
  dot,
  updateValue,
});

export const setDivisionResult = (zoneId: number,
                                  divisionValue: number,
                                  isPositive: boolean) => ({
  type: ACTIONS.SET_DIVISION_RESULT,
  zoneId,
  divisionValue,
  isPositive,
});

export const changeBase = () => ({
  type: ACTIONS.BASE_CHANGED,
});

export const resetMachine = (machineState: IMachineState,
                             title: string) => ({
  type: ACTIONS.RESET,
  machineState,
  title,
});

export const showHidePlaceValue = () => ({
  type: ACTIONS.SHOW_HIDE_PLACE_VALUE,
});

export const activateMagicWand = (active: boolean) => ({
  type: ACTIONS.ACTIVATE_MAGIC_WAND,
  active,
});

export const operandChanged = (operandPos: string,
                               value: string) => ({
  type: ACTIONS.OPERAND_CHANGED,
  operandPos,
  value,
});

/*export const operatorChanged = (value) => ({
  type: ACTIONS.OPERATOR_CHANGED,
  value,
});*/

export const startActivity = () => ({
  type: ACTIONS.START_ACTIVITY,
});

export const startActivityDone = (dotsInfo: DotVO[],
                                  totalA: string,
                                  totalB: string,
                                  divider: DotVO[]) => ({
  type: ACTIONS.START_ACTIVITY_DONE,
  dotsInfo,
  totalA,
  totalB,
  divider,
});

export const error = () => ({
  type: ACTIONS.ERROR,
});
