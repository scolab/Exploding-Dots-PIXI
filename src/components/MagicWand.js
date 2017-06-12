import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { gradientBackground, topLeftElement } from './StylesForComponents';
import img from './images/magicWand.gif';

const MagicWand = (props) => {
  /* eslint-disable no-dupe-keys */

  const GradientBackgroundButton = styled.button`
  ${gradientBackground}
  ${topLeftElement}
  `;

  return (
    <GradientBackgroundButton
      style={{
        // backgroundColor : '#efefef',
        width: '47px',
        height: '47px',
        verticalAlign: 'middle',
        border: 'none',
        cursor: 'pointer',
      }}
      type="button"
      onClick={() => props.onClick(true)}
    >
      <img src={img} role="presentation" style={{ marginTop: '3px', marginLeft: '4px' }} />
    </GradientBackgroundButton>
  );
  /* eslint-enable */
};

MagicWand.propTypes = {
  onClick: PropTypes.func.isRequired,
};

export default MagicWand;
