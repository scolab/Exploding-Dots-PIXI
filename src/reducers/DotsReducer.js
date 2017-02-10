import {makeUID} from '../utils/MathUtils'
import {ACTIONS} from '../actions/StoreConstants'
import {MODE} from '../Constants'
import {BASE} from '../Constants'


const dotsReducer = (state = null, action) => {
    if (state === null) {
        const initialState = {
            base:[1,2],
            mode:MODE.DISPLAY,
            baseSelectorDisplay:true,
            placeValueSwitch:true,
            magicWandVisible:true,
            resetVisible:true,
            zones: 5,
            maxViewableDots: 150,
            operandA: 12,
            operandB: ''
        };
        let dots = [];
        /*for(let i = 0; i < initialState.zones; i++){
            dots.push([]);
        }*/
        return {
            dots: dots,
            machineState: initialState
        };
    }

    var stateCopy;
    switch (action.type) {
        case ACTIONS.ADD_DOT:
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

        case ACTIONS.REMOVE_DOT:
            console.log('REMOVE_DOT');
            stateCopy = {...state};
            stateCopy.dots.forEach((dot) => {
                console.log(dot, action.dotId);
                if (dot.id === action.dotId) {
                    stateCopy.dots.splice(stateCopy.dots.indexOf(dot), 1);
                }
            });
            return stateCopy;

        case ACTIONS.ADD_MULTIPLE_DOTS:
            console.log('ADD_MULTIPLE_DOTS', action.dotsPos, action.zoneId);
            stateCopy = {...state};
            action.dotsPos.forEach((dot) => {
                let point = {x: dot.x, y: dot.y, powerZone: action.zoneId, id: Math.random(), isPositive: action.isPositive};
                stateCopy.dots.push(point);
            });
            return stateCopy;

        case ACTIONS.REMOVE_MULTIPLE_DOTS:
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

        case ACTIONS.REZONE_DOT:
            stateCopy = {...state};
            console.log('REZONE_DOT', stateCopy);
            stateCopy.dots.forEach((dot) => {
                if (dot.id === action.dot.id) {
                    dot.powerZone = action.zoneId;
                }
            });
            return stateCopy;
        case ACTIONS.SHOW_HIDE_PLACE_VALUE:
            stateCopy = {...state};
            stateCopy.machineState.placeValueSwitch = !stateCopy.machineState.placeValueSwitch;
            return stateCopy;
        case ACTIONS.OPERAND_CHANGED:
            stateCopy = {...state};
            if(action.operandPos == "A") {
                stateCopy.machineState.operandA = action.value;
            }else if(action.operandPos == "B") {
                stateCopy.machineState.operandB = action.value;
            }
            return stateCopy;
        case ACTIONS.ONE_STEP_STABILIZE:
            stateCopy = {...state};
            /*var dots = stateCopy.dots;
            var base = stateCopy.machineState.base;
            var stepIsDone = false;
            var startIndex = 0;
            dots.forEach(function(dot, index){
                if(!stepIsDone && index >= startIndex ){
                    if(dots.length <= index+1){
                        dots.push([]);
                    }
                    if(dot.length >= base){
                        dots[index+1] = _this.updateDotsArray(dots[index+1], dots[index+1].length + 1);
                        dots[index] = _this.updateDotsArray(dots[index], dot.length - base);
                        stepIsDone = true;
                    }
                }
            });*/
            return false;
        default:
            return state
    }
};

export default dotsReducer;

