'use babel'

import _ from 'lodash'
import net from 'net'
import detectPort from 'detect-port'
import logCache from './log-cache'
import su from '../server-util'
import emitter from '../server-config.bundle/config-emitter'
import store from '../store'
import { startService, stopService } from '../actions'

let log = require('../log-prefix')('[client-log]')
let _handler = null
let _server = null
let _socks = {}

export default {
  init() {
    su.bindStartAndStopListeners('logger', this, emitter)
  },

  start() {
    _server = net.createServer((sock) => {
      let key = `${sock.remoteAddress}#${sock.remotePort}`

      _socks[key] = sock
      
      log('client connected', key)

      sock.setEncoding('utf8')

      sock.on('data', data => logCache.feed(key, data))

      sock.on('end', () => {
        log('client disconnected')
        emitter.emit('peer-disconnect', key)
        Reflect.deleteProperty(_socks, key)
      })
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
    _.each(_socks, socket => {
      log('send to', socket, 'with', payload)
      socket.write(payload)
    })
  },

  getSocks() {
    return _socks
  },

  stop() {
    _.each(_socks, socket => socket.end())

    if (_server) {
      _server.close()
    }
  }
}
