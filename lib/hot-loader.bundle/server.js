'use babel'

import _ from 'lodash'
import net from 'net'
import path from 'path'
import detectPort from 'detect-Port'

import su from '../server-util'
import parseIP from '../parse-ip'
import store from '../store'
import emitter from '../socket-emitter'
import { COMMON_PATH } from '../constants'
import { startService, stopService } from '../actions'
import { absoluteToOffline } from '../app-path'
import * as watcher from './watcher'

const emit = emitter.getEmit('hot-loader')
let log = require('../log-prefix')('[hot-loader]')
let _project
let _server = null
let _socks = {}

export default {
  init () {
    // su.bindStartAndStopListeners('loader', this, emitter)
  },

  start () {
    _server = net.createServer((sock) => {
      let key = `${parseIP(sock.remoteAddress)}#${sock.remotePort}`

      _socks[key] = sock

      log('client connected', key)
      emit('peer-connect', key)

      sock.on('end', () => {
        log('client disconnected', key)
        emit('peer-disconnect', key)
        Reflect.deleteProperty(_socks, key)
      })
    })
    _server.on('close', () => {
      _server = null
      store.dispatch(stopService('hot-loader'))
    })
    _server.on('error', (e) => {
      log('server error', e)
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

          _project = store.getState().selectedApp
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

  notify (absolutePath) {
    let isGF = isGlobalFile(absolutePath)
    let offlinePath = absoluteToOffline(absolutePath, _project)
    let data = {
      type: isGF ? 'gfc' : 'fc',
      payload: offlinePath
    }

    log('notify', data, 'to', _.size(_socks), 'clients')

    _.each(_socks, socket => socket.write(pack(data)))
  },

  open (absolutePath, key) {
    let offlinePath = absoluteToOffline(absolutePath, _project)
    let data = {
      type: 'fo',
      payload: offlinePath
    }

    _.each(_socks, (socket, _key) => {
      if (!key || key === _key) {
        log('open', offlinePath, 'to', _key)
        socket.write(pack(data))
      }
    })
  },

  getSocks () {
    return _socks
  }
}

let isGlobalFile = (filename) => {
  let predict = false

  if (path.extname(filename) === '.lua') {
    if (_project) {
      let globalLuaPath = path.join(_project, COMMON_PATH, 'lua')
      predict = filename.startsWith(globalLuaPath)
    }
  }

  return predict
}

let pack = (data) => {
  let message = JSON.stringify(data)

  return `#s#${message}#e#`
}
