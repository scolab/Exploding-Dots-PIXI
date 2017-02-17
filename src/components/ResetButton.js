import React, {Component, PropTypes} from 'react';
import img from './images/refresh1x.png';

export default class ResetButton extends Component {

    static propTypes = {
        onClick: React.PropTypes.func.isRequired,
        visible: React.PropTypes.bool.isRequired,
    };

    constructor(props) {
        super(props);
    }

    render(){
        return (
            <div className="topRightMenuItem">
                <button className="imageButton" style={{backgroundImage:`url(${img})`,
                    width:46,
                    height:46}} type='button'
                        onClick={this.props.onClick}></button>
            </div>
        );
    }
}


