'use babel'

import fs from 'fs'
import { allowUnsafeEval } from 'loophole'
import { join, basename, extname, relative } from 'path'

import menu from '../menu'
import ap from '../app-path'
import store from '../store'
import cmd from '../command'
import invoke from '../invoke'
import su from '../server-util'
import parseIP from '../parse-ip'
import detectPort from 'detect-port'
import constants from '../constants'
import state from '../component-state'
import emitter from '../socket-emitter'
import getHostInfo from '../get-host-info'
import { startService, stopService, online } from '../actions'

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
    preloadpath = join(project, constants.PRELOAD_PATH)
    h5path = join(project, constants.H5_PATH)

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

    let hostInfo = getHostInfo()

    if (req.body.value) {
      let ip = parseIP(req.client.remoteAddress)
      let payload = JSON.parse(Buffer.from(req.body.value, 'base64').toString())
      let token = payload.token && payload.token.toUpperCase() || 'none'

      payload = {
        ...payload,
        token,
        _ip: ip,
        lastUpdateAt: new Date().toLocaleString()
      }

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
  let reqpath = req.body.name || req.query.name
  let actionType = req.headers['x-action-type'] || req.query['x-action-type'] || 'newpage'
  let token = req.headers['x-device-token'] || req.query['x-device-token']
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
    realpath = '--efd-files--/preload.xhtml'
    content = computePreloadFilePath(reqpath.slice(8), res)
  } else {
    if (!reqpath.includes('/')) {
      realpath = ap.offlineToAbsolute(reqpath, project)
    } else if (reqpath.startsWith('--efd-files--/')) {
      realpath = ap.getFilePath(basename(reqpath))
    } else {
      switch (extname(reqpath)) {
        case '.div':
        case '.html':
        case '.json':
        case '.png':
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

  if (!content && !fs.existsSync(realpath)) {
    let preloadfile = join(preloadpath, basename(realpath))

    // Try to get resource file from preload path
    if (fs.existsSync(preloadfile)) {
      realpath = preloadfile
      log('resolve real path to real preload path:', realpath)
    } else {
      log('file not found on server')
      return res.status(404).send('NOTFOUND:' + realpath)
    }
  }

  content = content || fs.readFileSync(realpath)

  metafp = `@EMP-DEVELOPMENT-MODE::FILENAME<${reqpath}>@`
  fileext = extname(realpath)

  if (fileext === '.xhtml' || fileext === '.div' || fileext === '.html') {
    let isNewPage = actionType === 'newpage'
    let fileExists = fs.existsSync(realpath)

    if (constants.AUTO_OPEN_NEW_PAGE && isNewPage && fileExists) {
      atom.workspace.open(realpath)
    }

    if (constants.AUTO_ASSOCIATE_PARTIAL_PAGE && isPartialPage(realpath)) {
      metafp = `@EMP-DEVELOPMENT-MODE::PARTIALFILENAME<${reqpath}>@`
      commentline = new Buffer('\n' + `<!--${metafp}-->`)
      res.set('Content-Type', 'text/partial-xhtml')
    } else {
      commentline = new Buffer('\n' + `<!--${metafp}-->`)
      res.set('Content-Type', 'text/xhtml')
    }
  } else if (fileext === '.lua') {
    // XXX: replace print_t with default print
    if (basename(realpath) === 'ert.lua') {
      let injection = new Buffer('\nert.print_t = print')
      content = Buffer.concat([content, injection])
    }
    commentline = new Buffer('\n' + `--${metafp}`)
    res.set('Content-Type', 'text/lua')
  } else if (fileext === '.css') {
    commentline = new Buffer('\n' + `/*${metafp}*/`)
    res.set('Content-Type', 'text/css')
  } else if (fileext === '.json') {
    res.set('Content-Type', 'text/json')
  } else if (fileext === '.png') {
    res.set('Content-Type', 'image/png')
  } else if (fileext === '.jpg' || fileext === 'jpeg') {
    res.set('Content-Type', 'image/jpg')
  }

  ressize = content.length + commentline.length
  res.send(Buffer.concat([content, commentline], ressize))
}

const isPartialPage = filepath => {
  if (fs.existsSync(filepath)) {
    let content = fs.readFileSync(filepath, 'utf8')
    return !/^\s*<\?xml\s+/g.test(content)
  } else {
    return false
  }
}

const computePreloadFilePath = (reqpath, res) => {
  let realpath

  if (reqpath.startsWith('main')) {
    realpath = Buffer.from(_mainbuff.toString()
                .replace(/@HOME_PAGE@/g, constants.HOME_PAGE))
  } else {
    // XXX
    realpath = join(preloadpath, reqpath)
  }

  return realpath
}
