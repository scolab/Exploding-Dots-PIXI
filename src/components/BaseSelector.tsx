import React from 'react';
import styled from 'styled-components';
import { gradientBackground, toolMenuElement } from './StylesForComponents';

interface IProps {
  onClick: () => any;
  base: Array<number | string>;
  allBase: any[];
}

interface IFakeButton {
  numChar: number;
}

const BaseSelector = (props: IProps): JSX.Element => {
  const img = require('./images/left_arrow.png');
  if (props.allBase.length > 1) {
    return (
      <GradientBackgroundButton
        type='button'
        onClick={props.onClick}
      >
        {props.base[0]}
        <ArrowImg
          src={img}
          role='presentation'
        />
          {props.base[1]}
      </GradientBackgroundButton>
    );
  } else {
    return (
      <GradientBackgroundDiv
        numChar={props.base[0].toString().length + props.base[1].toString().length + 1}
      >
        {props.base[0]}
        <ArrowImg
          src={img}
          role='presentation'
        />
        {props.base[1]}
      </GradientBackgroundDiv>
    );
  }
};

export default BaseSelector;

const GradientBackgroundButton = styled.button`
  margin: 2px;
  background: #FCFCFC;
  border-radius: 25px;
  font-family: Nunito;
  font-size: 24px;
  width: 110px;
  height: 40px;
  vertical-align: middle;
  text-align: center;
  border: none;
  cursor: pointer;
  margin-left: 20px;
  color: #48209c;
  &:hover { box-shadow: 0 0 0 1px #48209c; }
  &:active { box-shadow: 0 0 0 0; }
  &:focus { outline:0; };
`;

const GradientBackgroundDiv = styled.div`
  margin: 2px;
  background: #FCFCFC;
  border-radius: 25px;
  font-family: Nunito;
  font-size: 24px;
  width: ${(props: IFakeButton) => (props.numChar >= 4 ? '110px;' : '100px;' )};
  height: 40px;
  vertical-align: middle;
  text-align: center;
  border: none;
  margin-left: 20px;
  color: #48209c;
  display: inline-block;
  padding-top: 5px;
`;

const ArrowImg = styled.img`
  margin: 0px 5px;
  width: 27px;
  height: auto;
`;
