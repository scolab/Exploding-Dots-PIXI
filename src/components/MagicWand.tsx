import React from 'react';
import PropTypes from 'prop-types';
// import img from './images/magicWand.gif';

interface IProps {
  onClick: PropTypes.func.isRequired;
}
const MagicWand = (props: IProps) => {

  const img = require('./images/magicWand.gif');
  const styles = require('./ExplodingDots.css');
  return (
    <div className={styles.topRightMenuItem}>
      <button
        className={styles.gradientBackground}
        style={{
          border: 'none',
          cursor: 'pointer',
          height: '47px',
          marginLeft: '10px',
          verticalAlign: 'middle',
          width: '47px',
        }}
        type="button"
        onClick={() => props.onClick(true)}
        >
        <img src={img} role="presentation" style={{ marginTop: '3px', marginLeft: '4px' }} />
      </button>
    </div>
  );
  /* eslint-enable */
};

export default MagicWand;
