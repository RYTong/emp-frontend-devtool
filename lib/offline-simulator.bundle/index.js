'use babel'

import server from './server'

export default {
  activate (state) {
    server.init()
    // server.start();
  },

  deactivate () {
    server.stop()
  }

}
