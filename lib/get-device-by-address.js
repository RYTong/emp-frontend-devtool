'use babel'

import _ from 'lodash'
import store from './store'


const getDeviceByAddress = (service, ip, port) => {
  let device = null

  _.each(store.getState().devices, (_device) => {
    let { _ip, clientPorts: cp } = _device

    if (_ip === ip && cp[service] === port) {
      device = _device
    }
  })

  return device
}

export default getDeviceByAddress
