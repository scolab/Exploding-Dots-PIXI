import React from 'react';
import {gradientBackground, toolMenuElement} from './StylesForComponents';
import styled from 'styled-components';

export interface IPlaceValueSwitchProps {
  onClick: () => any;
  placeValueOn: boolean;
  enabled: boolean;
}

interface IElemProps {
  alpha: boolean;
}

const PlaceValueSwitch = (props: IPlaceValueSwitchProps): JSX.Element => {
  const img = require('./images/eye.png');
  const imgOff = require('./images/eye_not.png');
  return (
    <GradientBackgroundButton
      type='button'
      onClick={props.enabled ? () => props.onClick() : () => null}
      disabled={!props.enabled}
      alpha={!props.enabled}
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
  width: 40px;
  height: 40px;
  vertical-align: middle;
  border: none;
  cursor: ${(props: IElemProps) => (props.alpha) ? 'normal' : 'pointer'};
  opacity: ${(props: IElemProps) => (props.alpha) ? '0.5' : '1'};
`;

const GradientBackgroundImg = styled.img`
  margin-top: 3px;
  margin-left: 0px;
  width: 100%;
  height: auto;
`;
