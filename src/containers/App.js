import 'pixi.js';
import '../ExplodingDots.css';
import '../font-awesome.min.css';
import React, {Component} from 'react';
import {createStore} from 'redux';
import {Provider} from 'react-redux';
import rootReducer from '../reducers/index';
import DotsMachine from './DotMachine/DotMachine.pixi'

const store = createStore(rootReducer, window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__());

class ExplodingDots extends Component {

    constructor(props) {
        super(props);
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

