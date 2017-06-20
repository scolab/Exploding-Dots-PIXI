import React from 'react';
import {OPERATOR_MODE, USAGE_MODE, TEXT_COPY, IOPERATOR_MODE, IUSAGE_MODE} from '../Constants';
import {operationItem} from "./StylesForComponents";
import styled from "styled-components";

interface IProps {
  operator_mode: IOPERATOR_MODE;
  usage_mode: IUSAGE_MODE;
}

const Text = (props: IProps) => {
  let text = '';
  if (props.operator_mode === OPERATOR_MODE.DISPLAY) {
    if (props.usage_mode === USAGE_MODE.FREEPLAY) {
      text = TEXT_COPY.THE_CODE_FOR;
    } else if (props.usage_mode === USAGE_MODE.OPERATION) {
      text = TEXT_COPY.PUT;
    }
  }

  const OperationDiv = styled.div`
      ${operationItem}
    `;

  return (
    <OperationDiv
      className="operationItem"
      style={{
        fontFamily: 'Noto Sans',
        fontSize: 24,
        fontWeight: 'bold',
      }}
    >{text}</OperationDiv>
  );
};

export default Text;
