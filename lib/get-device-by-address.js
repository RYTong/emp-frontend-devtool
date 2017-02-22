'use babel'

import _ from 'lodash'
import os from 'os'
import store from './store'

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

const isIpEqual = (_ip, ip) => {
  if (_ip === ip) {
    return true
  } else {
    let ips = _.flatten(_.map(
      os.networkInterfaces(),
      ipobjs => ipobjs.map(ipobj => ipobj.address)
    ))
    if (ips.includes(_ip) && ips.includes(ip)) {
      return true
    }
  }

  return false
}

export default getDeviceByAddress
