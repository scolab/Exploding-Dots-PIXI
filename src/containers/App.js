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

const store = createStore(rootReducer, window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__());

class ExplodingDots extends Component {

    static PropTypes = {
        base: PropTypes.array.isRequired,
        operator_mode: PropTypes.oneOf([OPERATOR_MODE.DISPLAY, OPERATOR_MODE.ADDITION, OPERATOR_MODE.SUBTRACT, OPERATOR_MODE.MULTIPLY, OPERATOR_MODE.DIVIDE]).isRequired,
        usage_mode: PropTypes.oneOf([USAGE_MODE.OPERATION, USAGE_MODE.FREEPLAY]).isRequired,
        magicWandIsActive: PropTypes.bool.isRequired,
        baseSelectorDisplay: PropTypes.bool.isRequired,
        placeValueSwitch: PropTypes.bool.isRequired,
        magicWandVisible: PropTypes.bool.isRequired,
        resetVisible: PropTypes.bool.isRequired,
        loginVisible: PropTypes.bool.isRequired,
        zones: PropTypes.number.isRequired,
        maxViewableDots: PropTypes.number.isRequired,
        operandA: PropTypes.string,
        operandB: PropTypes.string,
    };

    static getDefaultProps = {
             base: BASE.ALL_BASE[0],
             operator_mode: OPERATOR_MODE.DISPLAY,
             usage_mode: USAGE_MODE.FREEPLAY,
             magicWandIsActive: false,
             baseSelectorDisplay: true,
             placeValueSwitch: false,
             magicWandVisible: true,
             resetVisible: true,
             loginVisible: true,
             zones: 5,
             maxViewableDots: 150,
             operandA: '',
             operandB: ''
    };

    constructor(props) {
        super(props);
    };

    render() {
        console.log(store);
        console.log(this.props);
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

