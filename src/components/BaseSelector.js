import React, {Component, PropTypes} from 'react';

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
                <button onClick={this.props.onClick} className="base">{this.props.base[0]} <i className="fa fa-long-arrow-left"></i> {this.props.base[1]}</button>
            </div>
        );
    }
}
