import React, { Component } from 'react';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';

interface IProps {
  userMessage: string;
  onClose: () => any;
}

export default class MessageDisplay extends Component<IProps, {}> {

  public render() {
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

