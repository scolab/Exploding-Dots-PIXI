import React from 'react';
import styled from 'styled-components';

interface IProps {
  readonly children: any;
}

const TopMenuItem = (props: IProps) => {
  return (
    <TopMenuItemDiv>
      {props.children}
    </TopMenuItemDiv>
  );
};

const TopMenuItemDiv = styled.div`
  margin-right: 33px;
  `;

export default TopMenuItem;
