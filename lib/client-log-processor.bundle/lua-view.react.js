'use babel'

import $ from 'jquery'
import React from 'react'

import { send } from './server'
import cmd from '../command'


const pushLuaScript = () => {
  let script, lines = []

  $('.efd-lua-view atom-text-editor::shadow .line span')
    .each(function() {
      lines.push($(this).text())
    })

  script = Buffer.from(lines.join('\n')).toString('base64')

  send(`
    #s#{
      "lua_console": ${script}
    }#e#
  `)
}

const LuaView = () => (
  <div className = 'efd-lua-view'>
    <atom-text-editor ref = { node => editor = node }/>
    <div className = 'efd-lua-view-actions'>
      <button className = 'btn btn-success icon icon-rocket'
              onClick = { pushLuaScript }
      >push</button>
      <button className = 'btn icon icon-x'
              onClick = { () => cmd('toggle-lua') }
      >close</button>
    </div>
  </div>
)

export default LuaView
