'use babel'

import introView from './intro-panel'

export default {
  activate (state) {
    atom.workspace.addOpener((uri) => {
      if (uri === 'efd://intro') {
        return introView
      }
    })

    atom.workspace.observePaneItems(item => {
      if (item === introView) {
        introView.play()
      }
    })
  }
}
