import React, {Component, PropTypes} from 'react';
import img from './images/login1x.png';

export default class Login extends Component {

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
                <button style={{backgroundImage:`url(${img})`,
                    backgroundRepeat:`no-repeat`,
                    backgroundColor:`Transparent`,
                    border:`none`,
                    cursor:`pointer`,
                    overflow:`hidden`,
                    width:76,
                    height:46}}
                        type='button'
                        onClick={() => this.props.onClick(true)}></button>
            </div>
        );
    }
}
