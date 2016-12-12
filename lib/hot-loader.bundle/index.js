'use babel'

import path from 'path'
import server from './server'
import store from '../store'
import menu from '../menu'
import { WWW_PATH } from '../constants'
import config, { update as updateConfig } from '../server-config.bundle/config'



export default {
  activate(state) {
    updateConfig(state.config)
    server.init()
    // server.start()

    atom.workspace.observeTextEditors((editor) => {
      let filepath = editor.getPath()
      let project = config.simulator.project
      let wwwpath = path.join(project, WWW_PATH)

      if (project && filepath && filepath.startsWith(wwwpath)) {
        editor.onDidSave(() => {
          server.notify(filepath)
        })
      }
    })
  },

  deactivate() {
    server.stop()
  }
}
