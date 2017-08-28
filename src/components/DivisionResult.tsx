import React, { Component } from 'react';
import katex from 'katex';
import { DotVO } from '../VO/DotVO';

interface IProps {
  readonly operandA: string;
  readonly operandB: string;
  readonly positivePowerZoneDots: Array<IDotVOHash<DotVO>>;
  readonly negativePowerZoneDots: Array<IDotVOHash<DotVO>>;
  readonly base: Array<number | string>;
  readonly positiveDividerResult: number[];
  readonly negativeDividerResult: number[];
}

export default class DivisionResult extends Component<IProps, {}> {
  public render(): JSX.Element | null {
    const positiveDots: number[] = new Array<number>();
    const negativeDots: number[] = new Array<number>();
    for ( let i: number = 0; i < this.props.positivePowerZoneDots.length; i++) {
      positiveDots.push(Object.keys(this.props.positivePowerZoneDots[i]).length);
      negativeDots.push(Object.keys(this.props.negativePowerZoneDots[i]).length);
    }
    positiveDots.reverse();
    negativeDots.reverse();
    const positiveDividerResult: number[] = this.props.positiveDividerResult.slice(0).reverse();
    const negativeDividerResult: number[] = this.props.negativeDividerResult.slice(0).reverse();
    /*let dotValue: string = '';
    for (let i: number = 0; i < positiveDividerResult.length; i += 1) {
      dotValue += positiveDividerResult[i] - negativeDividerResult[i];
      dotValue += '|';
    }
    dotValue = dotValue.slice(0, -1);
    dotValue += ' r ';
    for (let i: number = 0; i < positiveDots.length; i += 1) {
      dotValue += positiveDots[i] - negativeDots[i];
      dotValue += '|';
    }
    dotValue = dotValue.slice(0, -1);*/

    let remainder: string = '';
    for (let i: number = 0; i < positiveDots.length; i += 1) {
      if (positiveDots[i] - negativeDots[i] !== 0 || remainder.length > 0) {
        remainder += positiveDots[i] - negativeDots[i];
      }
    }

    let operandValue: string;
    operandValue = `${this.props.operandA} \\div ${this.props.operandB} =`;
    const operandValueKatex: string = katex.renderToString(operandValue);

    let resultValue: string = '';
    for (let i: number = 0; i < positiveDividerResult.length; i += 1) {
      if (positiveDividerResult[i] - negativeDividerResult[i] !== 0 || resultValue.length > 0) {
        if (positiveDividerResult[i] - negativeDividerResult[i] > 0) {
          resultValue += positiveDividerResult[i] - negativeDividerResult[i];
        } else {
          // resultValue += '-';
          resultValue += positiveDividerResult[i] - negativeDividerResult[i];
        }
      }
    }
    resultValue += `\\dfrac ${remainder},${this.props.operandB}`;
    const resultValueKatex = katex.renderToString(resultValue);

    return (
      <div>
        <div dangerouslySetInnerHTML={{ __html: operandValueKatex }}/>
        <div dangerouslySetInnerHTML={{__html: resultValueKatex}} />
      </div>
    );
  }
}
