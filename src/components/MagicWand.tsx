import React from 'react';
import PropTypes from 'prop-types';
import {gradientBackground, topLeftElement} from "./StylesForComponents";
import styled from "styled-components";

interface IProps {
  onClick: PropTypes.func.isRequired;
}
const MagicWand = (props: IProps) => {

  const img = require('./images/magicWand.gif');

  const GradientBackgroundButton = styled.button`
  ${gradientBackground}
  ${topLeftElement}
  `;

  return (
    <GradientBackgroundButton
      style={{
        border: 'none',
        cursor: 'pointer',
        height: '47px',
        verticalAlign: 'middle',
        width: '47px',
      }}
      type="button"
      onClick={() => props.onClick(true)}
      >
      <img src={img} role="presentation" style={{ marginTop: '3px', marginLeft: '4px' }} />
    </GradientBackgroundButton>
  );
};

export default MagicWand;
