'use babel'

import { combineReducers } from 'redux'
import { DEVICE_TIMEOUT } from './constants'
import menu from './menu'
import su from './server-util'
import isAppProject from './is-app-project'

const selectedApp = (state = null, action) => {
  switch (action.type) {
    case 'SELECT-PROJECT':
      if (isAppProject(action.project)) {
        menu.select(action.project)
        return action.project
      } else {
        menu.unselect()
        return null
      }
    default:
      return state
  }
}

const isRunning = (state = false, action) => {
  switch (action.type) {
    case 'TOGGLE-APP':
      if (state) {
        su.stop()
      } else {
        su.start(action.project)
      }
      return !state
    default:
      return state
  }
}

const servicePorts = (state = {}, action) => {
  switch (action.type) {
    case 'START-SERVICE':
      return {
        ...state,
        [action.service]: action.port
      }
    case 'STOP-SERVICE':
      let _state = {...state}
      Reflect.deleteProperty(_state, action.service)
      return _state
    default:
      return state
  }
}

const devices = (state = {}, action) => {
  switch (action.type) {
    case 'ONLINE':
      return {
        ...state,
        [action.device.token]: {
          ...action.device,
          expireAt: new Date().getTime() + DEVICE_TIMEOUT
        }
      }
    case 'OFFLINE':
      let _state = {...state}
      Reflect.deleteProperty(_state, action.device.token)
      return _state
    default:
      return state
  }
}

const logState = (state = {}, action) => {
  switch (action.type) {
    case 'LUA':
      return 'lua';
    case 'NATIVE':
      return 'native'
    case 'OFF':
      return 'off'
    default:
      return state
  }
}

const reducer = combineReducers({
  selectedApp,
  isRunning,
  servicePorts,
  devices,
  logState
})

export default reducer
