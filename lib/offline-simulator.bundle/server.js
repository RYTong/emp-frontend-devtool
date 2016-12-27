'use babel'

import fs from 'fs'
import { join, basename, extname, relative } from 'path'

import { allowUnsafeEval } from 'loophole'
import detectPort from 'detect-port'
import su from '../server-util'
import store from '../store'
import menu from '../menu'
import cmd from '../command'
import state from '../component-state'
import parseIP from '../parse-ip'
import invoke from '../invoke'
import { startService, stopService, online } from '../actions'
import { PRELOAD_PATH, H5_PATH, HOME_PAGE, AUTO_OPEN_NEW_PAGE } from '../constants'
import ap from '../app-path'
import getHostInfo from '../get-host-info'
import emitter from '../socket-emitter'

let log = require('../log-prefix')('[offline]')
let express = allowUnsafeEval(() => require('express'))
let bodyParser = allowUnsafeEval(() => require('body-parser'))

let app = express()
let _server = null
const _port = 6102
const _mainbuff = fs.readFileSync(join(__dirname, 'main.xhtml'))

let project, preloadpath, h5path

export default {
  init () {
    // su.bindStartAndStopListeners('simulator', this, serverEmitter)
  },

  start (proj) {
    project = proj
    preloadpath = join(project, PRELOAD_PATH)
    h5path = join(project, H5_PATH)

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

const registerAccessPoint = app => {
  app.use(bodyParser.json())
  app.use(bodyParser.urlencoded({ extended: true }))

  app.all('/test_s/get_page', processOffline)

  app.all('/h5/*', (req, res) => {
    let realpath = join(h5path, req.url.slice(4))

    log('req.url:', req.url)
    log('real path:', realpath)

    res.sendFile(realpath)
  })

  app.all('/state', (req, res) => {
    log('req.url:', req.url)

    res.json({
      A: '查看最新的状态，请刷新当前页面。',
      application: store.getState(),
      panel: state.getState(),
      socket: emitter.getState()
    })
  })

  app.all('/command', (req, res) => {
    log('req.url', req.url)
    log('command method:', req.headers['x-method'])
    log('command args:', req.body)
    invoke(req.headers['x-method'], req.body)

    res.status(200).send('OK')
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
          cmd.dispatch('scan-qr')
        }

        payload.isNewDevice = true
        menu.deviceOnline()
      }

      store.dispatch(online(payload))
    }

    res.json(hostInfo)
  })
}

const processOffline = (req, res) => {
  let realpath
  let reqpath = req.body.name
  let actionType = req.headers['x-action-type'] || 'newpage'
  let token = req.headers['x-device-token']
  let content
  let metafp
  let fileext
  let commentline = new Buffer('')
  let ressize

  log('req.url  :', req.url)
  log('req.body :', req.body)
  log('req.type :', actionType)

  if (actionType === 'reload' || actionType === 'restart') {
    emitter.emit('clear-log', token)
  }

  if (reqpath.startsWith('/')) {
    reqpath = relative('/', reqpath)
  }

  log('reqpath:', reqpath)

  if (reqpath.startsWith('channels/')) {
    realpath = ap.offlineToAbsolute(reqpath, project)
  } else if (reqpath.startsWith('preload/')) {
    realpath = '--efd-files--preload.xhtml'
    content = computePreloadFilePath(reqpath.slice(8), res)
  } else {
    if (!reqpath.includes('/')) {
      realpath = ap.offlineToAbsolute(reqpath, project)
    } else if (reqpath.startsWith('--efd-files--/')) {
      realpath = ap.getFilePath(basename(reqpath))
    } else {
      switch (extname(reqpath)) {
        case '.xhtml':
        case '.lua':
        case '.css':
          realpath = ap.offlineToAbsolute(join('channels', reqpath), project)
          break
        default:
          console.error('bad file path')
      }
    }
  }

  log('real path:', realpath)

  content = content || fs.readFileSync(realpath)

  metafp = `@EMP-DEVELOPMENT-MODE::FILENAME<${reqpath}>@`
  fileext = extname(realpath)

  if (fileext === '.xhtml') {
    let isNewPage = actionType === 'newpage'
    let fileExists = fs.existsSync(realpath)
    if (AUTO_OPEN_NEW_PAGE && isNewPage && fileExists) {
      atom.workspace.open(realpath)
    }
    commentline = new Buffer('\n' + `<!--${metafp}-->`)
  } else if (fileext === '.lua') {
    commentline = new Buffer('\n' + `--${metafp}`)
  } else if (fileext === '.css') {
    commentline = new Buffer('\n' + `/*${metafp}*/`)
  }

  ressize = content.length + commentline.length
  res.send(Buffer.concat([content, commentline], ressize))
}

const computePreloadFilePath = (reqpath, res) => {
  let realpath

  if (reqpath.startsWith('main')) {
    realpath = Buffer.from(_mainbuff.toString()
                .replace(/@HOME_PAGE@/g, HOME_PAGE))
  } else {
    // XXX
    realpath = join(preloadpath, reqpath)
  }

  return realpath
}
