'use babel'

import _ from 'lodash'
import $ from 'jquery'
import { basename, join } from 'path'
import React from 'react'
import { TextEditor } from 'atom'

import emitter from './log-emitter'
import { send } from './server'
import cmd from '../command'

const pushLuaScript = (rawText, peers) => {
  let script = Buffer.from(rawText).toString('base64')

  send(`#s#{"lua_console":"${script}"}#e#`, peers)
}

class LuaView extends React.Component {
  constructor (props) {
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

    this.listen()
    this.state = {
      pushable: true,
      peers: {},
      checkedPeers: []
    }
  }

  listen () {
    emitter.emit('set-peer-resolve-handler', (peer, peers) => {
      this.setState({ peers })
    })

    emitter.emit('set-peer-connect-handler', (peer, peers) => {
      this.setState({
        peers,
        checkedPeers: {
          ...this.state.checkedPeers,
          [peer]: null
        }
      })
    })

    emitter.emit('set-peer-disconnect-handler', (peer, peers) => {
      let _checkedPeers = this.state.checkedPeers

      Reflect.deleteProperty(_checkedPeers, peer)

      this.setState({
        peers,
        checkedPeers: _checkedPeers
      })
    })
  }

  togglePeer (key) {
    let checkedPeers = this.state.checkedPeers

    if (Reflect.has(this.state.checkedPeers, key)) {
      Reflect.deleteProperty(checkedPeers, key)
    } else {
      checkedPeers[key] = null
    }

    this.setState({ checkedPeers })
  }

  render () {
    return (
      <div className = 'efd-lua-view'>
        <div className = 'efd-lua-peers'>
          <Peers peers = { this.state.peers }
                 checkedPeers = { this.state.checkedPeers }
                 handleClick = { this.togglePeer.bind(this) }
          />
        </div>
        <div className = 'efd-lua-view-actions'
             ref = {
               node => $(node).before($(atom.views.getView(this.editor)))
             }
        >
          {
            _.size(this.state.checkedPeers) > 0 &&
            <button className = 'btn btn-success icon icon-rocket'
                    ref = 'push'
                    onClick = { () => {
                      pushLuaScript(this.editor.getText(),
                                    this.state.checkedPeers)
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

const Peers = props => {
  const isChecked = key => {
    return Reflect.has(props.checkedPeers, key)
  }

  if (_.size(props.peers) > 0) {
    return (
      <div>
      {
        _.map(props.peers, (peer, key) => {
          if (peer) {
            return (
              <label className='input-label'>
                <input className='input-toggle'
                       type='checkbox'
                       checked={ isChecked(key) }
                       onClick={ () => props.handleClick(key) }
                />
                { peer.token }({ peer.deviceInfo })
              </label>
            )
          } else {
            return (
              <label className='input-label'>
                <input className='input-toggle'
                       type='checkbox'
                       checked
                />
                { key }
              </label>
            )
          }
        })
      }
      </div>
    )
  } else {
    return (
      <span className='inline-block highlight-error'>
        没有可用的连接
      </span>
    )
  }
}

export default LuaView
