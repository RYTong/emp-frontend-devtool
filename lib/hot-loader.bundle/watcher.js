'use babel'

import fs from 'fs'
import server from './server'

let log = require('../log-prefix')('[hot-loader]')
let _watchers = {}

let _close = (file) => {
  log('closing watcher for file:', file)
  if (_watchers[file]) {
    _watchers[file].close()
    delete _watchers[file]
  }
}

export default {
  watch (files) {
    if (typeof files === 'string') {
      files = [files]
    }
    files.filter((file) => {
      return fs.existsSync(file)
    }).filter((file) => {
      return _watchers[file] === undefined
    }).forEach((file) => {
      log('add watcher for', file)
      _watchers[file] = fs.watch(file, (event) => {
        if (event === 'change') {
          server.notify(file)
        } else { // event === 'rename'
          _close(file)
        }
      })
    })
  },

  close () {
    Object.keys(_watchers).forEach((file) => {
      _close(file)
    })
  }
}
