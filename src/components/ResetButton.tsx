import React, { Component } from 'react';
import styled from 'styled-components';
import {gradientBackground, topLeftElement} from './StylesForComponents';

interface IProps {
  onClick: () => any;
  resetAction: (name: string) => any;
  title: string;
  visible: boolean;
}

export default class ResetButton extends Component<IProps, {}> {

  private img: any = require('./images/refresh@2x.png');

  public render(): JSX.Element {
    if (this.props.visible) {
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
    return (
      <PlaceHolder />
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

const PlaceHolder = styled.div`
  ${topLeftElement}
  width: 47px;
  height: 47px;
  vertical-align: middle;
`;

const GradientBackgroundImg = styled.img`
   margin-top: 3px;
   margin-left: 2px;
   width: 27px;
   height: 34px;
`;
