import React, {Component, PropTypes} from 'react';
import {MODE} from '../Constants';

export default class Text extends Component {

    static propTypes = {
        mode: PropTypes.oneOf([MODE.DISPLAY, MODE.ADDITION, MODE.SUBTRACT, MODE.MULTIPLY, MODE.DIVIDE]),
    };

    constructor(props) {
        super(props);
    }

    render(){
        let text = '';
        if(this.props.mode === MODE.DISPLAY){
            text = "The code for"
        }
        return (
            <div>{text}</div>
        )
    }
}
