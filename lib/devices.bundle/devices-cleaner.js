'use babel'

import _ from 'lodash'

import menu from '../menu'
import { DEVICE_TIMEOUT } from '../constants'
import { offline } from '../actions'
import store from '../store'

const clean = (interval) => {
  let now = new Date().getTime()

  _.each(store.getState().devices, (device) => {
    if (device.expireAt < now) {
      menu.deviceOffline()
      store.dispatch(offline(device))
    }
  })
  setTimeout(() => clean(interval), interval)
}

const start = (interval = DEVICE_TIMEOUT) => {
  setTimeout(() => clean(interval), interval)
}

export default { start }
