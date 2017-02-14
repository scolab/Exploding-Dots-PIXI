import React, {Component, PropTypes} from 'react';

export default class MagicWand extends Component {

    static propTypes = {
        onClick: React.PropTypes.func.isRequired,
        visible: React.PropTypes.bool.isRequired,
    };

    constructor(props) {
        super(props);
    }

    render(){
        return (
            <div>
                <button onClick={() => this.props.onClick(true)} className="magicWandBtn"><i className="fa fa-magic"></i></button>
            </div>
        );
    }
}


