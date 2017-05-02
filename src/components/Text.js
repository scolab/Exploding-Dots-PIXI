import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { OPERATOR_MODE, USAGE_MODE, TEXT_COPY } from '../Constants';

export default class Text extends Component {

  static propTypes = {
    operator_mode: PropTypes.oneOf([OPERATOR_MODE.DISPLAY, OPERATOR_MODE.ADD, OPERATOR_MODE.SUBTRACT, OPERATOR_MODE.MULTIPLY, OPERATOR_MODE.DIVIDE]),
    usage_mode: PropTypes.oneOf([USAGE_MODE.OPERATION, USAGE_MODE.FREEPLAY, USAGE_MODE.EXERCISE]),
  };

  constructor(props) {
    super(props);
  }

  render() {
    let text = '';
    if (this.props.operator_mode === OPERATOR_MODE.DISPLAY) {
      if (this.props.usage_mode === USAGE_MODE.FREEPLAY) {
        text = TEXT_COPY.THE_CODE_FOR;
      } else if (this.props.usage_mode === USAGE_MODE.OPERATION) {
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
  }
}
