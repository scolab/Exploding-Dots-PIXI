import {makeUID} from '../utils/MathUtils'
import {ACTIONS} from '../actions/StoreConstants'
import {OPERAND_POS, USAGE_MODE, OPERATOR_MODE, BASE} from '../Constants'
import _array from 'lodash/array';
import { EventEmitter } from 'events';
import {processSuperscript, addSuperscriptWhereNeeded} from '../utils/StringUtils';

let initialMachineState = {};

function setDotsCount(state){
    //console.log('setDotsCount');
    let col = 0;
    if(state.machineState.base[1] !== BASE.BASE_X) {
        let dotsCount = 0;
        for (let zone of state.positivePowerZoneDots) {
            dotsCount += Object.keys(zone).length * Math.pow(state.machineState.base[1] / state.machineState.base[0], col);
            col++;
        }
        return dotsCount.toString();
    }else {
        let positiveValue = [];
        let negativeValue = [];
        let toReturn = '';

        for (let zone of state.positivePowerZoneDots) {
            let zoneValue = Object.keys(zone).length;
            if(col !== 0) {
                if(zoneValue !== 0) {
                    if(col !== 1){
                        zoneValue = zoneValue + 'x' + processSuperscript(col.toString()) + '+';
                        positiveValue.push(zoneValue);
                    }else{
                        positiveValue.push(zoneValue + 'x' + '+');
                    }

                }
            }else if(zoneValue !== 0){
                positiveValue.push(Object.keys(zone).length);
            }
            col++;
        }

        col = 0;

        for (let zone of state.negativePowerZoneDots) {
            let zoneValue = Object.keys(zone).length;
            if(col !== 0) {
                if(zoneValue !== 0) {
                    if(col !== 1){
                        zoneValue = zoneValue + 'x' + processSuperscript(col.toString()) + '-';
                        negativeValue.push(zoneValue);
                    }else{
                        negativeValue.push(zoneValue + 'x' + '-');
                    }

                }
            }else if(zoneValue !== 0){
                negativeValue.push(Object.keys(zone).length);
            }
            col++;
        }

        // add all positive value in order to the string
        for(let i = positiveValue.length; i--; i> 0){
            toReturn += positiveValue[i];
        }
        // remove trailing + sign
        if(toReturn.charAt(toReturn.length - 1) === '+'){
            toReturn = toReturn.slice(0, -1);
        }

        // if there is negative value, add - sign
        if(negativeValue.length > 0){
            toReturn += '-';
        }
        // add all negative value in order to the string
        for(let i = negativeValue.length; i--; i> 0){
            toReturn += negativeValue[i];
        }
        // remove trailing - sign
        if(toReturn.charAt(toReturn.length - 1) === '-'){
            toReturn = toReturn.slice(0, -1);
        }
        return toReturn;
    }
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
    //console.log('dotsReducer', action.type);
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
            if(action.divider != null) {
                action.divider.forEach((dividerDot) => {
                    let dot = {};
                    dot.powerZone = dividerDot.zoneId;
                    dot.id = makeUID();
                    dot.isPositive = dividerDot.isPositive;
                    if (dot.isPositive) {
                        stateCopy.positiveDividerDots[dividerDot.zoneId][dot.id] = dot;
                    } else {
                        stateCopy.negativeDividerDots[dividerDot.zoneId][dot.id] = dot;
                    }
                });
            }
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
            dot.color = action.color;
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
                dot.color = action.color;
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
                if(stateCopy.machineState.base[1] !== BASE.BASE_X) {
                    stateCopy.machineState.operandA = action.value;
                }else{
                    stateCopy.machineState.operandA = addSuperscriptWhereNeeded(action.value);
                }
            } else if (action.operandPos == OPERAND_POS.RIGHT) {
                if(stateCopy.machineState.base[1] !== BASE.BASE_X) {
                    stateCopy.machineState.operandB = action.value;
                }else{
                    stateCopy.machineState.operandB = addSuperscriptWhereNeeded(action.value);
                }
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

