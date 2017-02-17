import React, {Component, PropTypes} from 'react';
import {OPERATOR_MODE, USAGE_MODE, OPERAND_POS} from '../Constants';
import img from './images/input1x.png';

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
                <div className="operationItem">
                    <form>
                        <input
                            style={{backgroundImage:`url(${img})`,
                                backgroundRepeat:`no-repeat`,
                                backgroundColor:`Transparent`,
                                border:`none`,
                                overflow:`hidden`,
                                width:252,
                                height:45,
                                fontFamily: 'museo-slab',
                                fontSize: 24,
                                textAlign: 'center'
                            }}
                            type="text"
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
                        <input className="imageButton"
                               style={{backgroundImage:`url(${img})`,
                                width:252,
                                height:45}}
                            type="text"
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


