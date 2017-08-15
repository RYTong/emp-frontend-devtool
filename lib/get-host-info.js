'use babel'

import _ from 'lodash'
import os from 'os'
import store from './store'
import { DEVICE_TIMEOUT } from './constants'
const pkginfo = require('../package.json')

const internalIP = () => {
  let interfaces = _.filter(
    os.networkInterfaces(),
    (value, key) => !key.includes('vboxnet') && !key.includes('docker')
  )

  let ip = _.flatten(interfaces)
    .find(addr => (
      !addr.internal && addr.family === 'IPv4'
    ))

  if (!ip) {
    console.error('internal IP not found')
  }

  return ip && ip.address || '0.0.0.0'
}

const getHostInfo = () => {
  let {selectedApp, servicePorts, logState} = store.getState()
  tmpLogState = 'off'
  if (typeof(logState) == 'string') {
      tmpLogState = logState;
  }
  return {
    version: pkginfo.version,
    ip: internalIP(),
    alias: process.env.USER || process.env.COMPUTERNAME,
    timeout: DEVICE_TIMEOUT,
    selectedApp,
    serverPorts: servicePorts,
    log: tmpLogState   // off: 默认关闭, lua: 只上传 lua, native:只上传 native
  }
}

export default getHostInfo
