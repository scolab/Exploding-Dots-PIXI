import React, {Component, PropTypes} from 'react';

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
            <div>
                <button onClick={this.props.onClick} className="resetBtn"><i className="fa fa-refresh"></i></button>
            </div>
        );
    }
}


