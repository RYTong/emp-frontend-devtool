'use babel'

import fs from 'fs'
import path from 'path'

import { allowUnsafeEval } from 'loophole'
import detectPort from 'detect-port'
import su from '../server-util'
import store from '../store'
import menu from '../menu'
import cmd from '../command'
import state from '../component-state'
import parseIP from '../parse-ip'
import { startService, stopService, online } from '../actions'
import { WWW_PATH, PRELOAD_PATH, H5_PATH } from '../constants'
import { absoluteToOffline, offlineToAbsolute } from '../app-path'
import getHostInfo from '../get-host-info'
import loggerEmitter from '../socket-emitter'

let log = require('../log-prefix')('[offline]')
let express = allowUnsafeEval(() => require('express'))
let bodyParser = allowUnsafeEval(() => require('body-parser'))

let app = express()
let _server = null
const _port = 6102

let project, wwwpath, preloadpath, h5path

export default {
  init () {
    // su.bindStartAndStopListeners('simulator', this, serverEmitter)
  },

  start (proj) {
    project = proj
    wwwpath = path.join(project, WWW_PATH)
    preloadpath = path.join(project, PRELOAD_PATH)
    h5path = path.join(project, H5_PATH)

    registerAccessPoint(app)

    detectPort(_port)
      .then(port => {
        if (_port !== port) {
          su.handleError('simulator', `port #${_port} is not available`)
        } else {
          _server = app.listen(_port)
          _server.setTimeout(100)

          _server.on('close', () => {
            _server = null
            store.dispatch(stopService('offline-resource'))
          })
          _server.on('error', (e) => {
            su.handleError('simulator', e)
          })

          store.dispatch(startService('offline-resource', _port))

          log('server bound on http port #6102')
        }
      }).catch(err => {
        throw (err)
      })
  },

  stop () {
    log('stop server', _server)
    if (_server) {
      _server.close()
    }
  }
}

function registerAccessPoint (app) {
  app.use(bodyParser.json())
  app.use(bodyParser.urlencoded({ extended: true }))

  app.all('/test_s/get_page', process)

  app.all('/h5/*', (req, res) => {
    let realpath = path.join(h5path, req.url.slice(4))

    log('req.url:', req.url)
    log('real path:', realpath)

    res.sendFile(realpath)
  })

  app.all('/state', (req, res) => {
    log('req.url:', req.url)

    res.json({
      A: '查看最新的状态，请刷新当前页面。',
      centre: store.getState(),
      state: state.getState()
    })
  })

  app.all('/heartbeat', (req, res) => {
    // log('req.url  :', req.url)
    // log('req.body :', req.body)

    let hostInfo = getHostInfo(store.getState().servicePorts)

    if (req.body.value) {
      let ip = parseIP(req.client.remoteAddress)
      let payload = JSON.parse(Buffer.from(req.body.value, 'base64').toString())
      payload = {...payload, _ip: ip, lastUpdateAt: new Date().toLocaleString()}

      if (!store.getState().devices[payload.token]) {
        log('New device online:', payload)

        if (payload.source === 'qr-scan') {
          cmd('scan-qr')
        }

        payload.isNewDevice = true
        menu.deviceOnline()
      }

      store.dispatch(online(payload))
    }

    res.json(hostInfo)
  })
}

function process (req, res) {
  let realpath
  let reqpath = req.body.name
  let actionType = req.headers['x-action-type']
  let token = req.headers['x-token']
  let content
  let metafp
  let fileext
  let commentline
  let ressize
  let offlinePath

  log('req.url  :', req.url)
  log('req.body :', req.body)
  log('req.type :', actionType || 'new page')

  if (actionType === 'reload' || actionType === 'restart') {
    loggerEmitter.emit('clear-log', token)
  }

  if (reqpath.startsWith('channels/')) {
    reqpath = reqpath.slice(9)

    realpath = offlineToAbsolute(reqpath, project)
  } else if (reqpath.startsWith('preload/')) {
    realpath = computePreloadFilePath(reqpath.slice(8), res)
  } else {
    console.err('bad req path')
    return
  }
  log('real path:', realpath)

  content = fs.readFileSync(realpath)
  offlinePath = absoluteToOffline(realpath, project)
  metafp = `@EMP-DEVELOPMENT-MODE::FILENAME<${offlinePath}>@`
  fileext = path.extname(realpath)

  if (fileext === '.xhtml') {
    commentline = new Buffer('\n' + `<!--${metafp}-->`)
  } else if (fileext === '.lua') {
    commentline = new Buffer('\n' + `--${metafp}`)
  } else if (fileext === '.css') {
    commentline = new Buffer('\n' + `/*${metafp}*/`)
  }

  ressize = content.length + commentline.length
  res.send(Buffer.concat([content, commentline], ressize))
}

function computePreloadFilePath (reqpath, res) {
  let realpath

  if (reqpath.startsWith('main')) {
    realpath = path.join(wwwpath, 'entrance.xhtml')
  } else {
    realpath = path.join(preloadpath, reqpath)
  }

  return realpath
}
