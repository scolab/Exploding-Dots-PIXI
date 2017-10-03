import React, { Component } from 'react';
import styled from 'styled-components';
import {gradientBackground, toolMenuElement} from './StylesForComponents';
import { SoundManager } from '../utils/SoundManager';

interface IProps {
  onClick: () => any;
  resetAction: (name: string) => any;
  title: string;
  visible: boolean;
}

interface IElemProps {
  visible: boolean;
}

export default class ResetButton extends Component<IProps, {}> {

  private img: any = require('./images/refresh.png');

  public render(): JSX.Element {
    return (
      <GradientBackgroundButton
        type='button'
        onClick={() => this.reset()}
        visible={this.props.visible}
        disabled={this.props.visible === false}
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
    SoundManager.instance.playSound(SoundManager.RESET);
    if (this.props.resetAction) {
      this.props.resetAction(this.props.title);
    }
  }
}

const GradientBackgroundButton = styled.button`
  ${gradientBackground}
  ${toolMenuElement}
  width: 40px;
  height: 40px;
  vertical-align: middle;
  border: none;
  cursor: ${(props: IElemProps) => (props.visible) ? 'pointer' : 'default'};
  opacity: ${(props: IElemProps) => (props.visible) ? '1' : '0.5'};
`;

const GradientBackgroundImg = styled.img`
   margin-top: 3px;
   margin-left: 1px;
   width: 80%;
   height: auto;
`;
