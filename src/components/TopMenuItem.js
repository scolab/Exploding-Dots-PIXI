import React, {Component, PropTypes} from 'react';

export default class TopMenuItem extends Component {
    static propTypes = {
        children: PropTypes.node,
    };

    render(){
        return (
            <div style={{marginRight:33}}>
                {this.props.children}
            </div>
        );
    }
}

