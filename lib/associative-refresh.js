'use babel'

import path from 'path'
import menu from './menu'
import store from './store'
import { WWW_PATH } from './constants'

let id = null

const isRenderableEditor = (editor) => {
  let filepath, commonpath, isXHTML, isCommonFile
  let { selectedApp, isRunning } = store.getState()

  if (!isRunning || !editor) {
    return false
  }

  filepath = editor.getPath()
  commonpath = path.join(selectedApp, WWW_PATH)
  isXHTML = path.extname(filepath) === '.xhtml'
  isCommonFile = filepath.startsWith(commonpath)

  if (isXHTML && isCommonFile) {
    return true
  } else {
    return false
  }
}

const start = () => (id = setInterval(() => {
  if (isRenderableEditor(atom.workspace.getActiveTextEditor())) {
    menu.enableRefresh()
  } else {
    menu.disableRefresh()
  }
}, 200)
)

const stop = () => clearInterval(id)

export default { start, stop, isRenderableEditor }
