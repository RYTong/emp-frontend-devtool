'use babel'

import $ from 'jquery'
import { basename, join } from 'path'
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
    atom.packages.getAvailablePackagePaths()
      .forEach(packpath => {
        if (basename(packpath) === 'language-lua') {
          atom.grammars.readGrammar(
            join(packpath, 'grammars/lua.cson'),
            (err, lg) => err || this.editor.setGrammar(lg)
          )
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
                    ref = 'push'
                    onClick = { () => {
                      pushLuaScript(this.editor.getText())
                      $(this.refs.push).animateCss('bounceOutUp')
                    }}
            >push</button>
          }
          <button className = 'btn icon icon-x'
                  onClick = {() => cmd('toggle-lua') }
          >close</button>
        </div>
      </div>
    )
  }
}

export default LuaView
