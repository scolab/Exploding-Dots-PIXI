import React from 'react';
import styled from 'styled-components';

interface IProps {
  children: any;
}
const ActivityDescriptor = (props: IProps) => {
  return (
    <ActivityDescriptorDiv>
      {props.children}
    </ActivityDescriptorDiv>
  );
};

const ActivityDescriptorDiv = styled.div`
  clear: right;
  text-align: center;
  `;

export default ActivityDescriptor;
