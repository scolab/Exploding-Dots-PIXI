import React, { Component } from 'react';
import styled from 'styled-components';
import {gradientBackground} from './StylesForComponents';
import { SoundManager } from '../utils/SoundManager';

interface IProps {
  onClick: () => any;
  activityStarted: boolean;
}

export default class GoButton extends Component<IProps, {}> {

  private img = require('./images/arrow_right.png');

  public render(): JSX.Element {
    if (this.props.activityStarted) {
      return (
        <InvisibleButton/>
      );
    }
    return (
      <GradientBackgroundButton
        type='button'
        onClick={() => this.clicked()}
      >
        <ImgStyled
          src={this.img}
          role='presentation'
        />
      </GradientBackgroundButton>
    );
  }

  private clicked(): void {
    this.props.onClick();
    SoundManager.instance.playSound(SoundManager.GO);
  }
}


const GradientBackgroundButton = styled.button`
  font-family: Nunito;
  font-size: 30px;
  color: #FCFCFC;
  background: #48209c;
  border-radius: 25px;
  border: none;
  // box-shadow: 0 0 0 2px #fcfcfc;
  cursor: pointer;
  width: 36px;
  height: 36px;
  vertical-align: middle;
  margin-top: -6px;
  margin-left: 12px;
  padding: 0px 1px 0px 5px;
  &:focus { outline:0; }
  &:hover { box-shadow: 0 0 0 4px rgba(252, 252, 252, 0.5); }
  &:active { box-shadow: 0 0 0 0; }
`;

const InvisibleButton = styled.button`
  border: none;
  width: 36px;
  height: 36px;
  vertical-align: middle;
  margin-top: -6px;
  margin-left: 12px;
  visibility: hidden;
`;

const ImgStyled = styled.img`
   margin-top: 7px;
   margin-left: 1px;
   vertical-align: top;
   width: 45%;
   height: auto;
`;
