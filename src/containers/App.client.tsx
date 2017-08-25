import 'pixi.js';
// http://www.material-ui.com/
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import injectTapEventPlugin from 'react-tap-event-plugin';

import React, {Component} from 'react';
import {createStore, Store, StoreCreator} from 'redux';
import { Provider } from 'react-redux';
import rootReducer from '../reducers/index';
import DotsMachine from './DotMachine/DotMachine.pixi';
import {OPERATOR_MODE, USAGE_MODE, BASE, IOPERATOR_MODE, IUSAGE_MODE} from '../Constants';
// Needed for onTouchTap
// http://stackoverflow.com/a/34015469/988941
try {
  injectTapEventPlugin();
} catch (e) {
  // Preventing error if injectTapEventPlugin() is already call.
}

const isDev: boolean = process.env.NODE_ENV === 'development';
// 'https://exploding-dots.s3.ca-central-1.amazonaws.com'
const awsURL: string = process.env.AWS_URL || 'https://s3.amazonaws.com/exploding-dots-dev';

interface IProps {
  title?: string;
  base?: Array<number | string>;
  allBases?: number[][] | any[][] | string;
  operator_mode?: string;
  usage_mode?: string;
  magicWandIsActive?: boolean;
  placeValueSwitchVisible?: boolean;
  magicWandVisible?: boolean;
  resetVisible?: boolean;
  baseSwitchVisible?: boolean;
  numberValueVisible?: boolean;
  machineCodeVisible?: boolean;
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
  successAction?: (name: string) => any;
  resetAction?: (name: string) => any;
}

class ExplodingDots extends Component<IProps, {}> {

  public static defaultProps: Partial<IProps> = {
    title: 'default title',
    base: BASE.ARITHMOS[0],
    allBases: BASE.ARITHMOS,
    operator_mode: OPERATOR_MODE.DISPLAY,
    usage_mode: USAGE_MODE.FREEPLAY,
    magicWandIsActive: false,
    placeValueSwitchVisible: true,
    magicWandVisible: true,
    resetVisible: false,
    baseSwitchVisible: true,
    numberValueVisible: true,
    machineCodeVisible: true,
    zones: 5,
    operandA: '',
    operandB: '',
    placeValueOn: true,
    startActivity: false,
    activityStarted: false,
    cdnBaseUrl: isDev ? '' : awsURL,
    errorMessage: '',
    userMessage: '',
    muted: false,
    wantedResult: {
      positiveDots: [],
      negativeDots: [],
      positiveDivider: [],
      negativeDivider: [],
    },
    successAction: undefined,
    resetAction: undefined,
  };

  private store: Store<any>;

  constructor(props) {
        // console.log('App constructor', props);
    super(props);
    // tslint:disable-next-line no-string-literal
    const enhancer: StoreCreator = window['devToolsExtension'] ?
      window['devToolsExtension']()(createStore) : createStore; // tslint:disable-line no-string-literal
    this.store = enhancer(rootReducer);
    // FIXME: find a way to use resetMachine
    // Initialize the default machineState values
    this.store.dispatch({
      type: 'RESET',
      machineState: Object.assign({}, props),
      title: props.title,
    });
  }

  public render(): JSX.Element {
    const theme = getMuiTheme({
      fontFamily: 'Noto sans',
    });
    return (
      <Provider store={this.store}>
        <MuiThemeProvider muiTheme={theme}>
          <div>
            <DotsMachine id='0' />
          </div>
        </MuiThemeProvider>
      </Provider>
    );
  }
}

export default ExplodingDots;
