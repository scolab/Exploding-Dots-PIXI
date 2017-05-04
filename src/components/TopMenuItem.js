import React from 'react';
import PropTypes from 'prop-types';

const TopMenuItem = (props) => {
  return (
    <div style={{ marginRight: 33 }}>
      {props.children}
    </div>
  );
};

TopMenuItem.propTypes = {
  children: PropTypes.node,
};

export default TopMenuItem;
