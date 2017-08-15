'use babel'

import LogView from './log-view.react'
import render from '../react-render'
import store from '../store'
import { logLua, logNative , logOff} from '../actions'

const logViewPanel = atom.workspace.addBottomPanel({
  item: render(LogView, 'efd-log-view-container'),
  visible: false
})

hidePanel = () => {
    store.dispatch(logOff())
    logViewPanel.hide();
}

showPanel = () => {
    store.dispatch(logLua())
    logViewPanel.show();
}
const toggle = () => {
  logViewPanel.isVisible()
    ? hidePanel()
    : showPanel()
}


export default { toggle }
