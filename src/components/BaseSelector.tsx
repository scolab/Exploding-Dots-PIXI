import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { gradientBackground, topLeftElement } from './StylesForComponents';

interface IProps {
  onClick: PropTypes.func.isRequired;
  base: PropTypes.array.isRequired;
}

const BaseSelector = (props: IProps) => {

  const GradientBackgroundButton = styled.button`
      ${gradientBackground}
      ${topLeftElement}
      font-family: Noto Sans;
      font-weight: bold;
      font-size: 24px;
      width: 132px;
      height: 46px;
      vertical-align: middle;
      text-align: center;
      border: none;
      cursor: pointer;
    `;

  const img = require('./images/longArrowLeft.gif');

  return (
    <GradientBackgroundButton
      type="button"
      onClick={props.onClick}
    >
      {props.base[0]} <img src={img} role="presentation" style={{ marginBottom: '1px', marginLeft: '3px', marginRight: '3px' }} /> {props.base[1]}
    </GradientBackgroundButton>
  );
};

export default BaseSelector;
