import React, {Component, PropTypes} from 'react';
import BG from './images/rule_dropdown1x.png';

export default class BaseSelector extends Component {
    static propTypes = {
        onClick: React.PropTypes.func.isRequired,
        base: React.PropTypes.array.isRequired,
    };

    constructor(props) {
        super(props);
    }

    render(){
        return (
            <div className="topRightMenuItem">
                {/*<button className="imageButton" style={{backgroundImage:`url(${BG})`,
                                width:132,
                                height:46}}
                        type='button'
                        onClick={this.props.onClick}>

                    <div style={{
                                textAlign:'center',
                                textVAlign:'center',
                                fontFamily: 'Noto Sans',
                                fontWeight:'bold',
                                fontSize: 20}}>
                    {this.props.base[0]} <i className="fa fa-long-arrow-left"></i> {this.props.base[1]}
                    </div>
                </button>*/}
                <button
                    style={{
                        fontFamily: 'Noto Sans',
                        fontWeight: 'bold',
                        fontSize: 24,
                        backgroundColor: '#efefef',
                        borderRadius: '23px',
                        width: '132px',
                        height: '46px',
                        verticalAlign: 'middle',
                        textAlign: 'center',
                        textVAlign: 'center',
                        border: 'none',
                    }}
                    type='button'
                    onClick={this.props.onClick}
                >
                    {this.props.base[0]} <i className="fa fa-long-arrow-left"></i> {this.props.base[1]}
                </button>
            </div>
        );
    }
}
