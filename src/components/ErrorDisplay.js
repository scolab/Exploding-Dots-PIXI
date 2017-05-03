import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';

export default class ErrorDisplay extends Component {

  static propTypes = {
    errorMessage: PropTypes.string,
    onClose: PropTypes.func.isRequired,
  };

  handleClose() {
    this.props.onClose();
  }

  render() {
    if (this.props.errorMessage === '') {
      return null;
    }
    const actions = [
      <FlatButton
        label="OK"
        primary
        onTouchTap={this.handleClose.bind(this)}
      />,
    ];
    return (
      <div>
        <Dialog
          actions={actions}
          modal={false}
          open
          onRequestClose={this.handleClose.bind(this)}
        >
          {this.props.errorMessage}
        </Dialog>
      </div>
    );
  }
}
