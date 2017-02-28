import {makeUID} from '../utils/MathUtils'
import {ACTIONS} from '../actions/StoreConstants'
import {OPERAND_POS, USAGE_MODE, OPERATOR_MODE} from '../Constants'
import _array from 'lodash/array';
import { EventEmitter } from 'events';

let initialMachineState = {};

function setDotsCount(state){
    let dotsCount = 0;
    let col = 0;

    for (let dot of state.positivePowerZoneDots) {
        dotsCount += dot.length * Math.pow(state.machineState.base[1] / state.machineState.base[0], col);
        col++;
    }

    return dotsCount.toString();

    /*// negative
     dotsCount = 0;
     col = 0;

     for(let dot of this.state.negativePowerZoneDots){
     dotsCount += dot.length * Math.pow(this.state.base,col);
     col++;
     }
     this.state.negativeDotsCount = dotsCount;*/
}

function setInitialState() {
    //let dots = [];
    let positivePowerZoneDots = [];
    let negativePowerZoneDots = [];
    for (let i = 0; i < (initialMachineState.zones || 0); i++) {
        positivePowerZoneDots.push([]);
        negativePowerZoneDots.push([]);
    }
    return {
        positivePowerZoneDots: positivePowerZoneDots,
        negativePowerZoneDots: negativePowerZoneDots,
        machineState: initialMachineState
    };
}

