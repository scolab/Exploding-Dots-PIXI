import React, {Component, PropTypes} from 'react';
import {OPERATOR_MODE, USAGE_MODE, OPERAND_POS} from '../Constants';

export default class Operand extends Component {

    static propTypes = {
        value: PropTypes.any.isRequired,
        operator_mode: PropTypes.oneOf([OPERATOR_MODE.DISPLAY, OPERATOR_MODE.ADDITION, OPERATOR_MODE.SUBTRACT, OPERATOR_MODE.MULTIPLY, OPERATOR_MODE.DIVIDE]),
        usage_mode: PropTypes.oneOf([USAGE_MODE.FREEPLAY, USAGE_MODE.OPERATION]),
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
        if(this.props.usage_mode == USAGE_MODE.FREEPLAY) {
            if(this.inputText) {
                this.inputText.disabled = true;
            }
        }
    }

    render(){
        if(this.props.pos == OPERAND_POS.RIGHT && this.props.usage_mode == USAGE_MODE.FREEPLAY){
            return <div></div>
        }else if(this.props.pos == OPERAND_POS.LEFT && this.props.usage_mode == USAGE_MODE.FREEPLAY) {
            return (
                <div>
                    <form>
                        <input type="text"
                               value={this.props.value}
                               ref={(inputText) => {
                                   this.inputText = inputText;
                               }}/>
                    </form>
                </div>
            );
        }else{
            return (
                <div>
                    <form>
                        <input type="text"
                               onChange={this.onChange.bind(this)}
                               value={this.props.value}
                               ref={(inputText) => {
                                   this.inputText = inputText;
                               }}/>
                    </form>
                </div>
            );
        }
    }
}


