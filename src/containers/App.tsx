import 'pixi.js';
// http://www.material-ui.com/
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import injectTapEventPlugin from 'react-tap-event-plugin';

import React, {Component} from 'react';
import { createStore } from 'redux';
import { Provider } from 'react-redux';
import rootReducer from '../reducers/index';
import DotsMachine from './DotMachine/DotMachine.pixi';
import {OPERATOR_MODE, USAGE_MODE, BASE, IOPERATOR_MODE, IUSAGE_MODE} from '../Constants';
import '../ExplodingDots.css';
import '../font-awesome.min.css';
// Needed for onTouchTap
// http://stackoverflow.com/a/34015469/988941
injectTapEventPlugin();

const enhancer = window['devToolsExtension'] ? window['devToolsExtension']()(createStore) : createStore;
const store = enhancer(rootReducer);

/*const store = createStore(rootReducer,
    window.__REDUX_DEVTOOLS_EXTENSION__ &&
    window.__REDUX_DEVTOOLS_EXTENSION__());*/

const isDev = process.env.NODE_ENV === 'development';

interface IProps {
  base?: Array<number | string>;
  allBases?: number[][] | any[][] | string;
  operator_mode?: string;
  usage_mode?: string;
  magicWandIsActive?: boolean;
  baseSelectorVisible?: boolean;
  placeValueSwitchVisible?: boolean;
  magicWandVisible?: boolean;
  resetVisible?: boolean;
  loginVisible?: boolean;
  zones?: number;
  maxViewableDots?: number;
  operandA?: string;
  operandB?: string;
  startActivity?: boolean;
  activityStarted?: boolean;
  placeValueOn?: boolean;
  cdnBaseUrl?: string;
  errorMessage?: string;
  userMessage?: string;
  muted?: boolean;
  wantedResult?: IWantedResult;
}

class ExplodingDots extends Component<IProps, {}> {

  public static defaultProps: Partial<IProps> = {
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

  public render() {
    const theme = getMuiTheme({
      fontFamily: 'Noto sans',
    });
    return (
      <Provider store={store}>
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

