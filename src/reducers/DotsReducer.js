import {makeUID} from '../utils/MathUtils'
import {DOTS} from '../actions/Constants'
const dotsReducer = (state = null, action) => {
    if (state === null) {
        const initialState = {
            base:[1,2],
            mode:'divide',
            baseSelectorDisplay:true,
            placeValueSwitch:true,
            zones: 5,
            maxViewableDots: 150,
        };
        return {
            dots: [{x:100, y:100, powerZone:0, isPositive:true, id:makeUID()}, {x:50, y:50, powerZone:0, isPositive:true, id:makeUID()}],
            machineState: initialState
        };
    }

    var stateCopy;
    switch (action.type) {
        case DOTS.ADD_DOT:
            console.log('ADD_DOT', action.zoneId, action.isPositive);
            stateCopy = {...state};
            const point = {
                x: action.position[0],
                y: action.position[1],
                powerZone: action.zoneId,
                id: makeUID(),
                isPositive: action.isPositive
            };
            stateCopy.dots.push(point);
            return stateCopy;

        case DOTS.REMOVE_DOT:
            console.log('REMOVE_DOT');
            stateCopy = {...state};
            stateCopy.dots.forEach((dot) => {
                console.log(dot, action.dotId);
                if (dot.id === action.dotId) {
                    stateCopy.dots.splice(stateCopy.dots.indexOf(dot), 1);
                }
            });
            return stateCopy;

        case DOTS.ADD_MULTIPLE_DOTS:
            console.log('ADD_MULTIPLE_DOTS', action.dotsPos, action.zoneId);
            stateCopy = {...state};
            action.dotsPos.forEach((dot) => {
                let point = {x: dot.x, y: dot.y, powerZone: action.zoneId, id: Math.random(), isPositive: action.isPositive};
                stateCopy.dots.push(point);
            });
            return stateCopy;

        case DOTS.REMOVE_MULTIPLE_DOTS:
            stateCopy = {...state};
            console.log('REMOVE_MULTIPLE_DOTS amount:', action.dots.length, ' zone:', action.zoneId, ' totalDot:', stateCopy.dots.length);
            if (action.dots.length > 0) {
                let i = stateCopy.dots.length;
                while (i--) {
                    let j = action.dots.length;
                    while(j--){
                        if (stateCopy.dots[i].id === action.dots[j].id) {
                            stateCopy.dots.splice(stateCopy.dots.indexOf(stateCopy.dots[i]), 1);
                            break;
                        }
                    }
                }
            }
            return stateCopy;

        case DOTS.REZONE_DOT:
            stateCopy = {...state};
            console.log('REZONE_DOT', stateCopy);
            stateCopy.dots.forEach((dot) => {
                if (dot.id === action.dot.id) {
                    dot.powerZone = action.zoneId;
                }
            });
            return stateCopy;
        default:
            return state
    }
};

export default dotsReducer;

