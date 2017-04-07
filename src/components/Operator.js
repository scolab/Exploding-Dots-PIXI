import React, {Component, PropTypes} from 'react';
import {OPERATOR_MODE, USAGE_MODE} from '../Constants';
import imgBg from './images/operator_dropdown1x.png';
import arrow from './images/arrow_dropdown1x.png';
import DropDownMenu from 'material-ui/DropDownMenu'; // http://www.material-ui.com/
import MenuItem from 'material-ui/MenuItem'; // http://www.material-ui.com/

export default class Operator extends Component {

    static propTypes = {
        operator_mode: React.PropTypes.oneOf([OPERATOR_MODE.DISPLAY, OPERATOR_MODE.ADDITION, OPERATOR_MODE.SUBTRACT, OPERATOR_MODE.MULTIPLY, OPERATOR_MODE.DIVIDE]).isRequired,
        usage_mode: PropTypes.oneOf([USAGE_MODE.FREEPLAY, USAGE_MODE.OPERATION, USAGE_MODE.EXERCISE]),
        onChange: PropTypes.func.isRequired,
        activityStarted: PropTypes.bool.isRequired,
    };

    constructor(props) {
        super(props);
    }

    handleOperandChange(event, index, value){
        this.props.onChange(value);
    }

    render(){
        let mainDisplay = '';
        let secondDisplay = '';
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
                            fontFamily: 'Noto Sans',
                            fontWeight:'bold',
                            fontSize: 24,
                        }}>
                        {text}
                    </div>
                );
            case OPERATOR_MODE.ADDITION:
                mainDisplay = 'fa fa-plus';
                secondDisplay = 'fa fa-times';
                if(this.props.usage_mode === USAGE_MODE.EXERCISE){
                    return (
                         <div className="operationItem"
                            style={{
                                fontFamily: 'Noto Sans',
                                fontWeight:'bold',
                                fontSize: 24,
                                backgroundImage: `url(${imgBg})`,
                                backgroundRepeat: `no-repeat`,
                                backgroundColor: `Transparent`,
                                border: `none`,
                                width: 77,
                                height: 45}}>
                            <i className={mainDisplay} style={{marginTop: 11}}>{text}</i>
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
                         <i className={mainDisplay}>{text}</i>
                         <img src={arrow} style={{float:'right', marginRight:'7px', marginTop:'5px'}}/>
                         </button>
                         </div>*/

                        <div className="operationItem"
                             style={{
                                 backgroundImage:`url(${imgBg})`,
                                 backgroundRepeat: `no-repeat`,
                                 backgroundColor: `Transparent`,
                                 border: `none`,
                                 width:77,
                                 height:45,
                                 overflow:'hidden'
                                 }}>
                            <DropDownMenu value={OPERATOR_MODE.ADDITION} onChange={this.handleOperandChange.bind(this)} disabled={this.props.activityStarted}>
                                <MenuItem value={OPERATOR_MODE.ADDITION} primaryText='+' />
                                <MenuItem value={OPERATOR_MODE.MULTIPLY} primaryText='*' />
                            </DropDownMenu>
                        </div>
                    );
                }
            case OPERATOR_MODE.SUBTRACT:
                mainDisplay = 'fa fa-minus';
                return (
                    <div className="operationItem"
                         style={{
                             fontFamily: 'Noto Sans',
                             fontWeight:'bold',
                             fontSize: 24,
                             backgroundImage: `url(${imgBg})`,
                             backgroundRepeat: `no-repeat`,
                             backgroundColor: `Transparent`,
                             border: `none`,
                             width: 77,
                             height: 45}}>
                        <i className={mainDisplay} style={{marginTop: 11}}>{text}</i>
                    </div>
                );
                break;
            case OPERATOR_MODE.MULTIPLY:
                mainDisplay = 'fa fa-times';
                if(this.props.usage_mode === USAGE_MODE.EXERCISE) {
                    return (
                        <div className="operationItem"
                             style={{
                                 fontFamily: 'Noto Sans',
                                 fontWeight:'bold',
                                 fontSize: 24,
                                 backgroundImage: `url(${imgBg})`,
                                 backgroundRepeat: `no-repeat`,
                                 backgroundColor: `Transparent`,
                                 border: `none`,
                                 width: 77,
                                 height: 45}}>
                            <i className={mainDisplay} style={{marginTop: 10}}>{text}</i>
                        </div>
                    );
                }else if(this.props.usage_mode === USAGE_MODE.OPERATION) {
                    return (
                        <div className="operationItem">
                            <DropDownMenu value={OPERATOR_MODE.MULTIPLY}
                                          onChange={this.handleOperandChange.bind(this)}
                                          disabled={this.props.activityStarted}>
                                <MenuItem value={OPERATOR_MODE.ADDITION} primaryText="+" />
                                <MenuItem value={OPERATOR_MODE.MULTIPLY} primaryText="*" />
                            </DropDownMenu>
                        </div>
                    )
                }
                break;
            case OPERATOR_MODE.DIVIDE:
                mainDisplay = 'fa fa-hand-spock-o';
                return (
                    <div className="operationItem"
                         style={{
                             fontFamily: 'Noto Sans',
                             fontWeight:'bold',
                             fontSize: 24,
                             backgroundImage: `url(${imgBg})`,
                             backgroundRepeat: `no-repeat`,
                             backgroundColor: `Transparent`,
                             border: `none`,
                             width: 77,
                             height: 45
                         }}>
                        <i className={mainDisplay} style={{marginTop: 11}}>{text}</i>
                    </div>
                );
                break;
        }

    }

}



