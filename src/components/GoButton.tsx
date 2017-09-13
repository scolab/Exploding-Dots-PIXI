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
      <TextStyled>
      &#62;
      </TextStyled>
    </GradientBackgroundButton>
  );
};

const GradientBackgroundButton = styled.button`
  font-family: Nunito;
  font-size: 30px;
  color: #FCFCFC;
  background: #48209c;
  border-radius: 25px;
  border-style: solid;
  border-width: 2px;
  border-color: rgba(200, 200, 200, 1);
  cursor: pointer;
  width: 36px;
  height: 36px;
  vertical-align: middle;
  margin-top: -6px;
  margin-left: 6px;
  padding: 0px 1px 0px 5px;
`;

const InvisibleButton = styled.button`
  border: none;
  width: 36px;
  height: 36px;
  vertical-align: middle;
  margin-top: -6px;
  margin-left: 10px;
  visibility: hidden;
`;

const TextStyled = styled.div`
  position: relative;
  top: -5px;
`;

export default GoButton;
