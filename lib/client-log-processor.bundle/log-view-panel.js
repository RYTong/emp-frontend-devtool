'use babel'

import React from 'react'
import ReactDOM from 'react-dom'

import LogView from './log-view.react'
import render from '../react-render';

const logViewPanel = atom.workspace.addBottomPanel({
  item: render(LogView),
  visible: false
});

const toggle = () => {
  logViewPanel.isVisible()
    ? logViewPanel.hide()
    : logViewPanel.show()
}

atom.commands.add('atom-workspace', {
  'emp-frontend-devtool:toggle-log': () => toggle()
})

export default logViewPanel
