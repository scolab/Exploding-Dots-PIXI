import React, {Component, PropTypes} from 'react';
import {OPERATOR_MODE, USAGE_MODE} from '../Constants';
import imgBg from './images/operator_dropdown1x.png';
import arrow from './images/arrow_dropdown1x.png';
import Dropdown from 'react-toolbox/lib/dropdown';

export default class Operator extends Component {

    static propTypes = {
        operator_mode: React.PropTypes.oneOf([OPERATOR_MODE.DISPLAY, OPERATOR_MODE.ADDITION, OPERATOR_MODE.SUBTRACT, OPERATOR_MODE.MULTIPLY, OPERATOR_MODE.DIVIDE]).isRequired,
    };

    constructor(props) {
        super(props);
    }

    handleOperandChange(){

    }

    render(){
        let display = '';
        let text = '';
        switch (this.props.operator_mode){
            case OPERATOR_MODE.DISPLAY:
                if(this.props.usage_mode === USAGE_MODE.FREEPLAY) {
                    text = " is ";
                }else{
                    text = "dots in the machine";
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
            case OPERATOR_MODE.ADDITION:
                display = 'fa fa-plus';
                let choices = [
                    {value: OPERATOR_MODE.ADDITION, label: 'fa fa-plus'},
                    {value: OPERATOR_MODE.MULTIPLY, label: 'fa fa-times'},
                ];
                return (
                   /* <div
                        className="operationItem"
                        style={{
                            fontFamily: 'museo-slab',
                            fontSize: 24,
                        }}>
                        <button className="imageButton" style={{backgroundImage:`url(${imgBg})`,
                            width:77,
                            height:45}} type='button'>
                            <i className={display}>{text}</i>
                            <img src={arrow} style={{float:'right', marginRight:'7px', marginTop:'5px'}}/>
                        </button>
                    </div>*/
                    <div className="operationItem">
                        <Dropdown
                            auto={false}
                            source={choices}
                            onChange={this.handleOperandChange}
                            value={OPERATOR_MODE.ADDITION}
                        />
                    </div>
                );
            case OPERATOR_MODE.SUBTRACT:
                display = 'fa fa-minus';
                break;
            case OPERATOR_MODE.MULTIPLY:
                display = 'fa fa-times';
                return (
                    <div
                        className="operationItem"
                        style={{
                            fontFamily: 'museo-slab',
                            fontSize: 24,
                        }}>
                        <button className="imageButton" style={{backgroundImage:`url(${imgBg})`,
                            width:77,
                            height:45}} type='button'>
                            <i className={display}>{text}</i>
                            <img src={arrow} style={{float:'right', marginRight:'7px', marginTop:'5px'}}/>
                        </button>
                    </div>
                );
                break;
            case OPERATOR_MODE.DIVIDE:
                display = 'fa fa-hand-spock-o';
                break;
        }

    }

}



