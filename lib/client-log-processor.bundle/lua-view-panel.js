'use babel'

import React from 'react'
import ReactDOM from 'react-dom'

import LuaView from './lua-view.react'
import render from '../react-render';

const luaViewPanel = atom.workspace.addModalPanel({
  item: render(LuaView, 'efd-lua-view-container'),
  visible: false
});

const toggle = () => {
  luaViewPanel.isVisible()
    ? luaViewPanel.hide()
    : luaViewPanel.show()
}

atom.commands.add('atom-workspace', {
  'emp-frontend-devtool:toggle-lua': () => toggle()
})

export default { toggle }
