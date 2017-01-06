'use babel'

import { existsSync } from 'fs'
import { offlineToAbsolute } from './app-path'
import store from './store'

const commands = {
  'open-file' (args) {
    let { isRunning, selectedApp } = store.getState()

    if (isRunning) {
      let abspath = offlineToAbsolute(args.path, selectedApp)
      if (existsSync(abspath)) {
        atom.focus()
        atom.workspace.open(abspath)
      }
    }
  }
}

const invoke = (method, args) => {
  if (Reflect.has(commands, method)) {
    commands[method](args)
  }
}

export default invoke
