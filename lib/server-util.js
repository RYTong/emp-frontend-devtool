'use babel'

import simulator from './offline-simulator.bundle/server'
import logger from './client-log-processor.bundle/server'
import loader from './hot-loader.bundle/server'
import luaDebugger from './lua-debug.bundle/net/server'

export default {
  handleError (server, err) {
    atom.notifications.addError(server + ' error', {
      detail: err
    })
  },

  bindStartAndStopListeners (name, server, emitter) {
    emitter.on('start', (servername) => {
      if (servername === name) {
        server.start()
      }
    })
    emitter.on('stop', (servername) => {
      if (servername === name) {
        server.stop()
      }
    })
  },

  start (project) {
    simulator.start(project)
    logger.start()
    loader.start()
    luaDebugger.start()
  },

  stop (project) {
    simulator.stop(project)
    logger.stop()
    loader.stop()
    luaDebugger.stop()
  },
  changeSyncJump() {
    simulator.changeSyncJump()
  }
}
