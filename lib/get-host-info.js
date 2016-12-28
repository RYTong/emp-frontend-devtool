'use babel'

import localIP from 'internal-ip'
import store from './store'
import { DEVICE_TIMEOUT } from './constants'

const pkginfo = require('../package.json')

const getHostInfo = () => {
  let {selectedApp, servicePorts} = store.getState()

  return {
    version: pkginfo.version,
    ip: localIP.v4(),
    alias: process.env.USER || process.env.COMPUTERNAME,
    timeout: DEVICE_TIMEOUT,
    selectedApp,
    serverPorts: servicePorts
  }
}

export default getHostInfo
