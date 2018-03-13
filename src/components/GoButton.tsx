import React, { Component } from 'react';
import styled from 'styled-components';
import { SoundManager } from '../utils/SoundManager';

export interface IGoButtonProps {
  onClick: () => any;
  activityStarted: boolean;
}

export default class GoButton extends Component<IGoButtonProps, {}> {

  private img = require('./images/anim_arrow_right@2x.gif');

  public render(): JSX.Element {
    if (this.props.activityStarted) {
      return (
        <InvisibleButton/>
      );
    }
    return (
      <GradientBackgroundButton
        type="button"
        onClick={() => this.clicked()}
      >
        <ImgStyled
          src={this.img}
          role="presentation"
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
  width: 40px;
  height: 40px;
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
   margin-top: 9px;
   margin-right: 2px;
   vertical-align: top;
   width: 60%;
   height: auto;
`;
