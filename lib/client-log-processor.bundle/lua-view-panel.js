'use babel'

import LuaView from './lua-view.react'
import render from '../react-render'

const luaViewPanel = atom.workspace.addModalPanel({
  item: render(LuaView, 'efd-lua-view-container'),
  visible: false
})

const toggle = () => {
  luaViewPanel.isVisible()
    ? luaViewPanel.hide()
    : luaViewPanel.show()
}

export default { toggle }
