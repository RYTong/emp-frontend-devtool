'use babel'

import EventEmitter from 'events'
import server from './server'
import logViewPanel from './log-view-panel'
import luaViewPanel from './lua-view-panel'

let log = require('../log-prefix')('[client-log]')

export default {
  activate(state) {
    server.init()
  },

  deactivate() {
    server.stop()
  }

}
