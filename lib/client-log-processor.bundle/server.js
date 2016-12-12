'use babel'

import _ from 'lodash'
import net from 'net'
import detectPort from 'detect-port'
import logCache from './log-cache'
import su from '../server-util'
import emitter from './log-emitter'
import store from '../store'
import parseIP from '../parse-ip'
import { startService, stopService } from '../actions'

let log = require('../log-prefix')('[client-log.server]')
let _server = null
let _socks = {}

export default {
  init () {
    // su.bindStartAndStopListeners('logger', this, emitter)
  },

  start () {
    _server = net.createServer((sock) => {
      let key = `${parseIP(sock.remoteAddress)}#${sock.remotePort}`

      _socks[key] = sock

      log('client connected', key)
      emitter.emit('peer-connect', key)

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
      store.dispatch(stopService('logger'))
    })
    _server.on('error', (e) => {
      su.handleError('logger', e)
      _server.close()
    })

    detectPort(7003)
      .then(port => {
        _server.listen(port, () => {
          store.dispatch(startService('logger', port))
          log(`server bound on tcp port #${port}`)
        }) })
      .catch(err => {
        if (err) return
        _server = null
        su.handleError('logger', 'cant alloc port for logger server')
      })
  },

  send (payload, peers = {}) {
    _.each(peers, (val, key) => {
      let socket = _socks[key]
      if (socket) {
        log('send to', key, 'with', payload)
        socket.write(payload)
      }
    })
  },

  getSocks () {
    return _socks
  },

  stop () {
    _.each(_socks, socket => socket.end())

    if (_server) {
      _server.close()
    }
  }
}