const dotsReducer = (state = null, action) => {
    if (state === null) {
        return setInitialState();
    }

    var stateCopy;
    switch (action.type) {
        case ACTIONS.START_ACTIVITY:
            stateCopy = {...state};
            stateCopy.machineState.startActivity = true;
            return stateCopy;
        case ACTIONS.START_ACTIVITY_DONE:
            stateCopy = {...state};
            stateCopy.machineState.startActivity = false;
            stateCopy.machineState.activityStarted = true;
            action.dotsInfo.forEach((newDot) => {
                let dot = {
                    x: newDot.x,
                    y: newDot.y,
                    powerZone: newDot.zoneId,
                    id: makeUID(),
                    isPositive: newDot.isPositive
                };
                if(dot.isPositive) {
                    stateCopy.positivePowerZoneDots[newDot.zoneId].push(dot);
                }else {
                    stateCopy.negativePowerZoneDots[newDot.zoneId].push(dot);
                }
            });
            if(action.total != null) {
                stateCopy.machineState.operandA = action.total.toString();
            }
            return stateCopy;
        case ACTIONS.ADD_DOT:
            //console.log('ADD_DOT', action.zoneId, action.isPositive);
            stateCopy = {...state};
            const dot = {
                x: action.position[0],
                y: action.position[1],
                powerZone: action.zoneId,
                id: makeUID(),
                isPositive: action.isPositive
            };
            if (dot.isPositive) {
                stateCopy.positivePowerZoneDots[dot.powerZone].push(dot);
            } else {
                stateCopy.negativePowerZoneDots[dot.powerZone].push(dot);
            }
            if(stateCopy.machineState.usage_mode === USAGE_MODE.FREEPLAY && stateCopy.machineState.operator_mode === OPERATOR_MODE.DISPLAY) {
                stateCopy.machineState.operandA = setDotsCount(stateCopy);
            }
            return stateCopy;

        case ACTIONS.REMOVE_DOT:
            console.log('REMOVE_DOT');
            stateCopy = {...state};
            let i = stateCopy.positivePowerZoneDots[action.zoneId].length;
            while(i--){
                if(stateCopy.positivePowerZoneDots[action.zoneId][i].id === action.dotId){
                    stateCopy.positivePowerZoneDots[action.zoneId].splice(i, 1);
                    break;
                }
            }

            i = stateCopy.negativePowerZoneDots[action.zoneId].length;
            while(i--){
                if(stateCopy.negativePowerZoneDots[action.zoneId][i].id === action.dotId){
                    stateCopy.negativePowerZoneDots[action.zoneId].splice(i, 1);
                    break;
                }
            }
            if(stateCopy.machineState.usage_mode === USAGE_MODE.FREEPLAY && stateCopy.machineState.operator_mode === OPERATOR_MODE.DISPLAY) {
                stateCopy.machineState.operandA = setDotsCount(stateCopy);
            }
            return stateCopy;

        case ACTIONS.ADD_MULTIPLE_DOTS:
            console.log('ADD_MULTIPLE_DOTS');
            stateCopy = {...state};
            action.dotsPos.forEach((newDot) => {
                let dot = {
                    x: newDot.x,
                    y: newDot.y,
                    powerZone: action.zoneId,
                    id: makeUID(),
                    isPositive: action.isPositive
                };
                if(dot.isPositive) {
                    stateCopy.positivePowerZoneDots[action.zoneId].push(dot);
                }else {
                    stateCopy.negativePowerZoneDots[action.zoneId].push(dot);
                }
            });
            if(action.updateValue) {
                if(stateCopy.machineState.usage_mode === USAGE_MODE.FREEPLAY && stateCopy.machineState.operator_mode === OPERATOR_MODE.DISPLAY) {
                    stateCopy.machineState.operandA = setDotsCount(stateCopy).toString();
                }
            }
            return stateCopy;

        case ACTIONS.REMOVE_MULTIPLE_DOTS:
            stateCopy = {...state};
            console.log('REMOVE_MULTIPLE_DOTS amount:', action.dots.length, ' zone:', action.zoneId);
            if (action.dots.length > 0) {
                let i = action.dots.length;
                while (i--) {
                    let dot = action.dots[i];
                    if(dot.isPositive) {
                        if (stateCopy.positivePowerZoneDots[action.zoneId].indexOf(dot) != -1) {
                            stateCopy.positivePowerZoneDots[action.zoneId].splice(stateCopy.positivePowerZoneDots[action.zoneId].indexOf(dot), 1);
                        }
                    }else{
                        if (stateCopy.negativePowerZoneDots[action.zoneId].indexOf(dot) != -1) {
                            stateCopy.negativePowerZoneDots[action.zoneId].splice(stateCopy.negativePowerZoneDots[action.zoneId].indexOf(dot), 1);
                        }
                    }
                }
            }
            if(action.updateValue) {
                if(stateCopy.machineState.usage_mode === USAGE_MODE.FREEPLAY && stateCopy.machineState.operator_mode === OPERATOR_MODE.DISPLAY) {
                    stateCopy.machineState.operandA = setDotsCount(stateCopy);
                }
            }
            return stateCopy;
        case ACTIONS.REZONE_DOT:
            stateCopy = {...state};
            console.log('REZONE_DOT');

            if(action.dot.isPositive) {
                let i = stateCopy.positivePowerZoneDots.length;
                while (i--) {
                    let j = stateCopy.positivePowerZoneDots[i].length;
                    while(j--) {
                        if (stateCopy.positivePowerZoneDots[i][j].id === action.dot.id) {
                            stateCopy.positivePowerZoneDots[i][j].powerZone = action.zoneId;
                            stateCopy.positivePowerZoneDots[action.zoneId].push(stateCopy.positivePowerZoneDots[i][j])
                            stateCopy.positivePowerZoneDots[i].splice(j, 1);
                            break;
                        }
                    }
                }
            }else {
                let i = stateCopy.negativePowerZoneDots.length;
                while (i--) {
                    let j = stateCopy.negativePowerZoneDots[i].length;
                    while(j--) {
                        if (stateCopy.negativePowerZoneDots[i][j].id === action.dot.id) {
                            stateCopy.negativePowerZoneDots[i][j].powerZone = action.zoneId;
                            stateCopy.negativePowerZoneDots[action.zoneId].push(stateCopy.negativePowerZoneDots[i][j])
                            stateCopy.negativePowerZoneDots[i].splice(j, 1);
                            break;
                        }
                    }
                }
            }
            if(action.updateValue) {
                if(stateCopy.machineState.usage_mode === USAGE_MODE.FREEPLAY && stateCopy.machineState.operator_mode === OPERATOR_MODE.DISPLAY) {
                    stateCopy.machineState.operandA = setDotsCount(stateCopy);
                }
            }
            return stateCopy;
        case ACTIONS.SHOW_HIDE_PLACE_VALUE:
            stateCopy = {...state};
            stateCopy.machineState.placeValueOn = !stateCopy.machineState.placeValueOn;
            return stateCopy;
        case ACTIONS.OPERAND_CHANGED:
            stateCopy = {...state};
            if (action.operandPos == OPERAND_POS.LEFT) {
                stateCopy.machineState.operandA = action.value;
            } else if (action.operandPos == OPERAND_POS.RIGHT) {
                stateCopy.machineState.operandB = action.value;
            }
            return stateCopy;
        case ACTIONS.ACTIVATE_MAGIC_WAND:
            stateCopy = {...state};
            stateCopy.machineState.magicWandIsActive = action.active;
            return stateCopy;
        case ACTIONS.BASE_CHANGED:
            stateCopy = {...state};
            /*let index = _array.indexOf(BASE.ALL_BASE, state.machineState.base);*/
            let index = _array.indexOf(state.machineState.allBases, state.machineState.base);
            if (index < state.machineState.allBases.length - 1) {
                ++index;
            } else {
                index = 0;
            }
            stateCopy.machineState.base = state.machineState.allBases[index];
            if(stateCopy.machineState.usage_mode === USAGE_MODE.FREEPLAY && stateCopy.machineState.operator_mode === OPERATOR_MODE.DISPLAY) {
                stateCopy.machineState.operandA = setDotsCount(stateCopy);
            }
            return stateCopy;
        case ACTIONS.RESET:
            if (action.machineState) {
                initialMachineState = action.machineState;
            }
            initialMachineState.operandA = '';
            initialMachineState.operandB = '';
            initialMachineState.activityStarted = false;
            return setInitialState();
        default:
            return state
    }
};
export default dotsReducer;

