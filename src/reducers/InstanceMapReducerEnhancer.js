export default function instanceMapReducerEnhancer(reducer, controlInstanceKeyResolver = defaultKeyResolver) {
  return function (state = {}, action) {
    const instanceKey = controlInstanceKeyResolver(action);
    if (typeof (instanceKey) === "string") {
      let instanceState = reducer(state[instanceKey], action);
      const newState = Object.assign({}, state, { [instanceKey]: instanceState });
      return newState
    } else {
      return state;
    }
  }
}

function defaultKeyResolver(action) {
  return action.meta ? action.meta.controlInstanceKey : undefined;
}
