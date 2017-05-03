import _array from 'lodash/array';
import { makeUID } from '../utils/MathUtils';
import { ACTIONS } from '../actions/StoreConstants';
import { OPERAND_POS, USAGE_MODE, OPERATOR_MODE, BASE } from '../Constants';
import { processSuperscript, addSuperscriptWhereNeeded } from '../utils/StringUtils';

let initialMachineState = {};
let setMachineState = null;

function setDotsCount(state) {
  // console.log('setDotsCount');
  let col = 0;
  if (state.machineState.base[1] !== BASE.BASE_X) {
    let dotsCount = 0;
    for (const zone of state.positivePowerZoneDots) {
      dotsCount += Object.keys(zone).length *
        Math.pow(state.machineState.base[1] /
          state.machineState.base[0], col);
      col += 1;
    }
    return dotsCount.toString();
  }
  const positiveValue = [];
  const negativeValue = [];
  let toReturn = '';

  for (const zone of state.positivePowerZoneDots) {
    let zoneValue = Object.keys(zone).length;
    if (col !== 0) {
      if (zoneValue !== 0) {
        if (col !== 1) {
          zoneValue = `${zoneValue}x${processSuperscript(col.toString())}+`;
          positiveValue.push(zoneValue);
        } else {
          positiveValue.push(`${zoneValue}x+`);
        }
      }
    } else if (zoneValue !== 0) {
      positiveValue.push(Object.keys(zone).length);
    }
    col += 1;
  }

  col = 0;

  for (const zone of state.negativePowerZoneDots) {
    let zoneValue = Object.keys(zone).length;
    if (col !== 0) {
      if (zoneValue !== 0) {
        if (col !== 1) {
          zoneValue = `${zoneValue}x${processSuperscript(col.toString())}-`;
          negativeValue.push(zoneValue);
        } else {
          negativeValue.push(`${zoneValue}x-`);
        }
      }
    } else if (zoneValue !== 0) {
      negativeValue.push(Object.keys(zone).length);
    }
    col += 1;
  }

  // add all positive value in order to the string
  for (let i = positiveValue.length; i > 0; i -= 1) {
    toReturn += positiveValue[i];
  }
  // remove trailing + sign
  if (toReturn.charAt(toReturn.length - 1) === '+') {
    toReturn = toReturn.slice(0, -1);
  }

        // if there is negative value, add - sign
  if (negativeValue.length > 0) {
    toReturn += '-';
  }
  // add all negative value in order to the string
  for (let i = negativeValue.length; i > 0; i -= 1) {
    toReturn += negativeValue[i];
  }
        // remove trailing - sign
  if (toReturn.charAt(toReturn.length - 1) === '-') {
    toReturn = toReturn.slice(0, -1);
  }
  return toReturn;
}

function setInitialState() {
    // let dots = [];
  const positivePowerZoneDots = [];
  const negativePowerZoneDots = [];
  const positiveDividerDots = [];
  const negativeDividerDots = [];
  const positiveDividerResult = [];
  const negativeDividerResult = [];
  for (let i = 0; i < (initialMachineState.zones || 0); i += 1) {
    positivePowerZoneDots.push({});
    negativePowerZoneDots.push({});
    positiveDividerDots.push({});
    negativeDividerDots.push({});
    positiveDividerResult.push(0);
    negativeDividerResult.push(0);
  }

  return {
    positivePowerZoneDots,
    negativePowerZoneDots,
    positiveDividerDots,
    negativeDividerDots,
    positiveDividerResult,
    negativeDividerResult,
    machineState: initialMachineState,
  };
}

