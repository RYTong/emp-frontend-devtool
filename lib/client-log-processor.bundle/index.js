'use babel'

import logViewPanel from './log-view-panel'
import luaViewPanel from './lua-view-panel'
import server from './server'

export default {
  activate (state) {
    atom.commands.add('atom-workspace', {
      'emp-frontend-devtool:toggle-log': () => logViewPanel.toggle(),
      'emp-frontend-devtool:toggle-lua': () => luaViewPanel.toggle()
    })

    server.init()
  },

  deactivate () {
    server.stop()
  }

}
