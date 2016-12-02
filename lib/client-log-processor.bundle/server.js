'use babel'

import net from 'net'
import detectPort from 'detect-port'
import listener from './default-listener'
import su from '../server-util'
import emitter from '../server-config.bundle/config-emitter'
import store from '../store'
import { startService, stopService } from '../actions'

let log = require('../log-prefix')('[client-log]')
let _handler = null
let _server = null
let _socks = []

export default {
  init() {
    su.bindStartAndStopListeners('logger', this, emitter)
  },

  start() {
    _server = net.createServer((socket) => {

      _socks.push(socket)

      socket.setEncoding('utf8')
      listener.bind(socket)
    })
    _server.on('close', () => {
      _server = null
      emitter.emit('status', 'logger', 'ready')
      store.dispatch(stopService('logger'))
    })
    _server.on('error', (e) => {
      emitter.emit('status', 'logger', 'error')
      su.handleError('logger', e)
      _server.close()
    })

    detectPort(7003)
      .then(port => {
        _server.listen(port, () => {
          store.dispatch(startService('logger', port))
          emitter.emit('status', 'logger', 'running', port)
          log(`server bound on tcp port #${port}`)
        })})
      .catch(err => {
        _server = null
        su.handleError('logger', 'cant alloc port for logger server')
      })
  },

  send(payload) {
    log('send lua scirpt', payload)
    _socks.forEach(socket => socket.write(payload))
  },

  stop() {
    _socks.forEach(socket => socket.end())

    if (_server) {
      _server.close()
    }
  }
}
