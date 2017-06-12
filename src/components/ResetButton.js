import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { gradientBackground, topLeftElement } from './StylesForComponents';

import img from './images/refresh.gif';

const ResetButton = (props) => {

  const GradientBackgroundButton = styled.button`
  ${gradientBackground}
  ${topLeftElement}
  `;

  return (
    <GradientBackgroundButton
      style={{
        width: '47px',
        height: '47px',
        verticalAlign: 'middle',
        border: 'none',
        cursor: 'pointer',
      }}
      type="button"
      onClick={() => props.onClick(true)}
    >
      <img src={img} role="presentation" style={{ marginTop: '3px', marginLeft: '2px' }} />
    </GradientBackgroundButton>
  );
  /* eslint-enable */
};

ResetButton.propTypes = {
  onClick: PropTypes.func.isRequired,
};

export default ResetButton;
