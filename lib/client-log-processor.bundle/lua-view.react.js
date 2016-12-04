'use babel'

import $ from 'jquery'
import path from 'path'
import React from 'react'
import { TextEditor } from 'atom'

import { send } from './server'
import cmd from '../command'


const pushLuaScript = (rawText) => {
  let script = Buffer.from(rawText).toString('base64')

  send(`#s#{"lua_console":"${script}"}#e#`)
}


class LuaView extends React.Component {
  constructor(props) {
    super(props)

    this.editor = new TextEditor()
    atom.packages.getAvailablePackageNames()
      .forEach(packname => {
        if (packname === 'language-lua') {
          atom.packages.activate('language-lua').then(() => {
            let lg = atom.grammars.grammarForScopeName('source.lua')
            this.editor.setGrammar(lg)
          })
        }
      })
    this.state = { pushable: true }
  }

  render() {
    return (
      <div className = 'efd-lua-view'>
        <div className = 'efd-lua-view-actions'
             ref = {
               node => $(node).before($(atom.views.getView(this.editor)))
             }
        >
          {
            this.state.pushable &&
            <button className = 'btn btn-success icon icon-rocket'
                    onClick = { () => pushLuaScript(this.editor.getText()) }
            >push</button>
          }
          <button className = 'btn icon icon-x'
                  onClick = { () => cmd('toggle-lua') }
          >close</button>
        </div>
      </div>
    )
  }
}

export default LuaView
