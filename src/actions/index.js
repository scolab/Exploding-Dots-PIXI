import {ACTIONS} from './StoreConstants';

export const addDot = (parentId, zoneId, position, isPositive) => ({
    type: ACTIONS.ADD_DOT,
    parentId,
    zoneId,
    position,
    isPositive
});

export const removeDot = (parentId, zoneId, dotId) => ({
    type: ACTIONS.REMOVE_DOT,
    parentId,
    zoneId,
    dotId
});

export const addMultipleDots = (parentId, zoneId, dotsPos, isPositive) => ({
    type: ACTIONS.ADD_MULTIPLE_DOTS,
    parentId,
    zoneId,
    dotsPos,
    isPositive
});

export const removeMultipleDots = (parentId, zoneId, dots) => ({
    type: ACTIONS.REMOVE_MULTIPLE_DOTS,
    parentId,
    zoneId,
    dots
});

export const rezoneDot = (parentId, zoneId, dot) => ({
    type: ACTIONS.REZONE_DOT,
        parentId,
        zoneId,
        dot
});

export const changeBase = () =>({
    type: ACTIONS.BASE_CHANGED
});

export const resetMachine = () => ({
    type: ACTIONS.RESET
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

export const operandChanged = (parentId, operandPos, value) => ({
    type: ACTIONS.OPERAND_CHANGED,
        parentId,
        operandPos,
        value
});
