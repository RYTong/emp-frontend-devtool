'use babel'

import _ from 'lodash'
import os from 'os'

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

export default isIpEqual
