import React, { Component } from 'react';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';

interface IProps {
  errorMessage: string;
  onClose: () => any;
  resetAction: (name: string) => any;
  title: string;
}

export default class ErrorDisplay extends Component<IProps, {}> {

  public render(): JSX.Element | null {
    if (this.props.errorMessage === '') {
      return null;
    }
    const actions = [
      <FlatButton
        label='OK'
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

  private reset(): void {
    this.props.onClose();
    if (this.props.resetAction) {
      this.props.resetAction(this.props.title);
    }
  }
}
