import React from 'react';
import PropTypes from 'prop-types';
import styled from "styled-components";
import {gradientBackground} from "./StylesForComponents";

interface IProps {
  onClick: PropTypes.func.isRequired;
  activityStarted: boolean;
}

const GoButton = (props: IProps) => {

  const GradientBackgroundButton = styled.button`
  ${gradientBackground}
  `;

  const img = require('./images/arrow-right.gif');

  if (props.activityStarted) {
    return (
      <button
        style={{
          width: '47px',
          height: '47px',
          lineHeight: '47px',
          verticalAlign: 'middle',
          marginTop: '-6px',
          marginLeft: '10px',
          border: 'none',
          visibility: 'hidden',
        }}
        type="button"
      >
      </button>
    );
  }
  return (
    /* eslint-disable no-dupe-keys */
    <GradientBackgroundButton
      style={{
        border: 'none',
        cursor: 'pointer',
        fontWeight: 'bold',
        fontSize: 20,
        width: '47px',
        height: '47px',
        lineHeight: '47px',
        verticalAlign: 'middle',
        marginTop: '-6px',
        marginLeft: '10px',
      }}
      type="button"
      onClick={props.onClick}
    >
      <img src={img} role="presentation" style={{ marginTop: '9px', marginLeft: '2px' }} />
    </GradientBackgroundButton>
  );
  /* eslint-enable */
};

export default GoButton;
