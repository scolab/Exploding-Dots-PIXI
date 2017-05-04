import React from 'react';
import PropTypes from 'prop-types';

const ActivityDescriptor = (props) => {
  return (
    <div
      style={{
        clear: 'right',
        textAlign: 'center',
      }}
    >
      {props.children}
    </div>
  );
};

ActivityDescriptor.propTypes = {
  children: PropTypes.node,
};

export default ActivityDescriptor;
