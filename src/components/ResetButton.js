import React, {Component} from 'react';
import PropTypes from 'prop-types';
import img from './images/refresh.gif';

export default class ResetButton extends Component {

    static propTypes = {
        onClick: PropTypes.func.isRequired,
        visible: PropTypes.bool.isRequired,
    };

    constructor(props) {
        super(props);
    }

    render(){
        return (
            <button className="topRightMenuItem"
                    style={{
                        //backgroundColor : '#efefef',
                        background: '#efefef', /* For browsers that do not support gradients */
                        background: '-webkit-linear-gradient(left, #f8f8f9, #e7e8e9)', /* For Safari 5.1 to 6.0 */
                        background: '-o-linear-gradient(right, #f8f8f9, #e7e8e9)', /* For Opera 11.1 to 12.0 */
                        background: '-moz-linear-gradient(right, #f8f8f9, #e7e8e9)', /* For Firefox 3.6 to 15 */
                        background: 'linear-gradient(to right, #f8f8f9, #e7e8e9)', /* Standard syntax */
                        borderRadius: '25px',
                        width: '47px',
                        height: '47px',
                        verticalAlign: 'middle',
                        marginTop: '-6px',
                        marginLeft: '10px',
                        border: 'none',
                        cursor:'pointer',
                        marginLeft: '10px',
                        marginTop: '33px'
                    }}
                    type='button'
                    onClick={() => this.props.onClick(true)}
            >
                <img src={img} style={{marginTop: '3px', marginLeft:'2px'}}/>
            </button>
        );
    }
}


