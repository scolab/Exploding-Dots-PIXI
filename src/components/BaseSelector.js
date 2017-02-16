import React, {Component, PropTypes} from 'react';
import BG from './images/rule_dropdown1x.png';

export default class BaseSelector extends Component {
    static propTypes = {
        onClick: React.PropTypes.func.isRequired,
        base: React.PropTypes.array.isRequired,
    };

    constructor(props) {
        super(props);
    }

    render(){
        return (
            <div>
                <button style={{backgroundImage:`url(${BG})`,
                                backgroundRepeat:`no-repeat`,
                                backgroundColor:`Transparent`,
                                border:`none`,
                                cursor:`pointer`,
                                overflow:`hidden`,
                                width:140,
                                height:55}} type='button' onClick={this.props.onClick}>
                    <div style={{marginBottom:10,
                                marginRight:10,
                                fontFamily: 'museo-slab',
                                fontSize: 24}}>
                    {this.props.base[0]} <i className="fa fa-long-arrow-left"></i> {this.props.base[1]}
                    </div>
                </button>
            </div>
        );
    }
}
