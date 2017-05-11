import React from 'react';
import PropTypes from 'prop-types';

const BaseSelector = (props) => {
  return (
    <div className="topRightMenuItem">
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
        }}
        type="button"
        onClick={props.onClick}
      >
        {props.base[0]} <i className="fa fa-long-arrow-left" /> {props.base[1]}
      </button>
    </div>
  );
};

export default BaseSelector;

BaseSelector.propTypes = {
  onClick: PropTypes.func.isRequired,
  base: PropTypes.array.isRequired,
};
