import React, {Component, PropTypes} from 'react';

export default class PlaceValueSwitch extends Component {

    static propTypes = {
        visible: React.PropTypes.bool.isRequired,
        onClick: React.PropTypes.func.isRequired
    };

    constructor(props) {
        super(props);
    }

    render(){
        return (
            <div>
                <button onClick={this.props.onClick} className="placeValue"><i className="fa fa-binoculars"></i></button>
            </div>
        );
    }
}

