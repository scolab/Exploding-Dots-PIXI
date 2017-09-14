import React from 'react';
import styled from 'styled-components';
import { IOPERATOR_MODE, OPERATOR_MODE } from '../Constants';

interface IProps {
  readonly children: any;
  readonly operatorMode: IOPERATOR_MODE;
}

interface IDivProps {
  readonly operatorMode: IOPERATOR_MODE;
}

const ToolMenu = (props: IProps) => {
  return (
    <ToolMenuDiv
      operatorMode={props.operatorMode}
    >
      {props.children}
    </ToolMenuDiv>
  );
};

const ToolMenuDiv = styled.div`
  display: block;
  margin-left: 5.5%;
  margin-top: ${(props: IDivProps) => (props.operatorMode === OPERATOR_MODE.DIVIDE ? '-16%' : '-4%')};
  position: relative;
  width: fit-content;
`;

export default ToolMenu;
