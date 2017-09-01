import React from 'react';
import styled from 'styled-components';
import {gradientBackground} from './StylesForComponents';

interface IProps {
  onClick: () => any;
  activityStarted: boolean;
}

const GoButton = (props: IProps) => {

  const img = require('./images/arrow-right@2x.png');

  if (props.activityStarted) {
    return (
      <InvisibleButton/>
    );
  }
  return (
    <GradientBackgroundButton
      type='button'
      onClick={props.onClick}
    >
      <ImgStyled
        src={img}
        role='presentation'
      />
    </GradientBackgroundButton>
  );
};

const GradientBackgroundButton = styled.button`
    ${gradientBackground}
    border: none;
    cursor: pointer;
    font-weight: bold;
    font-size: 20px;
    width: 47px;
    height: 47px;
    line-height: 47px;
    vertical-align: middle;
    margin-top: -6px;
    margin-left: 10px;
  `;

const InvisibleButton = styled.button`
    border: none;
    cursor: pointer;
    font-weight: bold;
    font-size: 20px;
    width: 47px;
    height: 47px;
    line-height: 47px;
    vertical-align: middle;
    margin-top: -6px;
    margin-left: 10px;
    visibility: hidden;
  `;

const ImgStyled = styled.img`
     margin-top: 15px;
     margin-left: 1px;
     vertical-align: top;
     width: 20px;
     height: 14px;
  `;

export default GoButton;
