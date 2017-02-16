import React, {Component, PropTypes} from 'react';
import {OPERATOR_MODE} from '../Constants';

export default class Text extends Component {

    static propTypes = {
        operator_mode: PropTypes.oneOf([OPERATOR_MODE.DISPLAY, OPERATOR_MODE.ADDITION, OPERATOR_MODE.SUBTRACT, OPERATOR_MODE.MULTIPLY, OPERATOR_MODE.DIVIDE]),
    };

    constructor(props) {
        super(props);
    }

    render(){
        let text = '';
        if(this.props.mode === OPERATOR_MODE.DISPLAY){
            text = "The code for"
        }
        return (
            <div className="operationItem"
                style={{
                    fontFamily: 'museo-slab',
                    fontSize: 24,
                }}>{text}</div>
        )
    }
}
