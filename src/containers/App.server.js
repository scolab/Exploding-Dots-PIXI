/**
 * Created by André Lacasse on 2017-05-26.
 */
import React, {Component} from 'react';
import { OPERATOR_MODE, USAGE_MODE, BASE } from '../Constants';
import PropTypes from 'prop-types';

class ExplodingDots extends Component {
  static PropTypes = {
    base: PropTypes.array, // .isRequired,
    allBases: PropTypes.array || PropTypes.string,
    operator_mode: PropTypes.oneOf([
      OPERATOR_MODE.DISPLAY,
      OPERATOR_MODE.ADD,
      OPERATOR_MODE.SUBTRACT,
      OPERATOR_MODE.MULTIPLY,
      OPERATOR_MODE.DIVIDE]), // .isRequired,
    usage_mode: PropTypes.oneOf([
      USAGE_MODE.OPERATION,
      USAGE_MODE.FREEPLAY,
      USAGE_MODE.EXERCISE]), // .isRequired,
    magicWandIsActive: PropTypes.bool, // .isRequired,
    baseSelectorVisible: PropTypes.bool, // .isRequired,
    placeValueSwitchVisible: PropTypes.bool, // .isRequired,
    magicWandVisible: PropTypes.bool, // .isRequired,
    resetVisible: PropTypes.bool, // .isRequired,
    loginVisible: PropTypes.bool, // .isRequired,
    zones: PropTypes.number, // .isRequired,
    maxViewableDots: PropTypes.number, // .isRequired,
    operandA: PropTypes.string,
    operandB: PropTypes.string,
    startActivity: PropTypes.bool,
    activityStarted: PropTypes.bool,
    placeValueOn: PropTypes.bool,
    cdnBaseUrl: PropTypes.string,
    errorMessage: PropTypes.string,
    userMessage: PropTypes.string,
    muted: PropTypes.bool,
    wantedResult: PropTypes.JSON,
  };

  static defaultProps = {
    base: BASE.ARITHMOS[0],
    allBases: BASE.ARITHMOS,
    operator_mode: OPERATOR_MODE.DISPLAY,
    usage_mode: USAGE_MODE.FREEPLAY,
    magicWandIsActive: false,
    baseSelectorVisible: true,
    placeValueSwitchVisible: true,
    magicWandVisible: true,
    resetVisible: true,
    loginVisible: true,
    zones: 5,
    operandA: '',
    operandB: '',
    placeValueOn: true,
    startActivity: false,
    activityStarted: false,
    // cdnBaseUrl: isDev ? '' : 'https://scolab-components.s3.amazonaws.com/exploding-dots',
    cdnBaseUrl: isDev ? '' : 'https://exploding-dots.s3.ca-central-1.amazonaws.com',
    errorMessage: '',
    userMessage: '',
    muted: true,
    wantedResult: {
      positiveDots: [],
      negativeDots: [],
      positiveDivider: [],
      negativeDivider: [],
    },
  };

  constructor(props) {
    // console.log('App constructor', props);
    super(props);
    // FIXME: find a way to use resetMachine
    // Initialize the default machineState values
    store.dispatch({
      type: 'RESET',
      machineState: Object.assign({}, props),
    });
  }

  render() {
    return (<div></div>);
  }
}

export default ExplodingDots;
