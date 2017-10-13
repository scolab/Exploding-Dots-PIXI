import React, { Component } from 'react';
import {OPERATOR_MODE, USAGE_MODE, OPERAND_POS, BASE, IOPERATOR_MODE, IUSAGE_MODE, IOPERAND_POS} from '../Constants';
import { superscriptToNormal } from '../utils/StringUtils';
import styled from 'styled-components';
import {operationItem} from './StylesForComponents';

interface IProps {
  value: string;
  operator_mode: IOPERATOR_MODE;
  usage_mode: IUSAGE_MODE;
  onChange: (operandPos: string,
             value: string) => any;
  pos: string;
  activityStarted: boolean;
  base: Array<number | string>;
  onEnter: () => any;
}

interface IInputBox {
  operator_mode: IOPERATOR_MODE;
  usage_mode: IUSAGE_MODE;
  value: string;
  textWidth: number;
}

export default class Operand extends Component<IProps, {}> {

  private inputText: HTMLInputElement;

  public componentDidMount(): void {
    this.checkIfInputActive();
  }

  public getTextWidth(pText: string, pFontSize: number, pFontWeight: string, pFontFamily: string): number {
    // This is not kosher as I add and remove something in the DOM.  React might not like it...
    let lDiv: HTMLDivElement | null = document.createElement('div');
    document.body.appendChild(lDiv);
    lDiv.style.fontSize = '' + pFontSize + 'px';
    lDiv.style.fontWeight = pFontWeight;
    lDiv.style.fontFamily = pFontFamily;
    lDiv.style.position = 'absolute';
    lDiv.style.left = '-1000px';
    lDiv.style.top = '-1000px';
    lDiv.innerHTML = pText;
    const calculatedWidth: number = lDiv.clientWidth;
    document.body.removeChild(lDiv);
    lDiv = null;
    return calculatedWidth;
  }

  public componentDidUpdate(): void {
    this.checkIfInputActive();
  }

  public render(): JSX.Element {
    // console.log('render', this.props.value);
    const algebraContainsOperator: boolean = this.props.value.indexOf('+') !== -1 || this.props.value.indexOf('-') !== -1;
    let displayText: string = this.props.value;
    if (algebraContainsOperator &&
      this.props.base[1] === BASE.BASE_X &&
      this.props.usage_mode !== USAGE_MODE.OPERATION ||
      this.props.base[1] === BASE.BASE_X &&
      this.props.activityStarted) {
      displayText = '(' + displayText + ')';
    }
    if (this.props.pos === OPERAND_POS.LEFT) {
      const textWidth: number = Math.floor(this.getTextWidth(displayText, 22, '800', 'Nunito')) + 10;
      return (
        <OperationDiv>
          <form onSubmit={this.onSubmit}>
            <OperationInput
              type='text'
              onChange={this.onChange}
              value={displayText}
              innerRef={(inputText) => {
                this.inputText = inputText as HTMLInputElement;
              }}
              operator_mode={this.props.operator_mode}
              usage_mode={this.props.usage_mode}
              textWidth={textWidth}
            />
          </form>
        </OperationDiv>
      );
    } else {
      const textWidth: number = Math.floor(this.getTextWidth(displayText, 22, '800', 'Nunito')) + 10;
      return (
        <OperationDiv>
          <form onSubmit={this.onSubmit}>
            <OperationInput
              type='text'
              onChange={this.onChange}
              value={displayText}
              innerRef={(inputText) => {
                this.inputText = inputText as HTMLInputElement;
              }}
              operator_mode={this.props.operator_mode}
              usage_mode={this.props.usage_mode}
              textWidth={textWidth}
            />
          </form>
        </OperationDiv>
      );
    }
  }

