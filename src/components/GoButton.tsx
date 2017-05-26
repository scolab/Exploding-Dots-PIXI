import React from 'react';
import PropTypes from 'prop-types';

interface IProps {
  onClick: PropTypes.func.isRequired;
  activityStarted: boolean;
}

const GoButton = (props: IProps) => {
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
      >
        <i className="fa fa-arrow-right" />
      </button>
    );
  }
  return (
    /* eslint-disable no-dupe-keys */
    <button
      className="gradientBackground"
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
      <i className="fa fa-arrow-right" />
    </button>
  );
  /* eslint-enable */
};

export default GoButton;
