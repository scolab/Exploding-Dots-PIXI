import React from 'react';
import PropTypes from 'prop-types';
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

  return (
    /* eslint-disable no-dupe-keys */
    <button
      style={{
        background: '#efefef', /* For browsers that do not support gradients */
        background: '-webkit-linear-gradient(left, #f8f8f9, #e7e8e9)', /* For Safari 5.1 to 6.0 */
        background: '-o-linear-gradient(right, #f8f8f9, #e7e8e9)', /* For Opera 11.1 to 12.0 */
        background: '-moz-linear-gradient(right, #f8f8f9, #e7e8e9)', /* For Firefox 3.6 to 15 */
        background: 'linear-gradient(to right, #f8f8f9, #e7e8e9)', /* Standard syntax */
        borderRadius: '25px',
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
    </button>
  );
  /* eslint-enable */
};

GoButton.propTypes = {
  onClick: PropTypes.func.isRequired,
  activityStarted: PropTypes.bool.isRequired,
};

export default GoButton;
