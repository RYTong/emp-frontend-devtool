'use babel'

import fs from 'fs'
import path from 'path'
import http from 'http'
import { allowUnsafeEval } from 'loophole'
import detectPort from 'detect-port'
import su from '../server-util'
import store from '../store'
import menu from '../menu'
import state from '../component-state'
import parseIP from '../parse-ip'
import { startService, stopService, online } from '../actions'
import getHostInfo from '../get-host-info'
import serverEmitter from '../server-config.bundle/config-emitter'
import loggerEmitter from '../client-log-processor.bundle/log-emitter'
import config from '../server-config.bundle/config'

let log = require('../log-prefix')('[offline]')
let express = allowUnsafeEval(() => require('express'))
let bodyParser = allowUnsafeEval(() => require('body-parser'))

let app = express()
let _server = null
const _port = 6102

let ROOTDIR, WWWPATH, PRELOADPATH, COMMONPATH

export default {
  init() {
    su.bindStartAndStopListeners('simulator', this, serverEmitter)
  },

  start(project) {
    ROOTDIR     = project
    WWWPATH     = path.join(ROOTDIR, 'public/www')
    PRELOADPATH = path.join(WWWPATH, 'preload')
    COMMONPATH  = path.join(WWWPATH, 'resource_dev/common')

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
            serverEmitter.emit('status', 'simulator', 'ready')
          })
          _server.on('error', (e) => {
            su.handleError('simulator', e)
            serverEmitter.emit('status', 'simulator', 'error')
          })

          store.dispatch(startService('offline-resource', _port))
          serverEmitter.emit('status', 'simulator', 'running', port)

          log('server bound on http port #6102')
        }})
      .catch(err => {
        throw(err)
      })
  },

  stop() {
    log('stop server', _server)
    if (_server) {
      _server.close()
    }
  }
}

function registerAccessPoint(app) {
  app.use(bodyParser.json())
  app.use(bodyParser.urlencoded({ extended: true }))

  app.all('/test_s/get_page', process)

  app.all('/h5/*', (req, res) => {
    let realpath = path.join(WWWPATH, 'h5', req.url.slice(4))

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
      payload = { ...payload, _ip: ip, lastUpdateAt: new Date().toLocaleString()}

      if (!store.getState().devices[payload.token]) {
        log('New device online:', payload)
        payload.isNewDevice = true
        menu.deviceOnline()
      }
      store.dispatch(online(payload))
    }

    res.json(hostInfo)
  })
}

function process(req, res) {
  let realpath,
      reqpath = req.body.name,
      actionType = req.headers['x-action-type'],
      content,
      metafp,
      fileext,
      commentline,
      ressize

  log('req.url  :', req.url)
  log('req.body :', req.body)
  log('req.type :', actionType || 'new page')

  if (actionType === 'reload' || actionType === 'restart') {
    //TODO
    // loggerEmitter.emit('clear')
  }

  if (reqpath.startsWith('channels/')) {
    realpath = computeOfflineFilePath(reqpath.slice(9), res)
  } else if(reqpath.startsWith('preload/')) {
    realpath = computePreloadFilePath(reqpath.slice(8), res)
  } else {
    console.err('bad req path')
    return
  }
  log('real path:', realpath)

  content = fs.readFileSync(realpath)
  metafp = `@EMP-DEVELOPMENT-MODE::FILENAME<${realpath}>@`
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

function computeOfflineFilePath(reqpath, res) {
  let realpath

  if (isAbsolutePath(reqpath)) {
    realpath = reqpath
  } else if (isChannelPath(reqpath)) {
    realpath = path.join(COMMONPATH, 'channels', reqpath)
  } else {
    let extname = path.extname(reqpath)
    if (extname === '.lua' || extname === '.css') {
      realpath = path.join(COMMONPATH, extname.slice(1), reqpath)
    } else if (extname === '.xhtml') {
      realpath = path.join(WWWPATH, reqpath)
    } else { // images
      realpath = path.join(COMMONPATH, 'images', reqpath)
    }
  }

  return realpath
}

function computePreloadFilePath(reqpath, res) {
  let realpath

  if (reqpath.startsWith('main')) {
    realpath = path.join(WWWPATH, 'entrance.xhtml')
  } else {
    realpath = path.join(PRELOADPATH, reqpath)
  }

  return realpath
}

function isAbsolutePath(path) { return path.startsWith('/') }
function isChannelPath(path) { return path.search('/') !== -1 }
