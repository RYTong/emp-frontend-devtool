'use babel'

import { createStore, applyMiddleware } from 'redux'
import localIP from 'internal-ip';
import reducer from './reducers'

let pkginfo = require('../package.json');

const logger = store => next => action => {
  console.group(action.type)
  console.info('dispatching', action)
  let result = next(action)
  console.log('next state', store.getState())
  console.groupEnd(action.type)
  return result
}

const store = createStore(reducer, applyMiddleware(logger))

store.getHostInfo = () => ({
  version: pkginfo.version,
  ip: localIP.v4(),
  serverPorts: store.getState().servicePorts
})

export default store
