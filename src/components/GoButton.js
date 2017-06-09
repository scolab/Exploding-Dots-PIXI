import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { gradientBackground, topLeftElement } from './StylesForComponents';
import img from './images/arrow-right.gif';

const GoButton = (props) => {
  if (props.activityStarted) {
    return (
      <button
        style={{
          background: '#efefef', /* For browsers that do not support gradients */
          borderRadius: '25px',
          width: '47px',
          height: '47px',
          lineHeight: '47px',
          verticalAlign: 'middle',
          marginTop: '-6px',
          marginLeft: '10px',
          overflow: 'hidden',
          border: 'none',
          visibility: 'hidden',
        }}
        type="button"
      >
        <img src={img} role="presentation" style={{ marginTop: '9px', marginLeft: '2px' }} />
      </button>
    );
  }

  const GradientBackgroundButton = styled.button`
  ${gradientBackground}
  `;

  return (
    /* eslint-disable no-dupe-keys */
    <GradientBackgroundButton
      style={{
        width: '47px',
        height: '47px',
        lineHeight: '47px',
        verticalAlign: 'middle',
        marginTop: '-6px',
        marginLeft: '10px',

        border: 'none',
        cursor: 'pointer',
      }}
      type="button"
      onClick={props.onClick}
    >
      <img src={img} role="presentation" style={{ marginTop: '9px', marginLeft: '2px' }} />
    </GradientBackgroundButton>
  );
  /* eslint-enable */
};

GoButton.propTypes = {
  onClick: PropTypes.func.isRequired,
  activityStarted: PropTypes.bool.isRequired,
};

export default GoButton;
