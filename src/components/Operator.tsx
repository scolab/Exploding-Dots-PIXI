import DropDownMenu from 'material-ui/DropDownMenu'; // http://www.material-ui.com/
import MenuItem from 'material-ui/MenuItem'; // http://www.material-ui.com/
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {OPERATOR_MODE, USAGE_MODE, TEXT_COPY, IOPERATOR_MODE, IUSAGE_MODE} from '../Constants';
import styled from "styled-components";
import {gradientBackground, operationItem} from "./StylesForComponents";

interface IProps {
  operator_mode: IOPERATOR_MODE;
  usage_mode: IUSAGE_MODE;
  onChange: PropTypes.func;
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
          <OperationDiv
            style={{
              fontFamily: 'Noto Sans',
              fontSize: 24,
              fontWeight: 'bold',
            }}
          >
            {text}
          </OperationDiv>
        );
      case OPERATOR_MODE.ADD:
        if (this.props.usage_mode === USAGE_MODE.EXERCISE) {
          return (
            <GradientBackgroundDiv
              style={{
                borderRadius: '23px',
                fontFamily: 'Noto Sans',
                fontSize: 32,
                fontWeight: 'bold',
                height: '47px',
                lineHeight: '47px',
                marginTop: '30px',
                //verticalAlign: 'middle',
                width: '77px',
              }}
            >&#43;</GradientBackgroundDiv>
          );
        } else if (this.props.usage_mode === USAGE_MODE.OPERATION) {
          return (
            <GradientBackgroundDiv>
            <DropDownMenu
                style={{
                  borderRadius: '23px',
                  height: '47px',
                  marginLeft: '10px',
                }}
                labelStyle={{ fontSize: '32px', lineHeight: '38px', marginBottom: '-8px', marginTop: '5px', padding: '0 40px', height: '47px' }}
                iconStyle={{ top: '0px', right: '0px' }}
                menuItemStyle={{ fontSize: '32px', borderRadius: '23px'}}
                menuStyle={{ borderRadius: '23px' }}
                value={OPERATOR_MODE.ADD}
                onChange={this.handleOperandChange}
                disabled={this.props.activityStarted}
              >
                <MenuItem value={OPERATOR_MODE.ADD} primaryText="&#43;" />
                <MenuItem value={OPERATOR_MODE.MULTIPLY} primaryText="&#215;" />
              </DropDownMenu>
            </GradientBackgroundDiv>
          );
        }
        break;
      case OPERATOR_MODE.SUBTRACT:
        return (
          <GradientBackgroundDiv
            style={{
              fontFamily: 'Noto Sans',
              fontWeight: 'bold',
              fontSize: 32,
              borderRadius: '23px',
              width: '77px',
              height: '47px',
              lineHeight: '47px',
              //verticalAlign: 'middle',
              marginTop: '30px',
            }}
          >&#8722;</GradientBackgroundDiv>
        );
      case OPERATOR_MODE.MULTIPLY:
        if (this.props.usage_mode === USAGE_MODE.EXERCISE) {
          return (
            <GradientBackgroundDiv
              style={{
                fontFamily: 'Noto Sans',
                fontWeight: 'bold',
                fontSize: 32,
                borderRadius: '23px',
                width: '77px',
                height: '47px',
                lineHeight: '47px',
                //verticalAlign: 'middle',
                marginTop: '30px',
              }}
            >
              <p style={{ marginTop: -1 }}>&#215;</p>
            </GradientBackgroundDiv>
          );
        } else if (this.props.usage_mode === USAGE_MODE.OPERATION) {
          return (
            <GradientBackgroundDiv
              style={{
                //verticalAlign: 'top',
              }}>
              <DropDownMenu
                style={{
                  borderRadius: '23px',
                  height: '47px',
                  marginLeft: '10px',
                }}
                labelStyle={{ fontSize: '32px', lineHeight: '38px', marginBottom: '-8px', marginTop: '5px', padding: '0 40px', height: '47px' }}
                iconStyle={{ top: '0px', right: '0px' }}
                menuItemStyle={{ fontSize: '32px' }}
                value={OPERATOR_MODE.MULTIPLY}
                onChange={this.handleOperandChange}
                disabled={this.props.activityStarted}
              >
                <MenuItem value={OPERATOR_MODE.ADD} primaryText="&#43;" />
                <MenuItem value={OPERATOR_MODE.MULTIPLY} primaryText="&#215;" />
              </DropDownMenu>
            </GradientBackgroundDiv>
          );
        }
        break;
      case OPERATOR_MODE.DIVIDE:
        return (
          <GradientBackgroundDiv
            style={{
              borderRadius: '23px',
              fontFamily: 'Noto Sans',
              fontSize: 32,
              fontWeight: 'bold',
              height: '47px',
              lineHeight: '47px',
              marginTop: '30px',
              //verticalAlign: 'middle',
              width: '77px',
            }}
          >&#247;</GradientBackgroundDiv>
        );
      default:
        return null;
    }
    return null;
  }

  private handleOperandChange = (event, index, value) => {
    this.props.onChange(value);
  }

}

const GradientBackgroundDiv = styled.div`
      ${gradientBackground}
      ${operationItem}
      vertical-align: top;
    `;

const OperationDiv = styled.div`
      ${operationItem}
    `;
