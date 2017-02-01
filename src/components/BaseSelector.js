import React, {Component, PropTypes} from 'react';

export default class BaseSelector extends Component {
    constructor(props) {
        super(props);
    }

    render(){
        console.log('BaseSelector Render', this.props);
        return (
            <div>
                BaseSelector {this.props.base}
            </div>
        );
    }
}
