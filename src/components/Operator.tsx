import React, { Component } from 'react';
import {OPERATOR_MODE, USAGE_MODE, TEXT_COPY, IOPERATOR_MODE, IUSAGE_MODE} from '../Constants';
import styled from "styled-components";
import {gradientBackground, operationItem} from "./StylesForComponents";

interface IProps {
  operator_mode: IOPERATOR_MODE;
  usage_mode: IUSAGE_MODE;
  activityStarted: boolean;
}

export default class Operator extends Component<IProps, {}> {

  public render() {
    let text = '';
    switch (this.props.operator_mode) {
      case OPERATOR_MODE.DISPLAY:
        if (this.props.usage_mode === USAGE_MODE.FREEPLAY) {
          text = TEXT_COPY.IS;
        } else {
          text = TEXT_COPY.DOTS_COUNT;
        }
        return (
          <OperationDiv>
            {text}
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
      ${gradientBackground}
      ${operationItem}
      vertical-align: top;
      border-radius: 23px;
      font-family: Noto Sans;
      font-size: 32px;
      font-weight: bold;
      height: 47px;
      line-height: 47px;
      margin-top: 30px;
      width: 77px;
    `;

const OperationDiv = styled.div`
      ${operationItem}
      font-family: Noto Sans;
      font-size: 24px;
      font-weight: bold;
    `;
