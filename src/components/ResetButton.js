import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { gradientBackground, topLeftElement } from './StylesForComponents';

import img from './images/refresh.gif';

export default class ResetButton extends Component {

  static propTypes = {
    onClick: PropTypes.func.isRequired,
    resetAction: PropTypes.func,
    title: PropTypes.string.isRequired,
  };

  reset() {
    this.props.onClick(true);
    if (this.props.resetAction) {
      this.props.resetAction(this.props.title);
    }
  }

  render() {
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
        <img src={img} role="presentation" style={{marginTop: '3px', marginLeft: '2px'}}/>
      </GradientBackgroundButton>
    );
    /* eslint-enable */
  }
}


const GradientBackgroundButton = styled.button`
  ${gradientBackground}
  ${topLeftElement}
  `;

