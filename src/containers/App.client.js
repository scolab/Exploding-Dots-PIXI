import 'pixi.js';
// http://www.material-ui.com/
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import injectTapEventPlugin from 'react-tap-event-plugin';

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { createStore } from 'redux';
import { Provider } from 'react-redux';
import rootReducer from '../reducers/index';
import DotsMachine from './DotMachine/DotMachine.pixi';
import { OPERATOR_MODE, USAGE_MODE, BASE } from '../Constants';

// Needed for onTouchTap
// http://stackoverflow.com/a/34015469/988941
try {
  injectTapEventPlugin();
} catch(e){
  // Preventing error if injectTapEventPlugin() is already call.
}

const isDev = process.env.NODE_ENV === 'development';

class ExplodingDots extends Component {

  static PropTypes = {
    title: PropTypes.string,
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
    title: 'default title',
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
    console.log('DotsMachine constructor', props);
    super(props);
    this.store = createStore(rootReducer,
      window.__REDUX_DEVTOOLS_EXTENSION__ &&
      window.__REDUX_DEVTOOLS_EXTENSION__());
        // FIXME: find a way to use resetMachine
        // Initialize the default machineState values
    this.store.dispatch({
      type: 'RESET',
      machineState: Object.assign({}, props),
    });
  }

  render() {
    const theme = getMuiTheme({
      fontFamily: 'Noto sans',
    });
    return (
      <Provider store={this.store}>
        <MuiThemeProvider muiTheme={theme}>
          <div>
            <DotsMachine id="0" />
          </div>
        </MuiThemeProvider>
      </Provider>
    );
  }
}

export default ExplodingDots;

