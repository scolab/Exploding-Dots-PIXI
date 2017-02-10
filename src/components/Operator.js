import React, {Component, PropTypes} from 'react';
import {MODE} from '../Constants';

export default class Operator extends Component {

    static propTypes = {
        mode: React.PropTypes.oneOf([MODE.DISPLAY, MODE.ADDITION, MODE.SUBTRACT, MODE.MULTIPLY, MODE.DIVIDE]).isRequired,
    };

    constructor(props) {
        super(props);
    }

    render(){
        let display = '';
        let text = '';
        switch (this.props.mode){
            case MODE.DISPLAY:
                //display = 'fa fa-arrows-h';
                text = " is ";
                break;
            case MODE.ADDITION:
                display = 'fa fa-plus';
                break;
            case MODE.SUBTRACT:
                display = 'fa fa-minus';
                break;
            case MODE.MULTIPLY:
                display = 'fa fa-times';
                break;
            case MODE.DIVIDE:
                display = 'fa fa-hand-spock-o';
                break;
        }
        return (
            <div>
                <i className={display}>{text}</i>
            </div>
        );
    }

}



