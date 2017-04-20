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
                if(this.props.usage_mode === USAGE_MODE.EXERCISE){
                    return (
                         <div className="operationItem"
                            style={{
                                fontFamily: 'Noto Sans',
                                fontWeight:'bold',
                                fontSize: 32,
                                backgroundImage: `url(${imgBg})`,
                                backgroundRepeat: `no-repeat`,
                                backgroundColor: `Transparent`,
                                border: `none`,
                                width: 77,
                                height: 45}}>
                            <p style={{marginTop: 2}}>&#43;</p>
                        </div>
                    )
                }else if(this.props.usage_mode === USAGE_MODE.OPERATION) {
                    return (
                        <DropDownMenu style={{
                            backgroundColor : '#FFFFFF',
                            borderRadius: '23px'
                            }} labelStyle={{fontSize:'32px'}} menuItemStyle={{fontSize:'32px'}} value={OPERATOR_MODE.ADDITION} onChange={this.handleOperandChange.bind(this)} disabled={this.props.activityStarted}>
                            <MenuItem value={OPERATOR_MODE.ADDITION} primaryText='&#43;' />
                            <MenuItem value={OPERATOR_MODE.MULTIPLY} primaryText='&#215;' />
                        </DropDownMenu>
                    );
                }
            case OPERATOR_MODE.SUBTRACT:
                return (
                    <div className="operationItem"
                         style={{
                             fontFamily: 'Noto Sans',
                             fontWeight:'bold',
                             fontSize: 32,
                             backgroundImage: `url(${imgBg})`,
                             backgroundRepeat: `no-repeat`,
                             backgroundColor: `Transparent`,
                             border: `none`,
                             width: 77,
                             height: 45}}>
                        <p style={{marginTop: 2}}>&#8722;</p>
                    </div>
                );
                break;
            case OPERATOR_MODE.MULTIPLY:
                if(this.props.usage_mode === USAGE_MODE.EXERCISE) {
                    return (
                        <div className="operationItem"
                             style={{
                                 fontFamily: 'Noto Sans',
                                 fontWeight:'bold',
                                 fontSize: 32,
                                 backgroundImage: `url(${imgBg})`,
                                 backgroundRepeat: `no-repeat`,
                                 backgroundColor: `Transparent`,
                                 border: `none`,
                                 width: 77,
                                 height: 45}}>
                            <p style={{marginTop: 3}}>&#215;</p>
                        </div>
                    );
                }else if(this.props.usage_mode === USAGE_MODE.OPERATION) {
                    return (
                        <DropDownMenu style={{
                            backgroundColor : '#FFFFFF',
                            borderRadius: '23px',
                            marginLeft: '10px'
                        }}
                          labelStyle={{fontSize:'32px', lineHeight:'38px', marginBottom:'-8px', marginTop:'5px', padding:'0 40px'}}
                          iconStyle={{top:'0px', right:'0px'}}
                          menuItemStyle={{fontSize:'32px'}}
                          value={OPERATOR_MODE.MULTIPLY}
                          onChange={this.handleOperandChange.bind(this)}
                          disabled={this.props.activityStarted}
                        >
                            <MenuItem value={OPERATOR_MODE.ADDITION} primaryText='&#43;' />
                            <MenuItem value={OPERATOR_MODE.MULTIPLY} primaryText='&#215;' />
                        </DropDownMenu>
                    )
                }
                break;
            case OPERATOR_MODE.DIVIDE:
                return (
                    <div className="operationItem"
                         style={{
                             fontFamily: 'Noto Sans',
                             fontWeight:'bold',
                             fontSize: 32,
                             backgroundImage: `url(${imgBg})`,
                             backgroundRepeat: `no-repeat`,
                             backgroundColor: `Transparent`,
                             border: `none`,
                             width: 77,
                             height: 45
                         }}>
                        <p style={{marginTop: 3}}>&#247;</p>
                    </div>
                );
                break;
        }

    }

}



