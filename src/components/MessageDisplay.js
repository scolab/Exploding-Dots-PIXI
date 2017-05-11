import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';

export default class MessageDisplay extends Component {

  static propTypes = {
    userMessage: PropTypes.string,
    onClose: PropTypes.func.isRequired,
  };

  render() {
    if (this.props.userMessage === '') {
      return null;
    }
    const actions = [
      <FlatButton
        label="OK"
        primary
        onTouchTap={this.props.onClose}
      />,
    ];
    return (
      <div>
        <Dialog
          actions={actions}
          modal={false}
          open
          onRequestClose={this.props.onClose}
        >
          {this.props.userMessage}
        </Dialog>
      </div>
    );
  }
}

