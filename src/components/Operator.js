import React, {Component, PropTypes} from 'react';
import {OPERATOR_MODE, USAGE_MODE} from '../Constants';
import imgBg from './images/operator_dropdown1x.png';
import arrow from './images/arrow_dropdown1x.png';
import DropDownMenu from 'material-ui/DropDownMenu'; // http://www.material-ui.com/
import MenuItem from 'material-ui/MenuItem'; // http://www.material-ui.com/

export default class Operator extends Component {

    static propTypes = {
        operator_mode: React.PropTypes.oneOf([OPERATOR_MODE.DISPLAY, OPERATOR_MODE.ADDITION, OPERATOR_MODE.SUBTRACT, OPERATOR_MODE.MULTIPLY, OPERATOR_MODE.DIVIDE]).isRequired,
    };

    constructor(props) {
        super(props);
    }

    handleOperandChange(event, index, value){
        //TODO : Handle the value.
        console.log(value);
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
                if(this.props.usage_mode === USAGE_MODE.EXERCISE){
                    return (
                         <div className="operationItem"
                            style={{
                                fontFamily: 'museo-slab',
                                    fontSize: 24,
                                    backgroundImage: `url(${imgBg})`,
                                    backgroundRepeat: `no-repeat`,
                                    backgroundColor: `Transparent`,
                                    border: `none`,
                                    width: 77,
                                    height: 45}}>
                            <i className={display} style={{marginTop: 11}}>{text}</i>
                        </div>
                    )
                }else if(this.props.usage_mode === USAGE_MODE.OPERATION) {
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
                            <DropDownMenu value={OPERATOR_MODE.ADDITION} onChange={this.handleOperandChange}>
                                <MenuItem value={OPERATOR_MODE.ADDITION} primaryText="ADDITION" />
                                <MenuItem value={OPERATOR_MODE.MULTIPLY} primaryText="MULTIPLY" />
                            </DropDownMenu>
                        </div>
                    );
                }
            case OPERATOR_MODE.SUBTRACT:
                display = 'fa fa-minus';
                return (
                    <div className="operationItem"
                         style={{
                             fontFamily: 'museo-slab',
                             fontSize: 24,
                             backgroundImage: `url(${imgBg})`,
                             backgroundRepeat: `no-repeat`,
                             backgroundColor: `Transparent`,
                             border: `none`,
                             width: 77,
                             height: 45}}>
                        <i className={display} style={{marginTop: 11}}>{text}</i>
                    </div>
                );
                break;
            case OPERATOR_MODE.MULTIPLY:
                display = 'fa fa-times';
                if(this.props.usage_mode === USAGE_MODE.EXERCISE) {
                    return (
                        <div className="operationItem"
                             style={{
                                 fontFamily: 'museo-slab',
                                 fontSize: 24,
                                 backgroundImage: `url(${imgBg})`,
                                 backgroundRepeat: `no-repeat`,
                                 backgroundColor: `Transparent`,
                                 border: `none`,
                                 width: 77,
                                 height: 45}}>
                            <i className={display} style={{marginTop: 10}}>{text}</i>
                        </div>
                    );
                }else if(this.props.usage_mode === USAGE_MODE.OPERATION) {
                    return (
                        <div className="operationItem">
                            <DropDownMenu value={OPERATOR_MODE.MULTIPLY} onChange={this.handleOperandChange}>
                                <MenuItem value={OPERATOR_MODE.ADDITION} primaryText="ADDITION" />
                                <MenuItem value={OPERATOR_MODE.MULTIPLY} primaryText="MULTIPLY" />
                            </DropDownMenu>
                        </div>
                    )
                }
                break;
            case OPERATOR_MODE.DIVIDE:
                display = 'fa fa-hand-spock-o';
                break;
        }

    }

}



