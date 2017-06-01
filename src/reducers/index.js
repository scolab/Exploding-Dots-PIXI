import { combineReducers } from 'redux';
import dotsReducer from './DotsReducer';

const allReducers = combineReducers({
  dotsMachine: dotsReducer,
});

export default allReducers;
