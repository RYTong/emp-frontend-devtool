'use babel'

import EventEmitter from 'events'
import getDeviceByAddress from '../get-device-by-address'

const emitter = new EventEmitter()
let peers = {}
let eventHandlers = {
  connect: [],
  disconnect: [],
  resolve: []
}

const setPeerName = key => {
  if (Reflect.has(peers, key)) {
    let device, [ip, port] = key.split('#')
      if (device = getDeviceByAddress(
                    'logger',
                    ip,
                    parseInt(port))) {
        peers[key] = device
        eventHandlers.resolve.forEach(handler => {
          handler.call(null, key, peers)
        })
      } else {
       setTimeout(() => setPeerName(key), 200)
      }
  }
}

emitter.on('set-peer-resolve-handler', handler => {
  eventHandlers.resolve.push(handler)
})

emitter.on('set-peer-connect-handler', handler => {
  eventHandlers.connect.push(handler)
})

emitter.on('set-peer-disconnect-handler', handler => {
  eventHandlers.disconnect.push(handler)
})

emitter.on('peer-connect', key => {
  setTimeout(() => setPeerName(key), 200)

  peers[key] = null
  eventHandlers.connect.forEach(handler => {
    handler.call(null, key, peers)
  })
})

emitter.on('peer-disconnect', key => {
  Reflect.deleteProperty(peers, key)

  eventHandlers.disconnect.forEach(handler => {
    handler.call(null, key, peers)
  })
})


export default emitter
