'use babel'

import cleaner from './devices-cleaner'
import DevicesView from './devices.react'
import render from '../react-render'

const devicesView = render(DevicesView)
devicesView.getTitle = () => 'devices'

export default {
  activate(state) {

    cleaner.start()

    atom.workspace.addOpener((uri) => {
      if (uri === 'efd://devices') {
        return devicesView
      }
    })
  }
}
