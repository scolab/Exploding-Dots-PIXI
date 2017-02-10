import React, {Component, PropTypes} from 'react';
import {MODE} from '../Constants';

export default class Operand extends Component {

    static propTypes = {
        value: PropTypes.any.isRequired,
        mode: PropTypes.oneOf([MODE.DISPLAY, MODE.ADDITION, MODE.SUBTRACT, MODE.MULTIPLY, MODE.DIVIDE]),
        onChange: PropTypes.func.isRequired,
        pos: PropTypes.string.isRequired,
    };

    constructor(props) {
        super(props);
    }

    onChange(e){
        e.preventDefault();
        var reg = new RegExp('^[0-9a-bA-B]+$');
        if (reg.test(e.target.value)) {
            this.props.onChange(e, this.props.pos);
        }
    }

    componentDidMount(){
        if(this.props.mode == MODE.DISPLAY) {
            this.inputText.disabled = true;
        }
    }

    render(){
        return (
            <div>
                <form>
                    <input type="text"
                           onChange={this.onChange.bind(this)}
                           value={this.props.value}
                           ref={(inputText) => { this.inputText = inputText; }}/>
                </form>
            </div>
        );
    }
}


