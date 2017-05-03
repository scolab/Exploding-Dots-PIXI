import React, { Component } from 'react';
import PropTypes from 'prop-types';

// eslint-disable-next-line import/prefer-default-export
export default class ActivityDescriptor extends Component {
  static propTypes = {
    children: PropTypes.node,
  };

  render() {
    return (
      <div
        style={{
          clear: 'right',
          textAlign: 'center',
        }}
      >


        {this.props.children}
      </div>
    );
  }
}
