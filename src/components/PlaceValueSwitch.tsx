import React from 'react';
import {gradientBackground, toolMenuElement} from './StylesForComponents';
import styled from 'styled-components';

interface IProps {
  onClick: () => any;
}

const PlaceValueSwitch = (props: IProps): JSX.Element => {
  const img = require('./images/place_value@2x.png');

  return (
    <GradientBackgroundButton
      type='button'
      onClick={() => props.onClick()}
    >
      <GradientBackgroundImg
        src={img}
        role='presentation'
      />
    </GradientBackgroundButton>
  );
};

export default PlaceValueSwitch;

const GradientBackgroundButton = styled.button`
    ${gradientBackground}
    ${toolMenuElement}
    width: 47px;
    height: 47px;
    vertical-align: middle;
    border: none;
    cursor: pointer;
  `;

const GradientBackgroundImg = styled.img`
    margin-top: 3px;
    margin-left: 2px;
    width: 17px;
    height: 24px;
  `;
