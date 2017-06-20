import React from 'react';
import PropTypes from 'prop-types';
import {gradientBackground, topLeftElement} from "./StylesForComponents";
import styled from "styled-components";

interface IProps {
  onClick: PropTypes.func.isRequired;
}

const PlaceValueSwitch = (props: IProps) => {
  const img = require('./images/place_value.gif');

  const GradientBackgroundButton = styled.button`
  ${gradientBackground}
  ${topLeftElement}
  `;

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
      onClick={() => props.onClick(true)}
    >
      <img src={img} role="presentation" style={{ marginTop: '3px', marginLeft: '2px' }} />
    </GradientBackgroundButton>
  );
};

export default PlaceValueSwitch;
