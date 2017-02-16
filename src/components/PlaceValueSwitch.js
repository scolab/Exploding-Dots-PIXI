import React, {Component, PropTypes} from 'react';
import img from './images/burger1x.png';

export default class PlaceValueSwitch extends Component {

    static propTypes = {
        visible: React.PropTypes.bool.isRequired,
        onClick: React.PropTypes.func.isRequired
    };

    constructor(props) {
        super(props);
    }

    render(){
        return (
            <div className="topRightMenuItem" style={{marginRight:33}}>
                <button
                    style={{backgroundImage:`url(${img})`,
                        backgroundRepeat:`no-repeat`,
                        backgroundColor:`Transparent`,
                        border:`none`,
                        cursor:`pointer`,
                        overflow:`hidden`,
                        width:46,
                        height:46}}
                    onClick={this.props.onClick}></button>
            </div>
        );
    }
}

