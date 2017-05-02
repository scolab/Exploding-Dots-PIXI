import React, { Component } from 'react';
import PropTypes from 'prop-types';
import img from './images/wand1x.png';

export default class GoButton extends Component {

  static propTypes = {
    onClick: PropTypes.func.isRequired,
    children: PropTypes.node.isRequired,
    activityStarted: PropTypes.bool.isRequired,
  };

  constructor(props) {
    super(props);
  }

  render() {
    if (this.props.activityStarted) {
      return (
        <button
          style={{
            fontWeight: 'bold',
            fontSize: 20,
            background: '#efefef', /* For browsers that do not support gradients */
            borderRadius: '25px',
            width: '47px',
            height: '47px',
            lineHeight: '47px',
            verticalAlign: 'middle',
            marginTop: '-6px',
            marginLeft: '10px',
            overflow: 'hidden',
            border: 'none',
            visibility: 'hidden',
          }}
          type="button"
        >
          <i className="fa fa-arrow-right" />
        </button>
      );
    }
    return (
      <button
        className="imageButton"
        style={{
          fontWeight: 'bold',
          fontSize: 20,
                            // backgroundColor : '#efefef',
          background: '#efefef', /* For browsers that do not support gradients */
          background: '-webkit-linear-gradient(left, #f8f8f9, #e7e8e9)', /* For Safari 5.1 to 6.0 */
          background: '-o-linear-gradient(right, #f8f8f9, #e7e8e9)', /* For Opera 11.1 to 12.0 */
          background: '-moz-linear-gradient(right, #f8f8f9, #e7e8e9)', /* For Firefox 3.6 to 15 */
          background: 'linear-gradient(to right, #f8f8f9, #e7e8e9)', /* Standard syntax */
          borderRadius: '25px',
          width: '47px',
          height: '47px',
          lineHeight: '47px',
          verticalAlign: 'middle',
          marginTop: '-6px',
          marginLeft: '10px',
        }}
        type="button"
        onClick={this.props.onClick}
      >
        <i className="fa fa-arrow-right" />
      </button>
    );
  }
}
