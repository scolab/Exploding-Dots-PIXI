import {makeUID} from '../utils/MathUtils'
import {ACTIONS} from '../actions/StoreConstants'
import {OPERATOR_MODE, USAGE_MODE} from '../Constants'
import {BASE} from '../Constants'
import _array from 'lodash/array';

import { EventEmitter } from 'events';

function setDotsCount(state){
    let dotsCount = 0;
    let col = 0;

    for (let dot of state.positivePowerZoneDots) {
        dotsCount += dot.length * Math.pow(state.machineState.base[1], col);
        col++;
    }
    return dotsCount;

    /*// negative
     dotsCount = 0;
     col = 0;

     for(let dot of this.state.negativePowerZoneDots){
     dotsCount += dot.length * Math.pow(this.state.base,col);
     col++;
     }
     this.state.negativeDotsCount = dotsCount;*/
}

function setInitialState(){
    const initialState = {
        base: BASE.ALL_BASE[0],
        operator_mode: OPERATOR_MODE.DISPLAY,
        usage_mode: USAGE_MODE.FREEPLAY,
        magicWandIsActive: false,
        baseSelectorDisplay: true,
        placeValueSwitch: true,
        magicWandVisible: true,
        resetVisible: true,
        zones: 5,
        maxViewableDots: 150,
        operandA: '',
        operandB: ''
    };
    let dots = [];
    let positivePowerZoneDots = [];
    let negativePowerZoneDots = [];
    for (let i = 0; i < initialState.zones; i++) {
        positivePowerZoneDots.push([]);
        negativePowerZoneDots.push([]);
    }
    dots.forEach((dot) => {
        if (dot.isPositive) {
            positivePowerZoneDots[dot.powerZone].push(dot);
        } else {
            negativePowerZoneDots[dot.powerZone].push(dot);
        }
    });
    return {
        dots: dots,
        positivePowerZoneDots: positivePowerZoneDots,
        negativePowerZoneDots: negativePowerZoneDots,
        machineState: initialState
    };
}

const dotsReducer = (state = null, action) => {
    if (state === null) {
        return setInitialState();
    }

    var stateCopy;
    switch (action.type) {
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
            stateCopy.dots.push(dot);
            if (dot.isPositive) {
                stateCopy.positivePowerZoneDots[dot.powerZone].push(dot);
            } else {
                stateCopy.negativePowerZoneDots[dot.powerZone].push(dot);
            }
            //console.log(stateCopy.positivePowerZoneDots);
            stateCopy.machineState.operandA = setDotsCount(stateCopy);
            return stateCopy;

        case ACTIONS.REMOVE_DOT:
            console.log('REMOVE_DOT');
            stateCopy = {...state};
            stateCopy.dots.forEach((dot) => {
                console.log(dot.id , action.dotId);
                if (dot.id === action.dotId) {
                    stateCopy.dots.splice(stateCopy.dots.indexOf(dot), 1);
                }
                if(dot.isPositive) {
                    if (stateCopy.positivePowerZoneDots[action.zoneId].indexOf(dot) != -1) {
                        stateCopy.positivePowerZoneDots[action.zoneId].splice(stateCopy.positivePowerZoneDots[action.zoneId].indexOf(dot), 1);
                    }
                }else{
                    if (stateCopy.negativePowerZoneDots[action.zoneId].indexOf(dot) != -1) {
                        stateCopy.negativePowerZoneDots[action.zoneId].splice(stateCopy.negativePowerZoneDots[action.zoneId].indexOf(dot), 1);
                    }
                }
            });

            stateCopy.machineState.operandA = setDotsCount(stateCopy);
            return stateCopy;

        case ACTIONS.ADD_MULTIPLE_DOTS:
            console.log('ADD_MULTIPLE_DOTS', action.dotsPos, action.zoneId);
            stateCopy = {...state};
            action.dotsPos.forEach((dot) => {
                let point = {
                    x: dot.x,
                    y: dot.y,
                    powerZone: action.zoneId,
                    id: Math.random(),
                    isPositive: action.isPositive
                };
                stateCopy.dots.push(point);
            });
            stateCopy.machineState.operandA = setDotsCount(stateCopy);
            return stateCopy;

        case ACTIONS.REMOVE_MULTIPLE_DOTS:
            stateCopy = {...state};
            console.log('REMOVE_MULTIPLE_DOTS amount:', action.dots.length, ' zone:', action.zoneId, ' totalDot:', stateCopy.dots.length);
            if (action.dots.length > 0) {
                let i = stateCopy.dots.length;
                while (i--) {
                    let j = action.dots.length;
                    while (j--) {
                        let dot = action.dots[j];
                        if(dot.isPositive) {
                            if (stateCopy.positivePowerZoneDots[action.zoneId].indexOf(dot) != -1) {
                                stateCopy.positivePowerZoneDots[action.zoneId].splice(stateCopy.positivePowerZoneDots[action.zoneId].indexOf(dot), 1);
                            }
                        }else{
                            if (stateCopy.negativePowerZoneDots[action.zoneId].indexOf(dot) != -1) {
                                stateCopy.negativePowerZoneDots[action.zoneId].splice(stateCopy.negativePowerZoneDots[action.zoneId].indexOf(dot), 1);
                            }
                        }
                        if (stateCopy.dots[i].id === dot.id) {
                            stateCopy.dots.splice(stateCopy.dots.indexOf(stateCopy.dots[i]), 1);
                            break;
                        }
                    }
                }
            }
            stateCopy.machineState.operandA = setDotsCount(stateCopy);
            return stateCopy;
        case ACTIONS.REZONE_DOT:
            stateCopy = {...state};
            console.log('REZONE_DOT', stateCopy);
            stateCopy.dots.forEach((dot) => {
                if (dot.id === action.dot.id) {
                    dot.powerZone = action.zoneId;
                }
            });
            stateCopy.machineState.operandA = setDotsCount(stateCopy);
            return stateCopy;
        case ACTIONS.SHOW_HIDE_PLACE_VALUE:
            stateCopy = {...state};
            stateCopy.machineState.placeValueSwitch = !stateCopy.machineState.placeValueSwitch;
            return stateCopy;
        case ACTIONS.OPERAND_CHANGED:
            stateCopy = {...state};
            if (action.operandPos == "A") {
                stateCopy.machineState.operandA = action.value;
            } else if (action.operandPos == "B") {
                stateCopy.machineState.operandB = action.value;
            }
            return stateCopy;
        case ACTIONS.ACTIVATE_MAGIC_WAND:
            stateCopy = {...state};
            stateCopy.machineState.magicWandIsActive = action.active;
            return stateCopy;
        case ACTIONS.BASE_CHANGED:
            stateCopy = {...state};
            let index = _array.findIndex(BASE.ALL_BASE, state.machineState.base);
            if (index < BASE.ALL_BASE.length - 1) {
                ++index;
            } else {
                index = 0;
            }
            stateCopy.machineState.base = BASE.ALL_BASE[index];
            stateCopy.machineState.operandA = setDotsCount(stateCopy);
            return stateCopy;
        case ACTIONS.RESET:
            return setInitialState();
        default:
            return state
    }
};
export default dotsReducer;

