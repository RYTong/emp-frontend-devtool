'use babel'

import localIP from 'internal-ip';
import { DEVICE_TIMEOUT } from './constants'

const pkginfo = require('../package.json');

const getHostInfo = (servicePorts) => ({
  version: pkginfo.version,
  ip: localIP.v4(),
  alias: process.env.USER || process.env.COMPUTERNAME,
  timeout: DEVICE_TIMEOUT,
  serverPorts: servicePorts
})

export default getHostInfo
