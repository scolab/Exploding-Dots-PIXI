import React from 'react';
import {gradientBackground, topLeftElement} from "./StylesForComponents";
import styled from "styled-components";

interface IProps {
  onClick: (active: boolean) => any;
}
const MagicWand = (props: IProps): JSX.Element => {

  const img = require('./images/magicWand.gif');

  const GradientBackgroundButton = styled.button`
    ${gradientBackground}
    ${topLeftElement}
    border: none;
    cursor: pointer;
    height: 47px;
    vertical-align: middle;
    width: 47px;
  `;

  const GradientBackgroundImg = styled.img`
    margin-top: 4px;
    margin-left: 4px;
  `;

  return (
    <GradientBackgroundButton
      type="button"
      onClick={() => props.onClick(true)}
      >
      <GradientBackgroundImg
        src={img}
        role="presentation"
      />
    </GradientBackgroundButton>
  );
};

export default MagicWand;