  private onChange = (e: React.FormEvent<HTMLInputElement>) => {
    // console.log('onChange');
    e.preventDefault();
    let stringToTest: string = (e.target as HTMLInputElement).value;
    let reg: RegExp = new RegExp('^$|^[0-9]+$');
    if (this.props.usage_mode === USAGE_MODE.OPERATION) {
      if (this.props.operator_mode === OPERATOR_MODE.MULTIPLY &&
        this.props.pos === OPERAND_POS.RIGHT) {
        // no | in right operand in multiply
      } else if (this.props.operator_mode === OPERATOR_MODE.SUBTRACT ||
        this.props.operator_mode === OPERATOR_MODE.DIVIDE) {
        if (this.props.base[1] !== BASE.BASE_X) {
          /*
           Allow the string to be:
           - empty
           - a single minus (-) sign. Needed to start writing a first negative number
           - Digits, between 1 and 5
           - minus (-) sign followed by digits
           - Pipe (|) followed by a minus sign or digits
           - A maximum of 5 of those pattern
           */
          reg = new RegExp(/^\|{0,4}$|^\|{0,4}-$|^(\|{0,4}-?[\d]{1,5})(\|-?[\d]{0,5}?){0,4}$/);
        } else {
          /*
           Base X
           Allow the string to be:
           - empty
           - a single (-) or (+) sign. Needed to start writing a first
           negative number in the left operand ora positive in the right operand
           - Digits, between 1 and 5
           - minus (-) or (+) sign followed by (x) or digits
           - One digit following a (x)
           - A maximum of 5 of those pattern
           */
          // tslint:disable-next-line max-line-length
          reg = new RegExp(/^$|^[-\+]$|^[-\+]?(\d{1,5}[xX]\d|\d{1,5}[xX]|[xX]\d|[xX]|\d{1,5})([-\+](\d{1,5}[xX]\d|\d{1,5}[xX]|[xX]\d|[xX]|\d{1,5})){0,4}[-\+]?$/);
          stringToTest = superscriptToNormal(stringToTest.toLocaleLowerCase());
        }
      } else if (this.props.base[1] !== BASE.BASE_X) {
        reg = new RegExp('^$|^[|0-9]+$');
      } else {
        /*
         Base X
         Allow the string to be:
         - empty
         - a single (-) or (+) sign. Needed to start writing a first
         negative number in the left operand or a positive in the right operand
         - Digits, between 1 and 5
         - minus (-) or (+) sign followed by (x) or digits
         - One digit following a (x)
         - A maximum of 5 of those pattern
         */
        // tslint:disable-next-line max-line-length
        reg = new RegExp(/^$|^[-\+]$|^[-\+]?(\d{1,5}[xX]\d|\d{1,5}[xX]|[xX]\d|[xX]|\d{1,5})([-\+](\d{1,5}[xX]\d|\d{1,5}[xX]|[xX]\d|[xX]|\d{1,5})){0,4}[-\+]?$/);
        stringToTest = superscriptToNormal(stringToTest);
      }
    } else {
      reg = new RegExp('^$|^[0-9]+$');
    }
    if (reg.test(stringToTest)) {
      this.props.onChange(this.props.pos, stringToTest.toLocaleLowerCase());
    }
  }

  private onSubmit = (e): void => {
    e.preventDefault();
    if (this.props.pos === OPERAND_POS.RIGHT) {
      this.props.onEnter();
    } else if (this.props.operator_mode === OPERATOR_MODE.DISPLAY) {
      this.props.onEnter();
    }
  }

  private checkIfInputActive(): void {
    if (this.inputText) {
      if (this.props.usage_mode === USAGE_MODE.EXERCISE ||
        this.props.activityStarted ||
        (this.props.operator_mode === OPERATOR_MODE.DISPLAY &&
        this.props.usage_mode === USAGE_MODE.FREEPLAY)) {
        this.inputText.disabled = true;
      } else if (this.props.usage_mode === USAGE_MODE.OPERATION &&
        this.props.activityStarted === false) {
        this.inputText.disabled = false;
      }
    }
  }

}

const OperationDiv = styled.div`
  ${operationItem}
`;

const OperationInput = styled.input`
  background-color: #fcfcfc;
  border-radius: 4px;
  border: none;
  box-shadow: ${(props: IInputBox) => (props.operator_mode === OPERATOR_MODE.DISPLAY && props.usage_mode === USAGE_MODE.FREEPLAY || props.usage_mode === USAGE_MODE.EXERCISE ? '0 0 0 0 #ffffff' : '0 0 0 1px #48209c')};
  font-family: Nunito;
  font-size: 22px;
  color: #48209c;
  height: 42px;
  text-align: center;
  width: ${(props: IInputBox) => props.textWidth + 'px'};
  min-width: 82px;
  padding-top: 0px;
`;
