import DropDownMenu from 'material-ui/DropDownMenu'; // http://www.material-ui.com/
import MenuItem from 'material-ui/MenuItem'; // http://www.material-ui.com/
import React, { Component } from 'react';
import styled from 'styled-components';
import { gradientBackground } from './StylesForComponents';
import PropTypes from 'prop-types';
import { OPERATOR_MODE, USAGE_MODE, TEXT_COPY } from '../Constants';


export default class Operator extends Component {

  static propTypes = {
    operator_mode: React.PropTypes.oneOf([
      OPERATOR_MODE.DISPLAY,
      OPERATOR_MODE.ADD,
      OPERATOR_MODE.SUBTRACT,
      OPERATOR_MODE.MULTIPLY,
      OPERATOR_MODE.DIVIDE]).isRequired,
    usage_mode: PropTypes.oneOf([USAGE_MODE.FREEPLAY, USAGE_MODE.OPERATION, USAGE_MODE.EXERCISE]),
    onChange: PropTypes.func.isRequired,
    activityStarted: PropTypes.bool.isRequired,
  };

  handleOperandChange = (event, index, value) => {
    this.props.onChange(value);
  };

  render() {
    /* eslint-disable no-dupe-keys */

    const GradientBackgroundDiv = styled.div`
      ${gradientBackground}
    `;

    const GradientBackgroundDropDown = styled(DropDownMenu)`
      ${gradientBackground}
    `;

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
            style={{
              fontFamily: 'Noto Sans',
              fontWeight: 'bold',
              fontSize: 24,
              marginTop: '30px',
              marginLeft: '10px',
              display: 'inline-block',
            }}
          >
            {text}
          </div>
        );
      case OPERATOR_MODE.ADD:
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
                verticalAlign: 'middle',
                marginTop: '-6px',
                marginLeft: '10px',
                display: 'inline-block',
              }}
            >&#43;</GradientBackgroundDiv>
          );
        } else if (this.props.usage_mode === USAGE_MODE.OPERATION) {
          return (
            <DropDownMenu
              style={{
                            // backgroundColor : '#efefef',
                background: '#efefef', /* For browsers that do not support gradients */
                background: '-webkit-linear-gradient(left, #f8f8f9, #e7e8e9)', /* For Safari 5.1 to 6.0 */
                background: '-o-linear-gradient(right, #f8f8f9, #e7e8e9)', /* For Opera 11.1 to 12.0 */
                background: '-moz-linear-gradient(right, #f8f8f9, #e7e8e9)', /* For Firefox 3.6 to 15 */
                background: 'linear-gradient(to right, #f8f8f9, #e7e8e9)', /* Standard syntax */
                borderRadius: '23px',
                marginLeft: '10px',
                height: '47px',
                verticalAlign: 'middle',
                marginTop: '-7px',
              }}
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
          <GradientBackgroundDiv
            style={{
              fontFamily: 'Noto Sans',
              fontWeight: 'bold',
              fontSize: 32,
              width: '77px',
              height: '47px',
              lineHeight: '47px',
              verticalAlign: 'middle',
              marginTop: '-6px',
              marginLeft: '10px',
              display: 'inline-block',
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
                width: '77px',
                height: '47px',
                lineHeight: '47px',
                verticalAlign: 'middle',
                marginTop: '-6px',
                marginLeft: '10px',
                display: 'inline-block',
              }}
            >
              <p style={{ marginTop: 3 }}>&#215;</p>
            </GradientBackgroundDiv>
          );
        } else if (this.props.usage_mode === USAGE_MODE.OPERATION) {
          return (
            <DropDownMenu
              style={{
                background: '#efefef', /* For browsers that do not support gradients */
                background: '-webkit-linear-gradient(left, #f8f8f9, #e7e8e9)', /* For Safari 5.1 to 6.0 */
                background: '-o-linear-gradient(right, #f8f8f9, #e7e8e9)', /* For Opera 11.1 to 12.0 */
                background: '-moz-linear-gradient(right, #f8f8f9, #e7e8e9)', /* For Firefox 3.6 to 15 */
                background: 'linear-gradient(to right, #f8f8f9, #e7e8e9)', /* Standard syntax */
                            // backgroundColor : '#efefef',
                borderRadius: '23px',
                marginLeft: '10px',
                height: '47px',
                verticalAlign: 'middle',
                marginTop: '-7px',
              }}
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
          <GradientBackgroundDiv
            style={{
              fontFamily: 'Noto Sans',
              fontWeight: 'bold',
              fontSize: 32,
              width: '77px',
              height: '47px',
              lineHeight: '47px',
              verticalAlign: 'middle',
              marginTop: '-6px',
              marginLeft: '10px',
              display: 'inline-block',
            }}
          >&#247;</GradientBackgroundDiv>
        );
      default:
        return null;
    }
    return null;
    /* eslint-enable */
  }
}

