'use babel'

import _ from 'lodash'
import net from 'net'
import path from 'path'
import detectPort from 'detect-Port'

import su from '../server-util'
import parseIP from '../parse-ip'
import store from '../store'
import { COMMON_PATH } from '../constants'
import { startService, stopService } from '../actions'
import * as watcher from './watcher'

let log = require('../log-prefix')('[hot-loader]')
let _server = null
let _socks = {}

export default {
  init () {
    // su.bindStartAndStopListeners('loader', this, emitter)
  },

  start () {
    _server = net.createServer((sock) => {
      let key = `${parseIP(sock.remoteAddress)}#${sock.remotePort}`

      log('client connected', key)

      _socks[key] = sock

      sock.on('end', () => {
        log('client disconnected')
        Reflect.deleteProperty(_socks, key)
      })
    })
    _server.on('close', () => {
      _server = null
      store.dispatch(stopService('hot-loader'))
    })
    _server.on('error', (e) => {
      su.handleError('loader', e)
      _server.close()
    })

    detectPort(7777)
      .then(port => {
        _server.listen(port, () => {
          // watcher.watch(
          //   path.join(
          //     config.simulator.project,
          //     'public/www/resource_dev/common/lua/eff.lua'
          //   )
          // )
          // emitter.emit('status', 'loader', 'running', port)
          store.dispatch(startService('hot-loader', port))
          log(`server bound on tcp port #${port}`)
        })
      })
      .catch(err => {
        if (err) return
        _server = null
        su.handleError('loader', 'cant alloc port for loader server')
      })
  },

  stop () {
    watcher.close()
    _.each(_socks, socket => socket.end())
    if (_server) {
      _server.close()
    }
  },

  notify (filename) {
    let data = {
      type: isGlobalFile(filename) ? 'gfc' : 'fc',
      payload: filename
    }

    log('notify', data, 'to', _.size(_socks), 'clients')

    _.each(_socks, socket => socket.write(pack(data)))
  },

  open (offline) {
    let data = {
      type: 'fo',
      payload: offline
    }

    log('open', offline, 'to', _.size(_socks), 'clients')

    _.each(_socks, socket => socket.write(pack(data)))
  },

  getSocks () {
    return _socks
  }
}

let isGlobalFile = (filename) => {
  let predict = false

  if (path.extname(filename) === '.lua') {
    let { selectedApp } = store.getState()
    if (selectedApp) {
      let globalLuaPath = path.join(selectedApp, COMMON_PATH, 'lua')
      predict = filename.startsWith(globalLuaPath)
    }
  }

  return predict
}

let pack = (data) => {
  let message = JSON.stringify(data)

  return `#s#${message}#e#`
}
