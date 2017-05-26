import React from 'react';
import PropTypes from 'prop-types';

interface IProps {
  onClick: PropTypes.func.isRequired;
  base: PropTypes.array.isRequired;
}

const BaseSelector = (props: IProps) => {
  return (
    <div className="topRightMenuItem">
      <button
        style={{
          backgroundColor: '#efefef',
          border: 'none',
          borderRadius: '23px',
          fontFamily: 'Noto Sans',
          fontSize: 24,
          fontWeight: 'bold',
          height: '46px',
          textAlign: 'center',
          textVAlign: 'center',
          verticalAlign: 'middle',
          width: '132px',
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
