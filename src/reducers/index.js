import {combineReducers} from 'redux';
import dotsReducer from './DotsReducer';

const allReducers = combineReducers({
    dots: dotsReducer
});

export default allReducers;

