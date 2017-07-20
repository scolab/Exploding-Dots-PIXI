import React, { Component } from 'react';
import {OPERATOR_MODE, USAGE_MODE, OPERAND_POS, BASE, IOPERATOR_MODE, IUSAGE_MODE, IOPERAND_POS} from '../Constants';
import { superscriptToNormal } from '../utils/StringUtils';
import styled from 'styled-components';
import {operationItem} from './StylesForComponents';

interface IProps {
  value: any;
  operator_mode: IOPERATOR_MODE;
  usage_mode: IUSAGE_MODE;
  onChange: (operandPos: string,
             value: string) => any;
  pos: string;
  activityStarted: boolean;
  base: Array<number | string>;
  onEnter: () => any;
}

export default class Operand extends Component<IProps, {}> {

  private inputText: HTMLInputElement;

  public componentDidMount(): void {
    this.checkIfInputActive();
  }

  public componentDidUpdate(): void {
    this.checkIfInputActive();
  }

  public render(): JSX.Element | null {
    if (this.props.pos === OPERAND_POS.LEFT) {
      return (
        <OperationDiv>
          <form onSubmit={this.onSubmit}>
            <OperationInput
              type='text'
              onChange={this.onChange}
              value={this.props.value}
              innerRef={(inputText) => {
                this.inputText = inputText as HTMLInputElement;
              }}
            />
          </form>
        </OperationDiv>
      );
    } else if (this.props.pos === OPERAND_POS.RIGHT) {
      const visible = this.props.operator_mode !== OPERATOR_MODE.DISPLAY;
      if (visible) {
        return (
          <OperationDiv>
            <form onSubmit={this.onSubmit}>
              <OperationInput
                type='text'
                onChange={this.onChange}
                value={this.props.value}
                innerRef={(inputText) => {
                  this.inputText = inputText as HTMLInputElement;
                }}
              />
            </form>
          </OperationDiv>
        );
      }
    }
    return null;
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
          reg = new RegExp(/^$|^[-\+]$|^[-\+]?(\d{1,5}x\d|\d{1,5}x|x\d|x|\d{1,5})([-\+](\d{1,5}x\d|\d{1,5}x|x\d|x|\d{1,5})){0,4}[-\+]?$/);
          stringToTest = superscriptToNormal(stringToTest);
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
        reg = new RegExp(/^$|^[-\+]$|^[-\+]?(\d{1,5}x\d|\d{1,5}x|x\d|x|\d{1,5})([-\+](\d{1,5}x\d|\d{1,5}x|x\d|x|\d{1,5})){0,4}[-\+]?$/);
        stringToTest = superscriptToNormal(stringToTest);
      }
    } else {
      reg = new RegExp('^$|^[0-9]+$');
    }
    if (reg.test(stringToTest)) {
      this.props.onChange(this.props.pos, stringToTest);
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
  background-color: #efefef;
  border: none;
  border-radius: 23px;
  font-family: Noto Sans;
  font-size: 24px;
  font-weight: bold;
  height: 45px;
  text-align: center;
  width: 252px;
`;
