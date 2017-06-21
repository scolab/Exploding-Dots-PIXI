import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import {gradientBackground, topLeftElement} from "./StylesForComponents";

interface IProps {
  onClick: PropTypes.func.isRequired;
  resetAction: PropTypes.func;
  title: string;
}

export default class ResetButton extends Component<IProps, {}> {

  img = require('./images/refresh.gif');

  private reset(){
    this.props.onClick(true);
    if (this.props.resetAction) {
      this.props.resetAction(this.props.title);
    }
  }

  public render() {
    return (
      <GradientBackgroundButton
        style={{
          width: '47px',
          height: '47px',
          verticalAlign: 'middle',
          border: 'none',
          cursor: 'pointer',
        }}
        type="button"
        onClick={() => this.reset()}
      >
        <img src={this.img} role="presentation" style={{marginTop: '3px', marginLeft: '2px'}}/>
      </GradientBackgroundButton>
    );
  }
};

const GradientBackgroundButton = styled.button`
  ${gradientBackground}
  ${topLeftElement}
  `;

