import { ACTIONS } from './StoreConstants';

export const addDot = (zoneId, position, isPositive, color, actionType) => ({
  type: ACTIONS.ADD_DOT,
  zoneId,
  position,
  isPositive,
  color,
  actionType,
});

export const removeDot = (zoneId, dotId) => ({
  type: ACTIONS.REMOVE_DOT,
  zoneId,
  dotId,
});

export const addMultipleDots = (zoneId, dotsPos, isPositive, color, dropPosition) => ({
  type: ACTIONS.ADD_MULTIPLE_DOTS,
  zoneId,
  dotsPos,
  isPositive,
  color,
  dropPosition,
});

export const removeMultipleDots = (zoneId, dots, updateValue) => ({
  type: ACTIONS.REMOVE_MULTIPLE_DOTS,
  zoneId,
  dots,
  updateValue,
});

export const rezoneDot = (zoneId, dot, updateValue) => ({
  type: ACTIONS.REZONE_DOT,
  zoneId,
  dot,
  updateValue,
});

export const setDivisionResult = (zoneId, divisionValue, isPositive) => ({
  type: ACTIONS.SET_DIVISION_RESULT,
  zoneId,
  divisionValue,
  isPositive,
});

export const changeBase = () => ({
  type: ACTIONS.BASE_CHANGED,
});

export const resetMachine = (machineState, title) => ({
  type: ACTIONS.RESET,
  machineState,
  title
});

export const showHidePlaceValue = () => ({
  type: ACTIONS.SHOW_HIDE_PLACE_VALUE,
});

export const activateMagicWand = (active) => ({
  type: ACTIONS.ACTIVATE_MAGIC_WAND,
  active,
});

export const operandChanged = (operandPos, value) => ({
  type: ACTIONS.OPERAND_CHANGED,
  operandPos,
  value,
});

export const operatorChanged = (value) => ({
  type: ACTIONS.OPERATOR_CHANGED,
  value,
});

export const startActivity = () => ({
  type: ACTIONS.START_ACTIVITY,
});

export const startActivityDone = (dotsInfo, totalA, totalB, divider) => ({
  type: ACTIONS.START_ACTIVITY_DONE,
  dotsInfo,
  totalA,
  totalB,
  divider,
});

export const error = (errorMessage) => ({
  type: ACTIONS.ERROR,
  errorMessage,
});

export const userMessage = (message) => ({
  type: ACTIONS.USER_MESSAGE,
  message,
});

export const resetUserMessage = () => ({
  type: ACTIONS.RESET_USER_MESSAGE,
});