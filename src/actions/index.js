import {DOTS} from './Constants';

export const addDot = (parentId, zoneId, position, isPositive) => ({
    type: DOTS.ADD_DOT,
    parentId,
    zoneId,
    position,
    isPositive
});

export const removeDot = (parentId, zoneId, dotId) => ({
    type: DOTS.REMOVE_DOT,
    parentId,
    zoneId,
    dotId
});

export const addMultipleDots = (parentId, zoneId, dotsPos, isPositive) => ({
    type: DOTS.ADD_MULTIPLE_DOTS,
    parentId,
    zoneId,
    dotsPos,
    isPositive
});

export const removeMultipleDots = (parentId, zoneId, dots) => ({
    type: DOTS.REMOVE_MULTIPLE_DOTS,
    parentId,
    zoneId,
    dots
});

export const rezoneDot = (parentId, zoneId, dot) => ({
    type: DOTS.REZONE_DOT,
        parentId,
        zoneId,
        dot
});