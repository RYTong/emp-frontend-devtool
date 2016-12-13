'use babel'

import EventEmitter from 'events'
import getDeviceByAddress from './get-device-by-address'

const emitter = new EventEmitter()

let peers = {}
let ehs = {
  connect: {},
  disconnect: {},
  resolve: {}
}

emitter.getEmit = service => (event, ...args) => {
  emitter.emit(event, service, ...args)
}

const setPeerName = (service, key) => {
  if (Reflect.has(peers[service], key)) {
    let device, ip, port

    [ip, port] = key.split('#')
    device = getDeviceByAddress(service, ip, parseInt(port))

    if (device) {
      peers[service][key] = device
      ehs.resolve[service] = ehs.resolve[service] || []
      ehs.resolve[service].forEach(handler => {
        handler(key, peers[service])
      })
    } else {
      setTimeout(() => setPeerName(service, key), 200)
    }
  }
}

emitter.on('set-peer-resolve-handler', (service, handler) => {
  ehs.resolve[service] = ehs.resolve[service] || []
  ehs.resolve[service].push(handler)
})

emitter.on('set-peer-connect-handler', (service, handler) => {
  ehs.connect[service] = ehs.connect[service] || []
  ehs.connect[service].push(handler)
})

emitter.on('set-peer-disconnect-handler', (service, handler) => {
  ehs.disconnect[service] = ehs.disconnect[service] || []
  ehs.disconnect[service].push(handler)
})

emitter.on('peer-connect', (service, key) => {
  peers[service] = peers[service] || {}
  ehs.connect[service] = ehs.connect[service] || []
  setTimeout(() => setPeerName(service, key), 200)

  peers[service][key] = null
  ehs.connect[service].forEach(handler => {
    handler(key, peers[service])
  })
})

emitter.on('peer-disconnect', (service, key) => {
  peers[service] = peers[service] || {}
  ehs.disconnect[service] = ehs.disconnect[service] || []

  Reflect.deleteProperty(peers[service], key)

  ehs.disconnect[service].forEach(handler => {
    handler(key, peers[service])
  })
})

export default emitter
