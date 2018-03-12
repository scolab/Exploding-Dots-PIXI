import React, { Component } from 'react';
import katex from 'katex';
import { DotVO } from '../VO/DotVO';
import { BASE, IUSAGE_MODE, USAGE_MODE } from '../Constants';
import { addSuperscriptWhereNeeded, superscriptToKatex, superscriptToNormal } from '../utils/StringUtils';
import styled from 'styled-components';

export interface IDivisionResultProps {
  readonly operandA: string;
  readonly operandB: string;
  readonly positivePowerZoneDots: Array<IDotVOHash<DotVO>>;
  readonly negativePowerZoneDots: Array<IDotVOHash<DotVO>>;
  readonly base: Array<number | string>;
  readonly positiveDividerResult: number[];
  readonly negativeDividerResult: number[];
  readonly usage_mode: IUSAGE_MODE;
  readonly activityStarted: boolean;
  readonly success: boolean;
}

export default class DivisionResult extends Component<IDivisionResultProps, {}> {
  public render(): JSX.Element | null {
    if ((this.props.usage_mode === USAGE_MODE.OPERATION && this.props.activityStarted) ||
        (this.props.usage_mode === USAGE_MODE.EXERCISE && this.props.success)) {
      const positiveDots: number[] = new Array<number>();
      const negativeDots: number[] = new Array<number>();
      for (let i: number = 0; i < this.props.positivePowerZoneDots.length; i++) {
        positiveDots.push(Object.keys(this.props.positivePowerZoneDots[i]).length);
        negativeDots.push(Object.keys(this.props.negativePowerZoneDots[i]).length);
      }
      positiveDots.reverse();
      negativeDots.reverse();
      const positiveDividerResult: number[] = this.props.positiveDividerResult.slice(0).reverse();
      const negativeDividerResult: number[] = this.props.negativeDividerResult.slice(0).reverse();

      // build the operation in Katex
      let operandValue: string;
      if (this.props.base[1] !== BASE.BASE_X) {
        operandValue = `${this.props.operandA} \\div ${this.props.operandB} =`;
      } else {
        operandValue = `(${superscriptToKatex(this.props.operandA)}) \\div (${superscriptToKatex(this.props.operandB)}) =`;
      }

      // build the remainder (dots that stay in the machine after division is done)
      // They are above the OperandB in a fraction
      let remainder: string = '';
      if (this.props.base[1] !== BASE.BASE_X) {
        remainder = this.buildNumericalBaseString(positiveDots, negativeDots);
        /*for (let i: number = 0; i < positiveDots.length; i += 1) {
          if (positiveDots[i] - negativeDots[i] !== 0 || remainder.length > 0) {
            remainder += positiveDots[i] - negativeDots[i];
          }
        }*/
      } else {
        remainder = this.buildBaseXString(positiveDots, negativeDots);
      }

      // build the result: the right side of the equality, but before the fraction
      let resultValue: string = '';
      // let numericValue: number = 0;
      if (this.props.base[1] !== BASE.BASE_X) {
        resultValue = this.buildNumericalBaseString(positiveDividerResult, negativeDividerResult);
      } else {
        resultValue = this.buildBaseXString(positiveDividerResult, negativeDividerResult);
      }

      if (remainder.length > 0) {
        if (resultValue.length > 0) {
          resultValue += ' + ';
        }
        resultValue += `\\dfrac{${remainder}}{${superscriptToKatex(this.props.operandB)}}`;
      }
      const resultValueKatex = katex.renderToString(operandValue + resultValue);
      return (
        <ContainerDiv>
          <div dangerouslySetInnerHTML={{__html: resultValueKatex}}/>
        </ContainerDiv>
      );
    } else {
      return null;
    }
  }

  private buildNumericalBaseString(positiveArray: number[], negativeArray: number[]): string {
    let numericValue: number = 0;
    for (let i: number = 0; i < positiveArray.length; i += 1) {
      if (positiveArray[i] - negativeArray[i] !== 0 || numericValue > 0) {
        if (positiveArray[i] - negativeArray[i] >= 0) {
          numericValue += (positiveArray[i] - negativeArray[i]) * Math.pow(Number(this.props.base[1]), (positiveArray.length - 1 - i));
        } else {
          numericValue += (positiveArray[i] - negativeArray[i]) * Math.pow(Number(this.props.base[1]), (positiveArray.length - 1 - i));
        }
      }
    }
    if (numericValue !== 0) {
      return numericValue.toString();
    }
    return '';
  }

  private buildBaseXString(positiveArray: number[], negativeArray: number[]): string {
    let stringToReturn: string = '';
    for (let i: number = 0; i < positiveArray.length; i += 1) {
      if (positiveArray[i] - negativeArray[i] !== 0) {
        if (positiveArray[i] !== 0 || negativeArray[i] !== 0) {
          if (positiveArray[i] - negativeArray[i] >= 0) {
            if (stringToReturn.length !== 0) {
              stringToReturn += '+';
            }
          }
          stringToReturn += positiveArray[i] - negativeArray[i];
          if (i <= 2) {
            stringToReturn += superscriptToKatex(addSuperscriptWhereNeeded(`x${positiveArray.length - 1 - i}`));
          } else if (i === 3) {
            stringToReturn += 'x';
          }
        }
      }
    }
    return stringToReturn;
  }
}

const ContainerDiv = styled.div`
  text-align: center;
  margin-top: 20px;
`;
