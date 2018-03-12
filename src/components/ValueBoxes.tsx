import React, { Component } from 'react';
import styled from 'styled-components';
import { DotVO } from '../VO/DotVO';
import { convertBase } from '../utils/MathUtils';

export interface IValueBoxProps {
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
  hasTwoRow: boolean;
  numOfCharacter: number;
  isNegative: boolean;
  value: number;
  base: Array<number | string>;
}

interface IBoxContainer {
  isInline: boolean;
}

export default class ValueBoxes extends Component<IValueBoxProps, {}> {
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
      const hasPositiveText: boolean = positiveText !== '0';
      const hasNegativeText: boolean = negativeText !== '0';
      if (i !== boxInOrder.length - 1) {
        if (Object.keys(positiveHash).length === 0 && Object.keys(negativeHash).length === 0 && hasLeftValue === false) {
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
              {hasPositiveText &&
              <NumberDiv
                hasTwoRow={this.props.negativePresent && hasPositiveText && hasNegativeText}
                numOfCharacter={positiveText.length}
                isNegative={false}
                value={Object.keys(positiveHash).length}
                base={this.props.base}
              >
                {positiveText}
              </NumberDiv>
              }
              {(this.props.negativePresent && hasNegativeText) &&
                <NumberDiv
                  hasTwoRow={this.props.negativePresent && hasPositiveText && hasNegativeText}
                  numOfCharacter={negativeText !== '0' ? negativeText.length + 1 : negativeText.length}
                  isNegative={true}
                  value={Object.keys(negativeHash).length}
                  base={this.props.base}
                >
                  {negativeText !== '0' ? '-' : ''}{negativeText}
                </NumberDiv>
              }
              {hasPositiveText === false && hasNegativeText === false &&
              <NumberDiv
                hasTwoRow={this.props.negativePresent && hasPositiveText && hasNegativeText}
                numOfCharacter={1}
                isNegative={false}
                value={0}
                base={this.props.base}
              >
                0
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
            {(hasPositiveText || !hasNegativeText) &&
            <NumberDiv
              hasTwoRow={this.props.negativePresent && hasPositiveText && hasNegativeText}
              numOfCharacter={positiveText.length}
              isNegative={false}
              value={Object.keys(positiveHash).length}
              base={this.props.base}
            >
              {positiveText}
            </NumberDiv>
            }
            {(this.props.negativePresent && hasNegativeText) &&
            <NumberDiv
              hasTwoRow={this.props.negativePresent && hasPositiveText && hasNegativeText}
              numOfCharacter={negativeText !== '0' ? negativeText.length + 1 : negativeText.length}
              isNegative={true}
              value={Object.keys(negativeHash).length}
              base={this.props.base}
            >
              {negativeText !== '0' ? '-' : ''}{negativeText}
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
  margin-left: ${(props: IBoxContainer) => props.isInline ? '12px' : '0px'};
  margin-bottom: -16px;
`;

const EmptyDiv = styled.div`
  background-color: #fcfcfc;
  height: 44px;
  width: 36px;
  float: left;
  border-radius: 4px;
  margin-right: 6px;
  opacity: 0.5;
`;

const NormalDiv = styled.div`
  background-color: #fcfcfc;
  border-radius: 4px;
  height: 44px;
  width: auto;
  min-width: 36px;
  float: left;
  margin-right: 6px;
  box-shadow: ${(props: IBoxProps) => (props.positiveValue > Number(props.base[1]) - 1 || props.negativeValue > Number(props.base[1]) - 1) ? '0 0 0 2px rgba(255, 102, 102, 0.8)' : '0 0 0 0 #ffffff'};
`;

const NumberDiv = styled.div`
  font-family: Nunito;
  font-size: 22px;
  color: ${(props: INumberProps) => (props.value > Number(props.base[1]) - 1) ? '#ff6666' : '#48209c'};
  text-align: right;
  padding: ${(props: INumberProps) => (props.hasTwoRow ? '1px 11px 1px 4px' : props.numOfCharacter === 1 ? '8px 11px 0px 11px' : '8px 4px 0px 4px')};
  margin-top: ${(props: INumberProps) => (props.hasTwoRow ? props.isNegative ? '-12px' : '-3px' : '0px')};
`;
