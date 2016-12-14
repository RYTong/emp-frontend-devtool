'use babel'

import logViewPanel from './log-view-panel'
import luaViewPanel from './lua-view-panel'
import server from './server'
import emitter from '../socket-emitter'

const copySelectedLog = () => {
  atom.clipboard.write(getSelection().toString())
}

export default {
  activate (state) {
    atom.commands.add('atom-workspace', {
      'emp-frontend-devtool:toggle-log': logViewPanel.toggle,
      'emp-frontend-devtool:toggle-lua': luaViewPanel.toggle,
      'emp-frontend-devtool:copy-selected-log': copySelectedLog,
      'emp-frontend-devtool:clear-active-log': () => {
        emitter.emit('clear-active-log')
      }
    })

    server.init()
  },

  deactivate () {
    server.stop()
  }

}
