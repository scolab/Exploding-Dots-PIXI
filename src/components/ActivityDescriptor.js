import React, {Component, PropTypes} from 'react';

export default class ActivityDescriptor extends Component {
    static propTypes = {
        children: PropTypes.node,
    };

    render(){
        return (
            <div>
                {this.props.children}
            </div>
        );
    }
}
