import {makeUID} from '../utils/MathUtils'
import {ACTIONS} from '../actions/StoreConstants'
import {OPERAND_POS, USAGE_MODE, OPERATOR_MODE} from '../Constants'
import _array from 'lodash/array';
import { EventEmitter } from 'events';
//import {ObjPool} from '../utils/ObjPool';

let initialMachineState = {};

function setDotsCount(state){
    let dotsCount = 0;
    let col = 0;

    for (let zone of state.positivePowerZoneDots) {
        //console.log(Object.keys(zone).length);
        dotsCount += Object.keys(zone).length * Math.pow(state.machineState.base[1] / state.machineState.base[0], col);
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
        positivePowerZoneDots.push({});
        negativePowerZoneDots.push({});
    }
    let positiveDividerDots = [];
    let negativeDividerDots = [];
    for (let i = 0; i < (initialMachineState.zones || 0); i++) {
        positiveDividerDots.push({});
        negativeDividerDots.push({});
    }
    return {
        positivePowerZoneDots: positivePowerZoneDots,
        negativePowerZoneDots: negativePowerZoneDots,
        positiveDividerDots: positiveDividerDots,
        negativeDividerDots: negativeDividerDots,
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
            console.log(ACTIONS.START_ACTIVITY);
            stateCopy = {...state};
            stateCopy.machineState.startActivity = true;
            return stateCopy;
        case ACTIONS.START_ACTIVITY_DONE:
            console.log(ACTIONS.START_ACTIVITY_DONE);
            stateCopy = {...state};
            stateCopy.machineState.startActivity = false;
            stateCopy.machineState.activityStarted = true;
            action.dotsInfo.forEach((newDot) => {
                let dot = {};
                dot.x = newDot.x;
                dot.y = newDot.y;
                dot.powerZone = newDot.zoneId;
                dot.id = makeUID();
                dot.isPositive = newDot.isPositive;
                dot.color = newDot.color;
                if(dot.isPositive) {
                    stateCopy.positivePowerZoneDots[newDot.zoneId][dot.id] = dot;
                }else {
                    stateCopy.negativePowerZoneDots[newDot.zoneId][dot.id] = dot;
                }
            });
            action.divider.forEach((dividerDot) => {
                let dot = {};
                dot.powerZone = dividerDot.zoneId;
                dot.id = makeUID();
                dot.isPositive = dividerDot.isPositive;
                if(dot.isPositive) {
                    stateCopy.positiveDividerDots[dividerDot.zoneId][dot.id] = dot;
                }else {
                    stateCopy.negativeDividerDots[dividerDot.zoneId][dot.id] = dot;
                }
            });
            if(action.totalA != null) {
                stateCopy.machineState.operandA = action.totalA.toString();
            }
            if(action.totalB != null) {
                stateCopy.machineState.operandB = action.totalB.toString();
            }
            return stateCopy;
        case ACTIONS.ADD_DOT:
            console.log('ADD_DOT', action.zoneId, action.isPositive);
            stateCopy = {...state};
            let dot = {};
            dot.x = action.position[0];
            dot.y = action.position[1];
            dot.powerZone = action.zoneId;
            dot.id = makeUID();
            dot.isPositive = action.isPositive;
            /*let dot = {
                x: action.position[0],
                y: action.position[1],
                powerZone: action.zoneId,
                id: makeUID(),
                isPositive: action.isPositive
            };*/
            if (dot.isPositive) {
                stateCopy.positivePowerZoneDots[dot.powerZone][dot.id] = dot;//.push(dot);
            } else {
                stateCopy.negativePowerZoneDots[dot.powerZone][dot.id] = dot;//.push(dot);
            }
            if(stateCopy.machineState.usage_mode === USAGE_MODE.FREEPLAY && stateCopy.machineState.operator_mode === OPERATOR_MODE.DISPLAY) {
                stateCopy.machineState.operandA = setDotsCount(stateCopy);
            }
            return stateCopy;

        case ACTIONS.REMOVE_DOT:
            console.log('REMOVE_DOT');
            stateCopy = {...state};
            if(stateCopy.positivePowerZoneDots[action.zoneId].hasOwnProperty(action.dotId)){
                //let dot = stateCopy.positivePowerZoneDots[action.zoneId][action.dotId];
                delete stateCopy.positivePowerZoneDots[action.zoneId][action.dotId];
                //ObjPool.dispose(dot);
            }

            if(stateCopy.negativePowerZoneDots[action.zoneId].hasOwnProperty(action.dotId)){
                delete stateCopy.negativePowerZoneDots[action.zoneId][action.dotId];
            }

            if(stateCopy.machineState.usage_mode === USAGE_MODE.FREEPLAY && stateCopy.machineState.operator_mode === OPERATOR_MODE.DISPLAY) {
                stateCopy.machineState.operandA = setDotsCount(stateCopy);
            }
            return stateCopy;

        case ACTIONS.ADD_MULTIPLE_DOTS:
            console.log('ADD_MULTIPLE_DOTS');
            stateCopy = {...state};
            action.dotsPos.forEach((newDot) => {
                let dot = {};
                dot.x = newDot.x;
                dot.y = newDot.y;
                dot.powerZone = action.zoneId;
                dot.id = makeUID();
                dot.isPositive = action.isPositive;

                /*let dot = {
                    x: newDot.x,
                    y: newDot.y,
                    powerZone: action.zoneId,
                    id: makeUID(),
                    isPositive: action.isPositive
                };*/
                if(dot.isPositive) {
                    stateCopy.positivePowerZoneDots[action.zoneId][dot.id] = dot;//.push(dot);
                }else {
                    stateCopy.negativePowerZoneDots[action.zoneId][dot.id] = dot;//.push(dot);
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
                        //console.log(i, dot.id, stateCopy.positivePowerZoneDots[action.zoneId].hasOwnProperty(dot.id));
                        if(stateCopy.positivePowerZoneDots[action.zoneId].hasOwnProperty(dot.id)){
                            //let dotToDispose = stateCopy.positivePowerZoneDots[action.zoneId][dot.id];
                            delete stateCopy.positivePowerZoneDots[action.zoneId][dot.id];
                            //ObjPool.dispose(dotToDispose);
                        }
                    }else{
                        if(stateCopy.negativePowerZoneDots[action.zoneId].hasOwnProperty(dot.id)){
                            //let dotToDispose = stateCopy.negativePowerZoneDots[action.zoneId][dot.id];
                            delete stateCopy.negativePowerZoneDots[action.zoneId][dot.id];
                            //ObjPool.dispose(dotToDispose);
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
            if(action.dot.isPositive) {
                let i = stateCopy.positivePowerZoneDots.length;
                while (i--) {
                    if(stateCopy.positivePowerZoneDots[i][action.dot.id] != undefined){
                        stateCopy.positivePowerZoneDots[i][action.dot.id].powerZone = action.zoneId;
                        stateCopy.positivePowerZoneDots[action.zoneId][action.dot.id] = stateCopy.positivePowerZoneDots[i][action.dot.id];
                        delete stateCopy.positivePowerZoneDots[i][action.dot.id];
                        break;
                    }
                }
            }else {
                let i = stateCopy.negativePowerZoneDots.length;
                while (i--) {
                    if(stateCopy.negativePowerZoneDots[i][action.dot.id] != undefined){
                        stateCopy.negativePowerZoneDots[i][action.dot.id].powerZone = action.zoneId;
                        stateCopy.negativePowerZoneDots[action.zoneId][action.dot.id] = stateCopy.negativePowerZoneDots[i][action.dot.id];
                        delete stateCopy.negativePowerZoneDots[i][action.dot.id];
                        break;
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
        case ACTIONS.OPERATOR_CHANGED:
            console.log(ACTIONS.OPERATOR_CHANGED);
            stateCopy = {...state};
            console.log(ACTIONS.OPERATOR_CHANGED, action.value);
            stateCopy.machineState.operator_mode = action.value;
            return stateCopy;
        case ACTIONS.ACTIVATE_MAGIC_WAND:
            console.log(ACTIONS.ACTIVATE_MAGIC_WAND);
            stateCopy = {...state};
            stateCopy.machineState.magicWandIsActive = action.active;
            return stateCopy;
        case ACTIONS.BASE_CHANGED:
            console.log(ACTIONS.BASE_CHANGED);
            stateCopy = {...state};
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
            console.log(ACTIONS.RESET);
            if (action.machineState) {
                initialMachineState = action.machineState;
            }
            initialMachineState.operandA = '';
            initialMachineState.operandB = '';
            initialMachineState.activityStarted = false;
            initialMachineState.errorMessage = '';
            return setInitialState();
        case ACTIONS.ERROR:
            console.log(ACTIONS.ERROR);
            stateCopy = {...state};
            stateCopy.machineState.errorMessage = action.errorMessage;
            stateCopy.machineState.startActivity = false;
            stateCopy.machineState.activityStarted = true;
            return stateCopy;
            break;
        case ACTIONS.USER_MESSAGE:
            console.log(ACTIONS.USER_MESSAGE);
            stateCopy = {...state};
            stateCopy.machineState.userMessage = action.userMessage;
            return stateCopy;
            break;
        case ACTIONS.RESET_USER_MESSAGE:
            console.log(ACTIONS.RESET_USER_MESSAGE);
            stateCopy = {...state};
            stateCopy.machineState.userMessage = '';
            return stateCopy;
            break;
        default:
            console.log('DEFAULT');
            return state
    }
};
export default dotsReducer;

