import React, {Component} from 'react';
import PropTypes from 'prop-types';

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

