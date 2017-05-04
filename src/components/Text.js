import React from 'react';
import PropTypes from 'prop-types';
import { OPERATOR_MODE, USAGE_MODE, TEXT_COPY } from '../Constants';

const Text = (props) => {
  let text = '';
  if (props.operator_mode === OPERATOR_MODE.DISPLAY) {
    if (props.usage_mode === USAGE_MODE.FREEPLAY) {
      text = TEXT_COPY.THE_CODE_FOR;
    } else if (props.usage_mode === USAGE_MODE.OPERATION) {
      text = TEXT_COPY.PUT;
    }
  }
  return (
    <div
      className="operationItem"
      style={{
        fontFamily: 'Noto Sans',
        fontWeight: 'bold',
        fontSize: 24,
      }}
    >{text}</div>
  );
};

Text.propTypes = {
  operator_mode: PropTypes.oneOf([
    OPERATOR_MODE.DISPLAY,
    OPERATOR_MODE.ADD,
    OPERATOR_MODE.SUBTRACT,
    OPERATOR_MODE.MULTIPLY,
    OPERATOR_MODE.DIVIDE]),
  usage_mode: PropTypes.oneOf([
    USAGE_MODE.OPERATION,
    USAGE_MODE.FREEPLAY,
    USAGE_MODE.EXERCISE]),
};

export default Text;
