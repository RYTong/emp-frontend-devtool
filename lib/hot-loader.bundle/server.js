'use babel'

import _ from 'lodash'
import net from 'net'
import path from 'path'
import detectPort from 'detect-Port'

import su from '../server-util'
import emitter from '../server-config.bundle/config-emitter'
import config from '../server-config.bundle/config'
import store from '../store'
import { startService, stopService } from '../actions'
import * as watcher from './watcher'

let log = require('../log-prefix')('[hot-loader]')
let _server = null
let _socks = {}

const GLOBALLUAPATH = 'public/www/resource_dev/common/lua'

export default {
  init() {
    su.bindStartAndStopListeners('loader', this, emitter)
  },

  start() {
    _server = net.createServer((sock) => {
      let key = `${sock.remoteAddress}#${sock.remotePort}`

      log('client connected', key)

      _socks[key] = sock

      sock.on('end', () => {
        log('client disconnected')
        Reflect.deleteProperty(_socks, key)
      })
    })
    _server.on('close', () => {
      _server = null
      emitter.emit('status', 'loader', 'ready')
      store.dispatch(stopService('hot-loader'))
    })
    _server.on('error', (e) => {
      emitter.emit('status', 'loader', 'error')
      su.handleError('loader', e)
      _server.close()
    })

    detectPort(7777)
      .then(port => {
        _server.listen(port, () => {
          watcher.watch(
            path.join(
              config.simulator.project,
              'public/www/resource_dev/common/lua/eff.lua'
            )
          )
          emitter.emit('status', 'loader', 'running', port)
          store.dispatch(startService('hot-loader', port))
          log(`server bound on tcp port #${port}`)
        })})
      .catch(err => {
        _server = null
        su.handleError('loader', 'cant alloc port for loader server')
      })

  },

  stop() {
    watcher.close()
    _.each(_socks, socket => socket.end())
    if (_server) {
      _server.close()
    }
  },

  notify(filename) {
    let data = {
      type: isGlobalFile(filename) ? 'gfc' : 'fc',
      payload: filename
    }

    log('notify', data, 'to', _.size(_socks), 'clients')

    _.each(_socks, socket => socket.write(pack(data)))
  },

  getSocks() {
    return _socks
  }
}

let isGlobalFile = (filename) => {
  let predict = false

  if (path.extname(filename) === '.lua') {
    if (config.simulator.project) {
      let _root = path.join(config.simulator.project, GLOBALLUAPATH)

      if (filename.startsWith(_root)) {
        predict = true
      }
    }
  }

  return predict
}

let isglobalLuaRootPath = () => {
  if (config.simulator.project) {
    return path.join(config.simulator.project, GLOBALLUAPATH)
  } else {
    return null
  }
}

let pack = (data) => {
  let message = JSON.stringify(data)

  return "#s#" + message + "#e#"
}
