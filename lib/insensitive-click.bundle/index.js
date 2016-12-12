'use babel'

import $ from 'jquery'
import { selectProject } from '../actions'
import store from '../store'

const hasClass = (jqnode, klass) => {
  return (jqnode.hasClass(klass) || jqnode.parent().hasClass(klass))
}

const getDataPath = jqnode => {
  return (jqnode.attr('data-path') || jqnode.children().attr('data-path'))
}

export default {
  treeView: null,

  activate (state) {
    atom.packages.activatePackage('tree-view').then(treeViewPkg => {
      this.treeView = treeViewPkg.mainModule.createView()
      this.treeView.originalEntryClicked = this.treeView.entryClicked

      this.treeView.dblclick((e) => {
        e.stopPropagation()

        if (hasClass($(e.target), 'header')) {
          this.treeView.openSelectedEntry()
        }
      })

      this.treeView.entryClicked = e => {
        let edge, dp

        dp = getDataPath($(e.target))
        if (dp && !store.getState().isRunning) {
          atom.project.getPaths()
            .filter(path => dp.startsWith(path))
            .forEach(proj => store.dispatch(selectProject(proj)))
        }

        e.stopPropagation()

        // check if click on file
        if (hasClass($(e.target), 'file')) {
          this.treeView.originalEntryClicked(e)
        }

        // check if click on directory
        if ($(e.target).hasClass('header')) {
          edge = $(e.target).children().offset().left
        } else if ($(e.target).parent().hasClass('header')) {
          edge = $(e.target).offset().left
        } else {
          return
        }

        if (e.clientX < edge) {
          this.treeView.originalEntryClicked(e)
        }
      }
    })
  },

  deactivate () {
    // TODO
  },

  serialize () {

  }
}