const dotsReducer = (state = null, action) => {
  if (state === null) {
    return setInitialState();
  }

  let stateCopy;
    // console.log('dotsReducer', action.type);
  switch (action.type) {
    case ACTIONS.START_ACTIVITY:
      console.log(ACTIONS.START_ACTIVITY);
      stateCopy = { ...state };
      stateCopy.machineState.startActivity = true;
      return stateCopy;
    case ACTIONS.START_ACTIVITY_DONE:
      console.log(ACTIONS.START_ACTIVITY_DONE);
      stateCopy = { ...state };
      stateCopy.machineState.startActivity = false;
      stateCopy.machineState.activityStarted = true;
      action.dotsInfo.forEach((newDot) => {
        const dot = {};
        dot.x = newDot.x;
        dot.y = newDot.y;
        dot.powerZone = newDot.zoneId;
        dot.id = makeUID();
        dot.isPositive = newDot.isPositive;
        dot.color = newDot.color;
        if (dot.isPositive) {
          stateCopy.positivePowerZoneDots[newDot.zoneId][dot.id] = dot;
        } else {
          stateCopy.negativePowerZoneDots[newDot.zoneId][dot.id] = dot;
        }
      });
      if (action.divider != null) {
        action.divider.forEach((dividerDot) => {
          const dot = {};
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
      if (action.totalA != null) {
        if (stateCopy.machineState.base[1] === BASE.BASE_X) {
          stateCopy.machineState.operandA = addSuperscriptWhereNeeded(action.totalA.toString());
        } else {
          stateCopy.machineState.operandA = action.totalA.toString();
        }
      }
      if (action.totalB != null) {
        if (stateCopy.machineState.base[1] === BASE.BASE_X) {
          stateCopy.machineState.operandB = addSuperscriptWhereNeeded(action.totalB.toString());
        } else {
          stateCopy.machineState.operandB = action.totalB.toString();
        }
      }
      return stateCopy;
    case ACTIONS.ADD_DOT: {
      console.log('ADD_DOT', action.zoneId, action.isPositive);
      stateCopy = { ...state };
      const dot = {};
      dot.x = action.position[0];
      dot.y = action.position[1];
      dot.powerZone = action.zoneId;
      dot.id = makeUID();
      dot.isPositive = action.isPositive;
      dot.color = action.color;
      if (dot.isPositive) {
        stateCopy.positivePowerZoneDots[dot.powerZone][dot.id] = dot;// .push(dot);
      } else {
        stateCopy.negativePowerZoneDots[dot.powerZone][dot.id] = dot;// .push(dot);
      }
      if (stateCopy.machineState.usage_mode === USAGE_MODE.FREEPLAY &&
        stateCopy.machineState.operator_mode === OPERATOR_MODE.DISPLAY) {
        stateCopy.machineState.operandA = setDotsCount(stateCopy);
      }
      return stateCopy;
    }
    case ACTIONS.REMOVE_DOT:
      console.log('REMOVE_DOT');
      stateCopy = { ...state };
      if (stateCopy.positivePowerZoneDots[action.zoneId].hasOwnProperty(action.dotId)) { //
                // let dot = stateCopy.positivePowerZoneDots[action.zoneId][action.dotId];
        delete stateCopy.positivePowerZoneDots[action.zoneId][action.dotId];
                // ObjPool.dispose(dot);
      }

      if (stateCopy.negativePowerZoneDots[action.zoneId].hasOwnProperty(action.dotId)) {
        delete stateCopy.negativePowerZoneDots[action.zoneId][action.dotId];
      }

      if (stateCopy.machineState.usage_mode === USAGE_MODE.FREEPLAY &&
        stateCopy.machineState.operator_mode === OPERATOR_MODE.DISPLAY) {
        stateCopy.machineState.operandA = setDotsCount(stateCopy);
      }
      return stateCopy;

    case ACTIONS.ADD_MULTIPLE_DOTS:
      console.log('ADD_MULTIPLE_DOTS');
      stateCopy = { ...state };
      action.dotsPos.forEach((newDot) => {
        const dot = {};
        dot.x = newDot.x;
        dot.y = newDot.y;
        dot.powerZone = action.zoneId;
        dot.id = makeUID();
        dot.isPositive = action.isPositive;
        dot.color = action.color;
        if (dot.isPositive) {
          stateCopy.positivePowerZoneDots[action.zoneId][dot.id] = dot;// .push(dot);
        } else {
          stateCopy.negativePowerZoneDots[action.zoneId][dot.id] = dot;// .push(dot);
        }
      });
      if (action.updateValue) {
        if (stateCopy.machineState.usage_mode === USAGE_MODE.FREEPLAY &&
          stateCopy.machineState.operator_mode === OPERATOR_MODE.DISPLAY) {
          stateCopy.machineState.operandA = setDotsCount(stateCopy).toString();
        }
      }
      return stateCopy;

    case ACTIONS.REMOVE_MULTIPLE_DOTS:
      stateCopy = { ...state };
      console.log('REMOVE_MULTIPLE_DOTS amount:', action.dots.length, ' zone:', action.zoneId);
      if (action.dots.length > 0) {
        let i = action.dots.length;
        while (i >= 0) {
          const dot = action.dots[i];
          if (dot.isPositive) {
            if (stateCopy.positivePowerZoneDots[action.zoneId].hasOwnProperty(dot.id)) {
              delete stateCopy.positivePowerZoneDots[action.zoneId][dot.id];
            }
          } else if (stateCopy.negativePowerZoneDots[action.zoneId].hasOwnProperty(dot.id)) {
            delete stateCopy.negativePowerZoneDots[action.zoneId][dot.id];
          }
          i -= 1;
        }
      }
      if (action.updateValue) {
        if (stateCopy.machineState.usage_mode === USAGE_MODE.FREEPLAY &&
          stateCopy.machineState.operator_mode === OPERATOR_MODE.DISPLAY) {
          stateCopy.machineState.operandA = setDotsCount(stateCopy);
        }
      }
      return stateCopy;
    case ACTIONS.REZONE_DOT:
      stateCopy = { ...state };
      if (action.dot.isPositive) {
        let i = stateCopy.positivePowerZoneDots.length;
        while (i >= 0) {
          if (stateCopy.positivePowerZoneDots[i][action.dot.id] !== undefined) {
            stateCopy.positivePowerZoneDots[i][action.dot.id].powerZone = action.zoneId;
            stateCopy.positivePowerZoneDots[action.zoneId][action.dot.id] = stateCopy.positivePowerZoneDots[i][action.dot.id]; // eslint-disable-line max-len
            delete stateCopy.positivePowerZoneDots[i][action.dot.id];
            break;
          }
          i -= 1;
        }
      } else {
        let i = stateCopy.negativePowerZoneDots.length;
        while (i >= 0) {
          if (stateCopy.negativePowerZoneDots[i][action.dot.id] !== undefined) {
            stateCopy.negativePowerZoneDots[i][action.dot.id].powerZone = action.zoneId;
            stateCopy.negativePowerZoneDots[action.zoneId][action.dot.id] = stateCopy.negativePowerZoneDots[i][action.dot.id]; // eslint-disable-line max-len
            delete stateCopy.negativePowerZoneDots[i][action.dot.id];
            break;
          }
        }
        i -= 1;
      }
      if (action.updateValue) {
        if (stateCopy.machineState.usage_mode === USAGE_MODE.FREEPLAY &&
          stateCopy.machineState.operator_mode === OPERATOR_MODE.DISPLAY) {
          stateCopy.machineState.operandA = setDotsCount(stateCopy);
        }
      }
      return stateCopy;
    case ACTIONS.SET_DIVISION_RESULT:
      stateCopy = { ...state };
            // console.log('SET_DIVISION_RESULT', action.zoneId, action.divisionValue);
      if (action.isPositive) {
        stateCopy.positiveDividerResult[action.zoneId] = action.divisionValue;
      } else {
        stateCopy.negativeDividerResult[action.zoneId] = action.divisionValue;
      }
            // console.log(stateCopy.positiveDividerResult);
      return stateCopy;
    case ACTIONS.SHOW_HIDE_PLACE_VALUE:
      stateCopy = { ...state };
      stateCopy.machineState.placeValueOn = !stateCopy.machineState.placeValueOn;
      return stateCopy;
    case ACTIONS.OPERAND_CHANGED:
      stateCopy = { ...state };
      if (action.operandPos === OPERAND_POS.LEFT) {
        if (stateCopy.machineState.base[1] !== BASE.BASE_X) {
          stateCopy.machineState.operandA = action.value;
        } else {
          stateCopy.machineState.operandA = addSuperscriptWhereNeeded(action.value);
        }
      } else if (action.operandPos === OPERAND_POS.RIGHT) {
        if (stateCopy.machineState.base[1] !== BASE.BASE_X) {
          stateCopy.machineState.operandB = action.value;
        } else {
          stateCopy.machineState.operandB = addSuperscriptWhereNeeded(action.value);
        }
      }
      return stateCopy;
    case ACTIONS.OPERATOR_CHANGED:
      stateCopy = { ...state };
      console.log(ACTIONS.OPERATOR_CHANGED, action.value);
      stateCopy.machineState.operator_mode = action.value;
      return stateCopy;
    case ACTIONS.ACTIVATE_MAGIC_WAND:
      console.log(ACTIONS.ACTIVATE_MAGIC_WAND);
      stateCopy = { ...state };
      stateCopy.machineState.magicWandIsActive = action.active;
      return stateCopy;
    case ACTIONS.BASE_CHANGED: {
      console.log(ACTIONS.BASE_CHANGED);
      stateCopy = { ...state };
      let index = _array.indexOf(state.machineState.allBases, state.machineState.base);
      if (index < state.machineState.allBases.length - 1) {
        index += 1;
      } else {
        index = 0;
      }
      stateCopy.machineState.base = state.machineState.allBases[index];
      if (stateCopy.machineState.usage_mode === USAGE_MODE.FREEPLAY &&
        stateCopy.machineState.operator_mode === OPERATOR_MODE.DISPLAY) {
        stateCopy.machineState.operandA = setDotsCount(stateCopy);
      }
      return stateCopy;
    }
    case ACTIONS.RESET:
      console.log(ACTIONS.RESET);
      initialMachineState.operandA = '';
      initialMachineState.operandB = '';
      if (action.machineState) { // we are at the start of an activity
                // This is a hack for receiving the bases in a string format.
                // Must be done here, before the props are read only
                // TODO find a better way to do this
        if (typeof (action.machineState.allBases) === 'string') {
          // eslint-disable-next-line no-param-reassign
          action.machineState.allBases = BASE[action.machineState.allBases];
        }
        setMachineState = { ...action.machineState };
        initialMachineState = { ...setMachineState };
      } else if (state.machineState.usage_mode === USAGE_MODE.EXERCISE) {
                // reset button in Exercise mode, repopulate with starting value
        initialMachineState = { ...setMachineState };
        initialMachineState.startActivity = true;
      }
      initialMachineState.activityStarted = false;
      initialMachineState.errorMessage = '';
      return setInitialState();
    case ACTIONS.ERROR:
      console.log(ACTIONS.ERROR);
      stateCopy = { ...state };
      stateCopy.machineState.errorMessage = action.errorMessage;
      stateCopy.machineState.startActivity = false;
      stateCopy.machineState.activityStarted = true;
      return stateCopy;
    case ACTIONS.USER_MESSAGE:
      console.log(ACTIONS.USER_MESSAGE);
      stateCopy = { ...state };
      stateCopy.machineState.userMessage = action.message;
      return stateCopy;
    case ACTIONS.RESET_USER_MESSAGE:
      console.log(ACTIONS.RESET_USER_MESSAGE);
      stateCopy = { ...state };
      stateCopy.machineState.userMessage = '';
      return stateCopy;
    default:
      console.log('DEFAULT');
      return state;
  }
};
export default dotsReducer;

