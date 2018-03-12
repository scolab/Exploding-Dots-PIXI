import React from 'react';
import styled from 'styled-components';
import { IOPERATOR_MODE, OPERATOR_MODE } from '../Constants';

export interface IToolMenuProps {
  readonly children: any;
  readonly operatorMode: IOPERATOR_MODE;
}

interface IDivProps {
  readonly operatorMode: IOPERATOR_MODE;
}

const ToolMenu = (props: IToolMenuProps) => {
  return (
    <ToolMenuDiv
      operatorMode={props.operatorMode}
    >
      {props.children}
    </ToolMenuDiv>
  );
};

const ToolMenuDiv = styled.div`
  display: table;
  margin-left: 6.5%;
  padding: 4px;
  margin-top: ${(props: IDivProps) => (props.operatorMode === OPERATOR_MODE.DIVIDE ? '-15%' : '-4%')};
  position: relative;
`;

export default ToolMenu;
