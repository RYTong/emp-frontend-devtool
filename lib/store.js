'use babel'

import { createStore, applyMiddleware } from 'redux'
import reducer from './reducer'

const logger = store => next => action => {
  if (action.type !== 'ONLINE' || action.device.isNewDevice) {
    console.group(action.type)
    console.info('dispatching', action)
    let result = next(action)
    console.log('next state', store.getState())
    console.groupEnd(action.type)
    return result
  } else {
    return next(action)
  }
}

const store = createStore(reducer, applyMiddleware(logger))

export default store
