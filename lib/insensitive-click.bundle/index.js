'use babel'

import $ from 'jquery'
import { selectProject } from '../actions'
import store from '../store'

export default {
  treeView : null,

  activate(state) {
    atom.packages.activatePackage('tree-view').then(treeViewPkg => {
      this.treeView = treeViewPkg.mainModule.createView()
      this.treeView.originalEntryClicked = this.treeView.entryClicked

      this.treeView.entryClicked = e => {
        let entry = $(e.target)
        let dp = entry.attr('data-path')

        if (dp) {
          let proj = atom.project.getPaths().filter(x => dp.startsWith(x))[0]
          store.dispatch(selectProject(proj))
        }

        e.stopPropagation();
        if (entry.hasClass('icon-file-text')) {
          this.treeView.originalEntryClicked.call(this.treeView, e)
        } else {
          if (!entry.hasClass('name')) {
            if (e.offsetX < entry.children().offset().left) {
              this.treeView.originalEntryClicked.call(this.treeView, e)
            }
          }
        }
      }
    })
  },

  deactivate() {
    //TODO
  },

  serialize() {

  }
}
