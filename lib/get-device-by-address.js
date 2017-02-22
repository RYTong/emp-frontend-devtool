'use babel'

import _ from 'lodash'
import store from './store'
import isIpEqual from './is-ip-equal'

const getDeviceByAddress = (service, ip, port) => {
  let device = null

  if (typeof port === 'string') {
    port = parseInt(port)
  }

  _.each(store.getState().devices, (_device) => {
    let { _ip, clientPorts: cp } = _device
    if (isIpEqual(_ip, ip) && cp[service] === port) {
      device = _device
    }
  })

  return device
}

export default getDeviceByAddress
