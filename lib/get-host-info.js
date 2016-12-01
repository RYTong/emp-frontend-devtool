'use babel'

import localIP from 'internal-ip';

const pkginfo = require('../package.json');

const getHostInfo = (servicePorts) => ({
  version: pkginfo.version,
  ip: localIP.v4(),
  serverPorts: servicePorts
})

export default getHostInfo
