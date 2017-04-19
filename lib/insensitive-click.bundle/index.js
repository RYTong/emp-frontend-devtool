'use babel'

import _ from 'lodash'
import $ from 'jquery'
import noop from '../noop'
import store from '../store'
import { add } from '../command'
import { selectProject } from '../actions'
import { ENABLE_PROFESSIONAL_TREE_OPERATION } from '../constants'

const hasClass = (jqnode, klass) => {
  return (jqnode.hasClass(klass) || jqnode.parent().hasClass(klass))
}

// WTF: The iteration of jquery node is asynchronous ?
// const getProjectPath = jqnode => {
//   let pnode = jqnode.parent()
//   if (pnode.get(0)) {
//     if (pnode.hasClass('project-root')) {
//       return pnode.find('.header span').attr('data-path')
//     } else {
//       getProjectPath(pnode)
//     }
//   } else {
//     return null
//   }
// }

const getProjectPath = node => {
  if (node) {
    if ($(node).hasClass('project-root')) {
      return $(node).find('.header span').attr('data-path')
    } else {
      return getProjectPath(node.parentElement)
    }
  } else {
    return null
  }
}

export default {
  treeView: null,

  activate (state) {
    add({'tree-view:remove-project-folder': () => {
      let { isRunning, selectedApp } = store.getState()
      let dontUnselect = _.some(
        atom.project.getPaths(),
        proj => proj === selectedApp
      )

      if (!dontUnselect && !isRunning) {
        store.dispatch(selectProject(null))
      }
    }})

    atom.packages.activatePackage('tree-view').then(treeViewPkg => {
      this.treeView = treeViewPkg.mainModule.createView()
      this.treeView.originalEntryClicked = this.treeView.entryClicked
      this.treeView.originalDblclick = this.treeView.dblclick || noop



      this.treeView.element.addEventListener('dblclick', (e) => {
        e.stopPropagation()

        if (!ENABLE_PROFESSIONAL_TREE_OPERATION) {
          return
        }

        if (hasClass($(e.target), 'header')) {
          this.treeView.openSelectedEntry()
        }
      })

      this.treeView.entryClicked = e => {
        let edge, proj

        proj = getProjectPath(e.target)

        e.stopPropagation()

        if (proj && !store.getState().isRunning) {
          store.dispatch(selectProject(proj))
        }

        if (!ENABLE_PROFESSIONAL_TREE_OPERATION) {
          return this.treeView.originalEntryClicked(e)
        }

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
  }
}
