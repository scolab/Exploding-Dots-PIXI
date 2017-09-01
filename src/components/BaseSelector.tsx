import React from 'react';
import styled from 'styled-components';
import { gradientBackground, topLeftElement } from './StylesForComponents';

interface IProps {
  onClick: () => any;
  base: Array<number | string>;
}

const BaseSelector = (props: IProps): JSX.Element => {

  const img = require('./images/longArrowLeft@2x.png');

  return (
    <GradientBackgroundButton
      type='button'
      onClick={props.onClick}
    >
      {props.base[0]}
      <ArrowImg
        src={img}
        role='presentation'
    /> {props.base[1]}
    </GradientBackgroundButton>
  );
};

export default BaseSelector;

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

const ArrowImg = styled.img`
    margin: 5px 6px 1px 10px;
    width: 36px;
    height: 14px;
  `;
