'use babel'

import _ from 'lodash'

import menu from '../menu'
import getSocketByAddress from '../get-socket-by-address'
import { DEVICE_CHECK_INTERVAL } from '../constants'
import { offline } from '../actions'
import store from '../store'

const clean = interval => {
  let now = new Date().getTime()

  _.each(store.getState().devices, (device) => {
    if (device.expireAt < now) {
      let useService = false

      useService = _.some(device.clientPorts, (port, service) => {
        return !!getSocketByAddress(service, device._ip, port)
      })

      if (!useService) {
        menu.deviceOffline()
        store.dispatch(offline(device))
      } else {
        console.log(device.token, 'is expired but using service')
      }
    }
  })
  setTimeout(() => clean(interval), interval)
}

const start = (interval = DEVICE_CHECK_INTERVAL) => {
  setTimeout(() => clean(interval), interval)
}

export default { start }
