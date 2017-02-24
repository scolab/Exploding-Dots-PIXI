import {ACTIONS} from './StoreConstants';

export const addDot = (zoneId, position, isPositive) => ({
    type: ACTIONS.ADD_DOT,
    zoneId,
    position,
    isPositive
});

export const removeDot = (zoneId, dotId) => ({
    type: ACTIONS.REMOVE_DOT,
    zoneId,
    dotId
});

export const addMultipleDots = (zoneId, dotsPos, isPositive, updateValue) => ({
    type: ACTIONS.ADD_MULTIPLE_DOTS,
    zoneId,
    dotsPos,
    isPositive,
    updateValue
});

export const removeMultipleDots = (zoneId, dots, updateValue) => ({
    type: ACTIONS.REMOVE_MULTIPLE_DOTS,
    zoneId,
    dots,
    updateValue
});

export const rezoneDot = (zoneId, dot, updateValue) => ({
    type: ACTIONS.REZONE_DOT,
    zoneId,
    dot,
    updateValue
});

export const changeBase = () =>({
    type: ACTIONS.BASE_CHANGED
});

export const resetMachine = (machineState) => ({
    type: ACTIONS.RESET,
    machineState
});

export const showHidePlaceValue = () =>({
    type: ACTIONS.SHOW_HIDE_PLACE_VALUE
});

export const activateMagicWand = (active) => ({
    type: ACTIONS.ACTIVATE_MAGIC_WAND,
    active
});

export const stabilize = () => ({
    type: ACTIONS.STABILIZE
});

export const operandChanged = (operandPos, value) => ({
    type: ACTIONS.OPERAND_CHANGED,
        operandPos,
        value
});

export const startActivity = () => ({
    type: ACTIONS.START_ACTIVITY
});

export const activityStarted = (zoneId, dotsPos, isPositive) => ({
    type: ACTIONS.ACTIVITY_STARTED,
        zoneId,
        dotsPos,
        isPositive

});
