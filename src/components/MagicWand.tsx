import React from 'react';
import {gradientBackground, toolMenuElement} from './StylesForComponents';
import styled from 'styled-components';

export interface IMagicWandProps {
  onClick: (active: boolean) => any;
  hidden: boolean;
  enabled: boolean;
}

interface IElemProps {
  alpha: boolean;
}

const MagicWand = (props: IMagicWandProps): JSX.Element => {

  const img = require('./images/magic_wand.png');

  return (
    <GradientBackgroundButton
      type='button'
      onClick={() => props.onClick(true)}
      alpha={props.hidden || !props.enabled}
      disabled={props.hidden || !props.enabled}
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
  cursor: ${(props: IElemProps) => (props.alpha) ? 'default' : 'pointer'};
  width: 40px;
  height: 40px;
  vertical-align: middle;
  opacity: ${(props: IElemProps) => (props.alpha) ? '0.5' : '1'};
`;

const GradientBackgroundImg = styled.img`
  margin-top: 2px;
  margin-left: 2px;
  width: 80%;
  height: auto;
`;

export default MagicWand;
