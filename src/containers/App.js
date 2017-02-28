import 'pixi.js';
import '../ExplodingDots.css';
import '../font-awesome.min.css';
import React, {Component, PropTypes} from 'react';
import {createStore} from 'redux';
import {Provider} from 'react-redux';
import rootReducer from '../reducers/index';
import DotsMachine from './DotMachine/DotMachine.pixi';
import {OPERATOR_MODE, USAGE_MODE} from '../Constants';
import {BASE} from '../Constants'
import { resetMachine } from '../actions/';

const store = createStore(rootReducer, window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__());
const isDev = process.env.NODE_ENV === 'development';

class ExplodingDots extends Component {

    static PropTypes = {
        base: PropTypes.array,
        operator_mode: PropTypes.oneOf([OPERATOR_MODE.DISPLAY, OPERATOR_MODE.ADDITION, OPERATOR_MODE.SUBTRACT, OPERATOR_MODE.MULTIPLY, OPERATOR_MODE.DIVIDE]),
        usage_mode: PropTypes.oneOf([USAGE_MODE.OPERATION, USAGE_MODE.FREEPLAY]),
        magicWandIsActive: PropTypes.bool,
        baseSelectorVisible: PropTypes.bool,
        placeValueSwitchVisible: PropTypes.bool,
        magicWandVisible: PropTypes.bool,
        resetVisible: PropTypes.bool,
        loginVisible: PropTypes.bool,
        zones: PropTypes.number,
        maxViewableDots: PropTypes.number,
        operandA: PropTypes.string,
        operandB: PropTypes.string,
        placeValueOn: PropTypes.bool,
        cdnBaseUrl: PropTypes.string,
    };

    static defaultProps = {
        base: BASE.ALL_BASE[0],
        operator_mode: OPERATOR_MODE.DISPLAY,
        usage_mode: USAGE_MODE.FREEPLAY,
        magicWandIsActive: true,
        baseSelectorVisible: true,
        placeValueSwitchVisible: true,
        magicWandVisible: true,
        resetVisible: true,
        loginVisible: true,
        zones: 5,
        maxViewableDots: 150,
        operandA: '',
        operandB: '',
        placeValueOn: true,
        cdnBaseUrl: isDev ? '' : 'https://scolab-components.s3.amazonaws.com/exploding-dots'
    };

    constructor(props) {
        super(props);

        // FIXME: find a way to use resetMachine
        // Initialize the default machineState values
        store.dispatch({
            type: "RESET",
            machineState: Object.assign({}, props)
        })
    };

    render() {
        return (
            <Provider store={store}>
                <div>
                    <DotsMachine id="0"/>
                </div>
            </Provider>
        );
    }
}

export default ExplodingDots;

