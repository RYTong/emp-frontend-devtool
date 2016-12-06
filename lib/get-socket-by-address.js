'use babel'

import _ from 'lodash'
import parseIP from './parse-ip'
import logger from './client-log-processor.bundle/server'
import loader from './hot-loader.bundle/server'


const getSocketByAddress = (service, ip, port) => {
  let socket = null, socks = {}

  if (service === 'logger') {
    socks = logger.getSocks()
  } else if (service === 'hot-loader') {
    socks = loader.getSocks()
  }

  _.each(socks, (_socket, key) => {
    let [_ip, _port] = key.split('#')

    if (parseIP(_ip) === ip && parseInt(_port) === port) {
      socket = _socket
    }
  })

  return socket
}

export default getSocketByAddress
