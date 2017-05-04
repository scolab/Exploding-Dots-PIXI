import React from 'react';
import PropTypes from 'prop-types';
import img from './images/refresh.gif';

const ResetButton = (props) => {
  /* eslint-disable no-dupe-keys */
  return (
    <button
      className="topRightMenuItem"
      style={{
                      // backgroundColor : '#efefef',
        background: '#efefef', /* For browsers that do not support gradients */
        background: '-webkit-linear-gradient(left, #f8f8f9, #e7e8e9)', /* For Safari 5.1 to 6.0 */
        background: '-o-linear-gradient(right, #f8f8f9, #e7e8e9)', /* For Opera 11.1 to 12.0 */
        background: '-moz-linear-gradient(right, #f8f8f9, #e7e8e9)', /* For Firefox 3.6 to 15 */
        background: 'linear-gradient(to right, #f8f8f9, #e7e8e9)', /* Standard syntax */
        borderRadius: '25px',
        width: '47px',
        height: '47px',
        verticalAlign: 'middle',
        border: 'none',
        cursor: 'pointer',
        marginLeft: '10px',
        marginTop: '33px',
      }}
      type="button"
      onClick={() => props.onClick(true)}
    >
      <img src={img} role="presentation" style={{ marginTop: '3px', marginLeft: '2px' }} />
    </button>
  );
  /* eslint-enable */
};

ResetButton.propTypes = {
  onClick: PropTypes.func.isRequired,
};

export default ResetButton;
