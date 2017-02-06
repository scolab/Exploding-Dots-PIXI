import {makeUID} from '../utils/MathUtils'

const dotsReducer = (state = null, action) => {
    if (state === null) {
        const initialState = {
            base:[1,'x'],
            mode:'divide',
            baseSelectorDisplay:true,
            placeValueSwitch:true,
            zones: 5,
            maxViewableDots: 150,
        };
        return {
            dots: [{x:100, y:100, zone:0, isPositive:true, id:makeUID()}],
            machineState: initialState
        };
    }

    var stateCopy;
    switch (action.type) {
        case 'ADD_DOT':
            console.log('ADD_DOT', action.zoneId, action.isPositive);
            stateCopy = {...state};
            const point = {
                x: action.position[0],
                y: action.position[1],
                zone: action.zoneId,
                id: makeUID(),
                isPositive: action.isPositive
            };
            stateCopy.dots.push(point);
            return stateCopy;

        case 'REMOVE_DOT':
            console.log('REMOVE_DOT');
            stateCopy = {...state};
            stateCopy.explodingInstances[action.parentId].dots.forEach((dot) => {
                if (dot.id === action.dotId) {
                    stateCopy.explodingInstances[action.parentId].dots.splice(stateCopy.explodingInstances[action.parentId].dots.indexOf(dot), 1);
                }
            });
            return stateCopy;

        case 'ADD_MULTIPLE_DOTS':
            console.log('ADD_MULTIPLE_DOTS', action.dotsPos, action.zoneId);
            stateCopy = {...state};
            action.dotsPos.forEach((dot) => {
                let point = {x: dot.x, y: dot.y, zone: action.zoneId, id: Math.random()};
                stateCopy.explodingInstances[action.parentId].dots.push(point);
            });
            return stateCopy;

        case 'REMOVE_MULTIPLE_DOTS':
            stateCopy = {...state};
            console.log('REMOVE_MULTIPLE_DOTS amount:', action.dotsAmount, ' zone:', action.zoneId, ' totalDot:', stateCopy.explodingInstances[action.parentId].dots.length);
            if (action.dotsAmount > 0) {
                let i = stateCopy.explodingInstances[action.parentId].dots.length;
                while (i--) {
                    if (stateCopy.explodingInstances[action.parentId].dots[i].zone === action.zoneId) {
                        action.dotsAmount--;
                        stateCopy.explodingInstances[action.parentId].dots.splice(stateCopy.explodingInstances[action.parentId].dots.indexOf(stateCopy.explodingInstances[action.parentId].dots[i]), 1);
                        if (action.dotsAmount <= 0) {
                            break;
                        }
                    }
                }
            }
            return stateCopy;

        case 'REZONE_DOT':
            stateCopy = {...state};
            console.log('REZONE_DOT', stateCopy);
            stateCopy.explodingInstances[action.parentId].dots.forEach((dot) => {
                if (dot.id === action.dot.id) {
                    //stateCopy.explodingInstances[action.parentId].dots.zone = action.zoneId;
                    dot.zone = action.zoneId;
                }
            });
            return stateCopy;
        default:
            return state
    }
};

export default dotsReducer;

