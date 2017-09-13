import React, { Component } from 'react';
import {OPERATOR_MODE, USAGE_MODE, TEXT_COPY, IOPERATOR_MODE, IUSAGE_MODE} from '../Constants';
import styled from 'styled-components';
import {gradientBackground, operationItem} from './StylesForComponents';

interface IProps {
  operator_mode: IOPERATOR_MODE;
  usage_mode: IUSAGE_MODE;
  activityStarted: boolean;
}

export default class Operator extends Component<IProps, {}> {

  public render(): JSX.Element | null {
    // ↔
    switch (this.props.operator_mode) {
      case OPERATOR_MODE.DISPLAY:
        return (
          <OperationDiv>
            &#60; &#62;
          </OperationDiv>
        );
      case OPERATOR_MODE.ADD:
        return (
          <GradientBackgroundDiv>&#43;</GradientBackgroundDiv>
        );
      case OPERATOR_MODE.SUBTRACT:
        return (
          <GradientBackgroundDiv>&#8722;</GradientBackgroundDiv>
        );
      case OPERATOR_MODE.MULTIPLY:
        return (
          <GradientBackgroundDiv>&#215;</GradientBackgroundDiv>
        );
      case OPERATOR_MODE.DIVIDE:
        return (
          <GradientBackgroundDiv>&#247;</GradientBackgroundDiv>
        );
      default:
        return null;
    }
  }
}

const GradientBackgroundDiv = styled.div`
      ${operationItem}
      vertical-align: top;
      border-radius: 23px;
      font-family: Nunito;
      font-size: 32px;
      height: 47px;
      line-height: 47px;
      width: 40px;
    `;

const OperationDiv = styled.div`
      ${operationItem}
      font-family: Nunito;
      font-size: 30px;
    `;
