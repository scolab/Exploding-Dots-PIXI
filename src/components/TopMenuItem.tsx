import React from 'react';
import PropTypes from 'prop-types';

interface IProps {
  children: PropTypes.node;
}

const TopMenuItem = (props: IProps) => {
  return (
    <div style={{ marginRight: 33 }}>
      {props.children}
    </div>
  );
};

export default TopMenuItem;
