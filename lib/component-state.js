'use babel'

let _state = {}


const setState = (key, state) => {
  _state[key] = state
}

const getState = key => {
  if (key) {
    return _state[key]
  } else {
    return _state
  }
}

export default { setState, getState }
