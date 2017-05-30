import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { OPERATOR_MODE, USAGE_MODE, OPERAND_POS, BASE } from '../Constants';
import { superscriptToNormal } from '../utils/StringUtils';

export default class Operand extends Component {

  static propTypes = {
    value: PropTypes.any.isRequired,
    operator_mode: PropTypes.oneOf([
      OPERATOR_MODE.DISPLAY,
      OPERATOR_MODE.ADD,
      OPERATOR_MODE.SUBTRACT,
      OPERATOR_MODE.MULTIPLY,
      OPERATOR_MODE.DIVIDE,
    ]),
    usage_mode: PropTypes.oneOf([USAGE_MODE.FREEPLAY, USAGE_MODE.OPERATION, USAGE_MODE.EXERCISE]),
    onChange: PropTypes.func.isRequired,
    pos: PropTypes.string.isRequired,
    activityStarted: PropTypes.bool.isRequired,
    base: PropTypes.array.isRequired,
    onEnter: PropTypes.func.isRequired,
  };

  componentDidMount() {
    this.checkIfInputActive();
  }

  componentDidUpdate() {
    this.checkIfInputActive();
  }

  onChange = (e) => {
    // console.log('onChange');
    e.preventDefault();
    let stringToTest = e.target.value;
    let reg = new RegExp('^$|^[0-9]+$');
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
          // eslint-disable-next-line no-useless-escape, max-len
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
        // eslint-disable-next-line no-useless-escape, max-len
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

  onSubmit = (e) => {
    e.preventDefault();
    if (this.props.pos === OPERAND_POS.RIGHT) {
      this.props.onEnter();
    } else if (this.props.operator_mode === OPERATOR_MODE.DISPLAY) {
      this.props.onEnter();
    }
  }

  checkIfInputActive() {
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

  render() {
    const style = {
      marginTop: '30px',
      marginLeft: '10px',
      display: 'inline-block',
    };
    if (this.props.pos === OPERAND_POS.LEFT) {
      return (
        <div style={style}>
          <form onSubmit={this.onSubmit}>
            <input
              style={{
                fontFamily: 'Noto Sans',
                fontWeight: 'bold',
                fontSize: 24,
                backgroundColor: '#efefef',
                borderRadius: '23px',
                width: '252px',
                height: '45px',
                textAlign: 'center',
                border: 'none',
              }}
              type="text"
              onChange={this.onChange}
              value={this.props.value}
              ref={(inputText) => {
                this.inputText = inputText;
              }}
            />
          </form>
        </div>
      );
    } else if (this.props.pos === OPERAND_POS.RIGHT) {
      const visible = this.props.operator_mode !== OPERATOR_MODE.DISPLAY;
      if (visible) {
        return (
          <div style={style}>
            <form onSubmit={this.onSubmit}>
              <input
                style={{
                  fontFamily: 'Noto Sans',
                  fontWeight: 'bold',
                  fontSize: 24,
                  backgroundColor: '#efefef',
                  borderRadius: '23px',
                  width: '252px',
                  height: '45px',
                  textAlign: 'center',
                  border: 'none',
                }}
                type="text"
                onChange={this.onChange}
                value={this.props.value}
                ref={(inputText) => {
                  this.inputText = inputText;
                }}
              />
            </form>
          </div>
        );
      }
    }
    return null;
  }
}
