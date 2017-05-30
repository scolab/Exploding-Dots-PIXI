import React from 'react';
import PropTypes from 'prop-types';
import img from './images/longArrowLeft.gif';

const BaseSelector = (props) => {
  const style = {
    float:'right',
    marginLeft: '10px',
    marginTop: '33px',
  };
  return (
    <div style={style}>
      <button
        style={{
          fontFamily: 'Noto Sans',
          fontWeight: 'bold',
          fontSize: 24,
          backgroundColor: '#efefef',
          borderRadius: '23px',
          width: '132px',
          height: '46px',
          verticalAlign: 'middle',
          textAlign: 'center',
          textVAlign: 'center',
          border: 'none',
          cursor: 'pointer',
        }}
        type="button"
        onClick={props.onClick}
      >
        {props.base[0]} <img src={img} role="presentation" style={{ marginBottom: '1px', marginLeft: '3px', marginRight: '3px' }} /> {props.base[1]}
      </button>
    </div>
  );
};

export default BaseSelector;

BaseSelector.propTypes = {
  onClick: PropTypes.func.isRequired,
  base: PropTypes.array.isRequired,
};
