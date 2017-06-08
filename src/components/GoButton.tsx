import React from 'react';
import PropTypes from 'prop-types';

interface IProps {
  onClick: PropTypes.func.isRequired;
  activityStarted: boolean;
}

const GoButton = (props: IProps) => {
  const styles = require('./ExplodingDots.css');
  if (props.activityStarted) {
    return (
      <button
        style={{
          fontWeight: 'bold',
          fontSize: 20,
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
      >➔
      </button>
    );
  }
  return (
    /* eslint-disable no-dupe-keys */
    <button
      className={styles.gradientBackground}
      style={{
        border: 'none',
        cursor: 'pointer',
        fontSize: 20,
        fontWeight: 'bold',
        width: '47px',
        height: '47px',
        lineHeight: '47px',
        verticalAlign: 'middle',
        marginTop: '-6px',
        marginLeft: '10px',
      }}
      type="button"
      onClick={props.onClick}
    >➔
    </button>
  );
  /* eslint-enable */
};

export default GoButton;
