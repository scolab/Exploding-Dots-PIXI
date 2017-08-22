import React, { Component } from 'react';
import styled from 'styled-components';
import { DotVO } from '../VO/DotVO';
import { convertBase } from '../utils/MathUtils';

interface IProps {
  positivePowerZoneDots: Array<IDotVOHash<DotVO>>;
  negativePowerZoneDots: Array<IDotVOHash<DotVO>>;
  base: Array<number | string>;
  isInline: boolean;
  negativePresent: boolean;
}

interface IBoxProps {
  positiveValue: number;
  negativeValue: number;
  base: Array<number | string>;
}

interface INumberProps {
  negativePresent: boolean;
}

interface IBoxContainer {
  isInline: boolean;
}

export default class ValueBoxes extends Component<IProps, {}> {
  public render(): JSX.Element {
    const boxes: any[] = new Array();
    const boxInOrder: Array<IDotVOHash<DotVO>> = this.props.positivePowerZoneDots.slice(0);
    boxInOrder.reverse();

    const negativeBoxInOrder: Array<IDotVOHash<DotVO>> = this.props.negativePowerZoneDots.slice(0);
    negativeBoxInOrder.reverse();

    let hasLeftValue: boolean = false;
     // tslint:disable-next-line prefer-for-of
    for (let i = 0; i < boxInOrder.length; i += 1) {
      const positiveHash: IDotVOHash<DotVO> = boxInOrder[i];
      const negativeHash: IDotVOHash<DotVO> = negativeBoxInOrder[i];
      let positiveText: string;
      let negativeText: string;
      if (this.props.base[1] !== 12) {
        positiveText = Object.keys(positiveHash).length.toString();
        negativeText = Object.keys(negativeHash).length.toString();
      } else {
        positiveText = convertBase(Object.keys(positiveHash).length.toString(), 10, 12);
        negativeText = convertBase(Object.keys(negativeHash).length.toString(), 10, 12);
      }
      if (i !== boxInOrder.length - 1) {
        if (Object.keys(positiveHash).length === 0 && hasLeftValue === false) {
          boxes.push(
            <EmptyDiv
              key={i}
            />,
          );
        } else {
          hasLeftValue = true;
          boxes.push(
            <NormalDiv
              key={i}
              positiveValue={Object.keys(positiveHash).length}
              negativeValue={Object.keys(negativeHash).length}
              base={this.props.base}
            >
              <NumberDiv
                negativePresent={this.props.negativePresent}
              >
                {positiveText}
              </NumberDiv>
              {this.props.negativePresent &&
                <NumberDiv
                  negativePresent={this.props.negativePresent}
                >
                  {negativeText}
                </NumberDiv>
              }
            </NormalDiv>,
          );
        }
      } else {
        boxes.push(
          <NormalDiv
            key={i}
            positiveValue={Object.keys(positiveHash).length}
            negativeValue={Object.keys(negativeHash).length}
            base={this.props.base}
          >
            <NumberDiv
              negativePresent={this.props.negativePresent}
            >
              {positiveText}
            </NumberDiv>
            {this.props.negativePresent &&
            <NumberDiv
              negativePresent={this.props.negativePresent}
            >
              {negativeText}
            </NumberDiv>
            }
          </NormalDiv>,
        );
      }
    }
    return (
      <BoxContainer
        isInline={this.props.isInline}
      >
        {boxes}
      </BoxContainer>
    );
  }
}

const BoxContainer = styled.div`
  width:auto;
  margin:0 auto;
  display: inline-block;
  margin-left: ${(props: IBoxContainer) => props.isInline ? '10px' : '0px'};
  margin-bottom: -16px;
`;

const EmptyDiv = styled.div`
  background-color: #eeeeee;
  border-style: dotted none dotted dotted;
  border-color: black;
  border-width: 2px;
  font-family: Noto Sans;
  font-size: 24px;
  font-weight: bold;
  height: 45px;
  text-align: center;
  width: 25px;
  float: left;
`;

const NormalDiv = styled.div`
  background-color: #ffffff;
  border-style: solid;
  border-width: 2px;
  height: 45px;
  width: auto;
  min-width: 25px;
  float: left;
  border-color: ${(props: IBoxProps) => (props.positiveValue > Number(props.base[1]) - 1 || props.negativeValue > Number(props.base[1]) - 1) ? '#ff0000' : '#000000'};
`;

const NumberDiv = styled.div`
  font-family: Noto Sans;
  font-size: ${(props: INumberProps) => (props.negativePresent ? '15px' : '30px')};
  font-weight: bold;
  color: #000000;
  text-align: center;
  padding: 0px 5px;
`;