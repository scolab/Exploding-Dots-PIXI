import DropDownMenu from 'material-ui/DropDownMenu'; // http://www.material-ui.com/
import MenuItem from 'material-ui/MenuItem'; // http://www.material-ui.com/
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {OPERATOR_MODE, USAGE_MODE, TEXT_COPY, IOPERATOR_MODE, IUSAGE_MODE} from '../Constants';

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
          <div
            className="operationItem"
            style={{
              fontFamily: 'Noto Sans',
              fontSize: 24,
              fontWeight: 'bold',
            }}
          >
            {text}
          </div>
        );
      case OPERATOR_MODE.ADD:
        if (this.props.usage_mode === USAGE_MODE.EXERCISE) {
          return (
            <div
              className="operationItem gradientBackground"
              style={{
                borderRadius: '23px',
                fontFamily: 'Noto Sans',
                fontSize: 32,
                fontWeight: 'bold',
                height: '47px',
                lineHeight: '47px',
                marginTop: '-6px',
                verticalAlign: 'middle',
                width: '77px',
              }}
            >&#43;</div>
          );
        } else if (this.props.usage_mode === USAGE_MODE.OPERATION) {
          return (
            <DropDownMenu
              className="gradientBackground"
              style={{
                borderRadius: '23px',
                height: '47px',
                marginLeft: '10px',
                marginTop: '-7px',
                verticalAlign: 'middle',
              }}
              /* tslint:disable-next-line */
              labelStyle={{ fontSize: '32px', lineHeight: '38px', marginBottom: '-8px', marginTop: '5px', padding: '0 40px' }}
              iconStyle={{ top: '0px', right: '0px' }}
              menuItemStyle={{ fontSize: '32px', borderRadius: '23px' }}
              menuStyle={{ borderRadius: '23px' }}
              value={OPERATOR_MODE.ADD}
              onChange={this.handleOperandChange}
              disabled={this.props.activityStarted}
            >
              <MenuItem value={OPERATOR_MODE.ADD} primaryText="&#43;" />
              <MenuItem value={OPERATOR_MODE.MULTIPLY} primaryText="&#215;" />
            </DropDownMenu>
          );
        }
        break;
      case OPERATOR_MODE.SUBTRACT:
        return (
          <div
            className="operationItem gradientBackground"
            style={{
              fontFamily: 'Noto Sans',
              fontWeight: 'bold',
              fontSize: 32,
              borderRadius: '23px',
              width: '77px',
              height: '47px',
              lineHeight: '47px',
              verticalAlign: 'middle',
              marginTop: '-6px',
            }}
          >&#8722;</div>
        );
      case OPERATOR_MODE.MULTIPLY:
        if (this.props.usage_mode === USAGE_MODE.EXERCISE) {
          return (
            <div
              className="operationItem gradientBackground"
              style={{
                fontFamily: 'Noto Sans',
                fontWeight: 'bold',
                fontSize: 32,
                borderRadius: '23px',
                width: '77px',
                height: '47px',
                lineHeight: '47px',
                verticalAlign: 'middle',
                marginTop: '-6px',
              }}
            >
              <p style={{ marginTop: 3 }}>&#215;</p>
            </div>
          );
        } else if (this.props.usage_mode === USAGE_MODE.OPERATION) {
          return (
            <DropDownMenu
              className="gradientBackground"
              style={{
                borderRadius: '23px',
                marginLeft: '10px',
                height: '47px',
                verticalAlign: 'middle',
                marginTop: '-7px',
              }}
              /* tslint:disable-next-line */
              labelStyle={{ fontSize: '32px', lineHeight: '38px', marginBottom: '-8px', marginTop: '5px', padding: '0 40px' }}
              iconStyle={{ top: '0px', right: '0px' }}
              menuItemStyle={{ fontSize: '32px' }}
              value={OPERATOR_MODE.MULTIPLY}
              onChange={this.handleOperandChange}
              disabled={this.props.activityStarted}
            >
              <MenuItem value={OPERATOR_MODE.ADD} primaryText="&#43;" />
              <MenuItem value={OPERATOR_MODE.MULTIPLY} primaryText="&#215;" />
            </DropDownMenu>
          );
        }
        break;
      case OPERATOR_MODE.DIVIDE:
        return (
          <div
            className="operationItem gradientBackground"
            style={{
              borderRadius: '23px',
              fontFamily: 'Noto Sans',
              fontSize: 32,
              fontWeight: 'bold',
              height: '47px',
              lineHeight: '47px',
              marginTop: '-6px',
              verticalAlign: 'middle',
              width: '77px',
            }}
          >&#247;</div>
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

