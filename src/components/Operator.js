import React, {Component, PropTypes} from 'react';
import {OPERATOR_MODE} from '../Constants';

export default class Operator extends Component {

    static propTypes = {
        operator_mode: React.PropTypes.oneOf([OPERATOR_MODE.DISPLAY, OPERATOR_MODE.ADDITION, OPERATOR_MODE.SUBTRACT, OPERATOR_MODE.MULTIPLY, OPERATOR_MODE.DIVIDE]).isRequired,
    };

    constructor(props) {
        super(props);
    }

    render(){
        let display = '';
        let text = '';
        switch (this.props.operator_mode){
            case OPERATOR_MODE.DISPLAY:
                //display = 'fa fa-arrows-h';
                text = " is ";
                break;
            case OPERATOR_MODE.ADDITION:
                display = 'fa fa-plus';
                break;
            case OPERATOR_MODE.SUBTRACT:
                display = 'fa fa-minus';
                break;
            case OPERATOR_MODE.MULTIPLY:
                display = 'fa fa-times';
                break;
            case OPERATOR_MODE.DIVIDE:
                display = 'fa fa-hand-spock-o';
                break;
        }
        return (
            <div
                className="operationItem"
                style={{
                    fontFamily: 'museo-slab',
                    fontSize: 24,
                }}>
                <i className={display}>{text}</i>
            </div>
        );
    }

}



