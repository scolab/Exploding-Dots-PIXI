import React, { Component } from 'react';
import styled from 'styled-components';
import {gradientBackground, topLeftElement} from './StylesForComponents';

interface IProps {
  onClick: () => any;
  resetAction: (name: string) => any;
  title: string;
}

export default class ResetButton extends Component<IProps, {}> {

  private img: any = require('./images/refresh.gif');

  public render(): JSX.Element {
    return (
      <GradientBackgroundButton
        type='button'
        onClick={() => this.reset()}
      >
        <GradientBackgroundImg
          src={this.img}
          role='presentation'
        />
      </GradientBackgroundButton>
    );
  }

  private reset(): void {
    this.props.onClick();
    if (this.props.resetAction) {
      this.props.resetAction(this.props.title);
    }
  }
}

const GradientBackgroundButton = styled.button`
  ${gradientBackground}
  ${topLeftElement}
  width: 47px;
  height: 47px;
  vertical-align: middle;
  border: none;
  cursor: pointer;
`;

const GradientBackgroundImg = styled.img`
   margin-top: 3px;
   margin-left: 2px;
`;
