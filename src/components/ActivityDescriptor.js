import React, {Component, PropTypes} from 'react';

export default class ActivityDescriptor extends Component {
    static propTypes = {
        children: PropTypes.node,
    };

    render(){
        return (
            <div style={{
                clear:'right',
                textAlign:'center'
            }}>


                {this.props.children}
            </div>
        );
    }
}
