import React, {Component, PropTypes} from 'react';
import img from './images/wand1x.png';

export default class GoButton extends Component {

    static propTypes = {
        onClick: React.PropTypes.func.isRequired,
        children: PropTypes.node.isRequired,
        activityStarted: PropTypes.bool.isRequired,
    };

    constructor(props) {
        super(props);
    }

    render() {
        if(this.props.activityStarted){
            return (
                <div className="operationItem">
                    <button style={{
                        width: 46,
                        height: 46,
                        backgroundColor: `Transparent`,
                        border: `none`,
                        overflow: `hidden`,
                        fontFamily: 'museo-slab',
                        fontSize: 24,
                        textAlign: 'center',
                    }} />

                </div>
            )
        }else {
            return (
                <div className="operationItem">
                    <button className="imageButton" style={{
                        backgroundImage: `url(${img})`,
                        width: 46,
                        height: 46,
                        backgroundRepeat: `no-repeat`,
                        backgroundColor: `Transparent`,
                        border: `none`,
                        overflow: `hidden`,
                        fontFamily: 'museo-slab',
                        fontSize: 24,
                        textAlign: 'center'
                    }}
                            type='button'
                            onClick={this.props.onClick}>
                        {this.props.children}
                    </button>
                </div>
            )
        }
    }
}
