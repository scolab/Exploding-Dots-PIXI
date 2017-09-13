import React from 'react';
import styled from 'styled-components';
import { gradientBackground, toolMenuElement } from './StylesForComponents';

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
      ${toolMenuElement}
      font-family: Nunito;
      font-size: 24px;
      width: 100px;
      height: 36px;
      vertical-align: middle;
      text-align: center;
      border: none;
      cursor: pointer;
      margin-left: 20px;
    `;

const ArrowImg = styled.img`
    margin: 3px 0px 4px 5px;
    width: 27px;
    height: 10px;
  `;
