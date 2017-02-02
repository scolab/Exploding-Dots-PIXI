export const addDot = (parentId, zoneId, position, isPositive) => ({
    type: 'ADD_DOT',
    parentId,
    zoneId,
    position,
    isPositive
});

export const removeDot = (parentId, zoneId, dotId) => ({
    type: 'REMOVE_DOT',
    parentId,
    zoneId,
    dotId
});

export const addMultipleDots = (parentId, zoneId, dotsPos) => ({
    type: 'ADD_MULTIPLE_DOTS',
    parentId,
    zoneId,
    dotsPos
});

export const removeMultipleDots = (parentId, zoneId, dotsAmount) => ({
    type: 'REMOVE_MULTIPLE_DOTS',
    parentId,
    zoneId,
    dotsAmount
});

export const rezoneDot = (parentId, zoneId, dot) => ({
    type: 'REZONE_DOT',
        parentId,
        zoneId,
        dot
});