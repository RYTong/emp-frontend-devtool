'use babel'

import path from 'path'
import store from '../store'
import server from './server'
import { WWW_PATH } from '../constants'

export default {
  activate (state) {
    server.init()
    // server.start()

    atom.workspace.observeTextEditors((editor) => {
      let filepath = editor.getPath()
      let { isRunning, selectedApp } = store.getState()

      if (isRunning) {
        let wwwpath = path.join(selectedApp, WWW_PATH)

        if (filepath && filepath.startsWith(wwwpath)) {
          editor.onDidSave(() => server.notify(filepath))
        }
      }
    })
  },

  deactivate () {
    server.stop()
  }
}
