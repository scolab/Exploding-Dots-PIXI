import React from 'react';
import PropTypes from 'prop-types';

interface IProps {
  onClick: PropTypes.func.isRequired;
}

const ResetButton = (props: IProps) => {

  const img = require('./images/refresh.gif');
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
        <img src={img} role="presentation" style={{ marginTop: '3px', marginLeft: '2px' }} />
      </button>
    </div>
  );
};

export default ResetButton;
