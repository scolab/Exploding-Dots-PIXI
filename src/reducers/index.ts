import { combineReducers, AnyAction, Action } from 'redux';
import dotsReducer from './DotsReducer';

const allReducers = combineReducers({
  dotsMachine: dotsReducer,
});

export default allReducers;
