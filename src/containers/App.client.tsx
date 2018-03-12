import 'pixi.js';
import initReactFastclick from 'react-fastclick';

import React, {Component} from 'react';
import {createStore, Store, StoreCreator} from 'redux';
import { Provider } from 'react-redux';
import rootReducer from '../reducers/index';
import DotsMachine from './DotMachine/DotMachine.pixi';
import {OPERATOR_MODE, USAGE_MODE, BASE} from '../Constants';
import { ACTIONS } from '../actions/StoreConstants';
import { IWantedResult } from '../interfaces/IWantedResult';
// Needed for onTouchTap
// http://stackoverflow.com/a/34015469/988941
try {
  initReactFastclick();
} catch (e) {
  // Preventing error if initReactFastclick() is already call.
}

const isDev: boolean = process.env.NODE_ENV === 'development';
// 'https://exploding-dots.s3.ca-central-1.amazonaws.com'
// const awsURL: string = process.env.AWS_URL || 'https://s3.amazonaws.com/exploding-dots-dev';

export interface IExplodingDotsProps {
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
  success?: boolean;
  successAction?: (name: string) => any;
  resetAction?: (name: string) => any;
  isReady?: () => any;
}

export interface IExplodingDotsState {
  muted: boolean | undefined;
}

export class ExplodingDots extends Component<IExplodingDotsProps, IExplodingDotsState> {

  public static defaultProps: Partial<IExplodingDotsProps> = {
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
    cdnBaseUrl: '',
    errorMessage: '',
    userMessage: '',
    muted: false,
    wantedResult: {
      positiveDots: [],
      negativeDots: [],
      positiveDivider: [],
      negativeDivider: [],
    },
    success: false,
    successAction: undefined,
    resetAction: undefined,
    isReady: undefined,
  };

  private store: Store<any>;

  constructor(props: IExplodingDotsProps) {
    console.log('ExplodingDots App constructor', props);
    super(props);
    this.state = {
      muted: props.muted,
    };
    // tslint:disable-next-line no-string-literal
    const enhancer: StoreCreator = window['devToolsExtension'] ?
      window['devToolsExtension']()(createStore) : createStore; // tslint:disable-line no-string-literal
    this.store = enhancer(rootReducer);
    // FIXME: find a way to use resetMachine
    // Initialize the default machineState values
    this.store.dispatch({
      type: ACTIONS.RESET,
      machineState: Object.assign({}, props),
      title: props.title,
    });
  }

  public componentWillReceiveProps(nextProps: IExplodingDotsProps): void {
    console.log('ExplodingDots componentWillReceiveProps');
    if (nextProps.muted !== this.state.muted) {
      this.store.dispatch({
        type: ACTIONS.CHANGE_MUTE_STATUS,
        status: nextProps.muted,
      });
    }
    this.setState({
      muted: nextProps.muted,
    });
  }

  public render(): JSX.Element {
    console.log('ExplodingDots App.client render');
    return (
      <Provider store={this.store}>
          <div>
            <DotsMachine id='0' />
          </div>
      </Provider>
    );
  }
}

// export default ExplodingDots;
