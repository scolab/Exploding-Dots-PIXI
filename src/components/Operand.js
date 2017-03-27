import React, {Component, PropTypes} from 'react';
import {OPERATOR_MODE, USAGE_MODE, OPERAND_POS} from '../Constants';
import img from './images/input1x.png';

export default class Operand extends Component {

    static propTypes = {
        value: PropTypes.any.isRequired,
        operator_mode: PropTypes.oneOf([OPERATOR_MODE.DISPLAY, OPERATOR_MODE.ADDITION, OPERATOR_MODE.SUBTRACT, OPERATOR_MODE.MULTIPLY, OPERATOR_MODE.DIVIDE]),
        usage_mode: PropTypes.oneOf([USAGE_MODE.FREEPLAY, USAGE_MODE.OPERATION, USAGE_MODE.EXERCISE]),
        onChange: PropTypes.func.isRequired,
        pos: PropTypes.string.isRequired,
        activityStarted: PropTypes.bool.isRequired,
    };

    constructor(props) {
        super(props);
    }

    onChange(e) {
        e.preventDefault();
        if(this.props.usage_mode === USAGE_MODE.OPERATION) {
            if(this.props.operator_mode === OPERATOR_MODE.MULTIPLY && this.props.pos === OPERAND_POS.RIGHT){
                // no | in right operand in multiply
                var reg = new RegExp('^$|^[0-9]+$');
            }else if(this.props.operator_mode === OPERATOR_MODE.SUBTRACT || this.props.operator_mode === OPERATOR_MODE.DIVIDE) {
                /*
                Allow the string to be:
                 - empty
                 - a single minus (-) sign. Needed to start writing a first negative number
                 - Digits, between 1 and 5
                 - minus (-) sign followed by digits
                 - Pipe (|) followed by a minus sign or digits
                 - A maximum of 5 of those pattern
                */
                var reg = new RegExp(/^$|^-$|^(-?[\d]{1,5})(\|-?[\d]{0,5}?){0,4}$/);

            }else{
                var reg = new RegExp('^$|^[|0-9]+$');
            }
        }else{
            var reg = new RegExp('^$|^[0-9]+$');
        }
        if (reg.test(e.target.value)) {
            this.props.onChange(this.props.pos, e.target.value);
        }
    }

    onSubmit(e) {
        e.preventDefault();
    }

    componentDidMount() {
        this.checkIfInputActive();
    }

    componentDidUpdate(){
        this.checkIfInputActive();
    }

    checkIfInputActive(){
        if(this.inputText) {
            if (this.props.usage_mode == USAGE_MODE.EXERCISE ||
                this.props.activityStarted ||
                this.props.operator_mode === OPERATOR_MODE.DISPLAY && this.props.usage_mode === USAGE_MODE.FREEPLAY) {
                this.inputText.disabled = true;
            }else if(this.props.usage_mode == USAGE_MODE.OPERATION &&
                this.props.activityStarted === false){
                this.inputText.disabled = false;
            }
        }
    }

    render() {
        //console.log(this.props);
        if (this.props.pos === OPERAND_POS.LEFT) {
            return (
                <div className="operationItem">
                    <form onSubmit={this.onSubmit.bind(this)}>
                        <input
                            style={{
                                backgroundImage: `url(${img})`,
                                backgroundRepeat: `no-repeat`,
                                backgroundColor: `Transparent`,
                                border: `none`,
                                overflow: `hidden`,
                                width: 252,
                                height: 45,
                                fontFamily: 'museo-slab',
                                fontSize: 24,
                                textAlign: 'center'
                            }}
                            type="text"
                            onChange={this.onChange.bind(this)}
                            value={this.props.value}
                            ref={(inputText) => {
                                this.inputText = inputText;
                            }}/>
                    </form>
                </div>
            );
        } else if (this.props.pos === OPERAND_POS.RIGHT) {
            let visible = this.props.operator_mode != OPERATOR_MODE.DISPLAY;
            if (visible) {
                return (
                    <div className="operationItem">
                        <form onSubmit={this.onSubmit.bind(this)}>
                            <input
                                style={{
                                    backgroundImage: `url(${img})`,
                                    backgroundRepeat: `no-repeat`,
                                    backgroundColor: `Transparent`,
                                    border: `none`,
                                    overflow: `hidden`,
                                    width: 252,
                                    height: 45,
                                    fontFamily: 'museo-slab',
                                    fontSize: 24,
                                    textAlign: 'center'
                                }}
                                type="text"
                                onChange={this.onChange.bind(this)}
                                value={this.props.value}
                                ref={(inputText) => {
                                    this.inputText = inputText;
                                }}/>
                        </form>
                    </div>
                );
            } else {
                return null;
            }
        }
    }
}


