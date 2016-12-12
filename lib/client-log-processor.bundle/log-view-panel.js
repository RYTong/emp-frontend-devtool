'use babel'

import LogView from './log-view.react'
import render from '../react-render'

const logViewPanel = atom.workspace.addBottomPanel({
  item: render(LogView, 'efd-log-view-container'),
  visible: false
})

const toggle = () => {
  console.log('fuck toggle')
  logViewPanel.isVisible()
    ? logViewPanel.hide()
    : logViewPanel.show()
}

export default { toggle }
