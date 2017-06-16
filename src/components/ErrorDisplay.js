import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';

export default class ErrorDisplay extends Component {

  static propTypes = {
    errorMessage: PropTypes.string,
    onClose: PropTypes.func.isRequired,
    resetAction: PropTypes.func,
    title: PropTypes.string.isRequired,
  };

  reset() {
    this.props.onClose(true);
    if (this.props.resetAction) {
      this.props.resetAction(this.props.title);
    }
  }

  render() {
    if (this.props.errorMessage === '') {
      return null;
    }
    const actions = [
      <FlatButton
        label="OK"
        primary
        onTouchTap={() => this.reset()}
      />,
    ];
    return (
      <div>
        <Dialog
          actions={actions}
          modal={false}
          open
          onTouchTap={() => this.reset()}
        >
          {this.props.errorMessage}
        </Dialog>
      </div>
    );
  }
}
