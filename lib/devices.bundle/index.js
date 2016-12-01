'use babel'

import DevicesView from './devices.react'
import render from '../react-render'

const devicesView = render(DevicesView)
devicesView.getTitle = () => '设备管理'

export default {
  activate(state) {
    atom.workspace.addOpener((uri) => {
      if (uri === 'efd://devices') {
        return devicesView
      }
    })
  }
}
