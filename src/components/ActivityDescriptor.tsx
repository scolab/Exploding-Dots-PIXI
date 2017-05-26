import React from 'react';
import PropTypes from 'prop-types';

interface IProps {
  children: PropTypes.node;
}
const ActivityDescriptor = (props: IProps) => {
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

export default ActivityDescriptor;
