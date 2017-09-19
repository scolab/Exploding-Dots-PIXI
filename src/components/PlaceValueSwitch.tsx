import React from 'react';
import {gradientBackground, toolMenuElement} from './StylesForComponents';
import styled from 'styled-components';

interface IProps {
  onClick: () => any;
  placeValueOn: boolean;
}

const PlaceValueSwitch = (props: IProps): JSX.Element => {
  const img = require('./images/eye.png');
  const imgOff = require('./images/eye_not.png');
  return (
    <GradientBackgroundButton
      type='button'
      onClick={() => props.onClick()}
    >
      <GradientBackgroundImg
        src={props.placeValueOn ? imgOff : img}
        role='presentation'
      />
    </GradientBackgroundButton>
  );
};

export default PlaceValueSwitch;

const GradientBackgroundButton = styled.button`
    ${gradientBackground}
    ${toolMenuElement}
    width: 36px;
    height: 36px;
    vertical-align: middle;
    border: none;
    cursor: pointer;
  `;

const GradientBackgroundImg = styled.img`
  margin-top: 3px;
  margin-left: 0px;
  width: 100%;
  height: auto;
`;
