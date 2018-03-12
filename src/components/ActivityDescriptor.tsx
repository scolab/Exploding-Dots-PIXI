import React from 'react';
import styled from 'styled-components';

export interface IActivityDescriptorProps {
  children: any;
}
const ActivityDescriptor = (props: IActivityDescriptorProps) => {
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
