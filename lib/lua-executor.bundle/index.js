'use babel'

import $ from 'jquery'
import sh from 'shelljs'
import path from 'path'
import { CompositeDisposable } from 'atom'

import handler from './lua-output-handler'
import lp from '../luapack'

const luaTempFile = path.join(__dirname, 'luapack-temp-bundle.lua')

export default {
  subscriptions: new CompositeDisposable(),

  activate (state) {
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'emp-frontend-devtool:run-lua': this.run
    }))
  },

  run (event) {
    let luaFile = $(event.target).attr('data-path')

    if (!luaFile) {
      let editor = atom.workspace.getActiveTextEditor()
      if (editor && editor.getGrammar().name === 'Lua') {
        luaFile = editor.getPath()
      } else {
        return
      }
    }

    if (!sh.which('lua')) {
      atom.notifications.addError('command not found: lua')
      return
    }

    lp.start({
      entry: luaFile,
      build: luaTempFile
    })
    sh.exec(`lua ${luaTempFile}`, handler)
  },

  deactivate () {
    this.subscriptions.dispose()
  }
}
