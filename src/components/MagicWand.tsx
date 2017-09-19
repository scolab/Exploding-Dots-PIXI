import React from 'react';
import {gradientBackground, toolMenuElement} from './StylesForComponents';
import styled from 'styled-components';

interface IProps {
  onClick: (active: boolean) => any;
  hidden: boolean;
}

interface IElemProps {
  alpha: boolean;
}

const MagicWand = (props: IProps): JSX.Element => {

  const img = require('./images/magic_wand.png');

  return (
    <GradientBackgroundButton
      type='button'
      onClick={() => props.onClick(true)}
      alpha={props.hidden}
      disabled={props.hidden}
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
  width: 36px;
  height: 36px;
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
