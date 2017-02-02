import React, {Component, PropTypes} from 'react';

export default class BaseSelector extends Component {
    constructor(props) {
        super(props);
    }

    render(){
        return (
            <div>
                BaseSelector {this.props.base}
            </div>
        );
    }
}
