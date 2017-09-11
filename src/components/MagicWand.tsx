import React from 'react';
import {gradientBackground, toolMenuElement} from './StylesForComponents';
import styled from 'styled-components';

interface IProps {
  onClick: (active: boolean) => any;
}
const MagicWand = (props: IProps): JSX.Element => {

  const img = require('./images/magicWand@2x.png');

  return (
    <GradientBackgroundButton
      type='button'
      onClick={() => props.onClick(true)}
      >
      <GradientBackgroundImg
        src={img}
        role='presentation'
      />
    </GradientBackgroundButton>
  );
};

const GradientBackgroundButton = styled.button`
    ${gradientBackground}
    ${toolMenuElement}
    border: none;
    cursor: pointer;
    height: 47px;
    vertical-align: middle;
    width: 47px;
  `;

const GradientBackgroundImg = styled.img`
    margin-top: 4px;
    margin-left: 4px;
    width: 26px;
    height: 26px;
  `;

export default MagicWand;
