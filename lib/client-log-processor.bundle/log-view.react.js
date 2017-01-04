'use babel'

import _ from 'lodash'
import $ from 'jquery'
import fs from 'fs'
import React from 'react'
import state from '../component-state'
import store from '../store'
import cmd from '../command'
import emitter from '../socket-emitter'
import ap from '../app-path'
import { AUTO_CLEAR_DEVICE_LOG } from '../constants'

let log = require('../log-prefix')('[client-log.log-view]')
const emit = emitter.getEmit('logger')

class LogView extends React.Component {
  constructor (props) {
    super(props)

    this._luaContent = {}
    this._nativeContent = {}
    this.resizing = false
    this.lastY = null

    this.listen()
    this.state = {
      checked: 'lua',
      luaContent: '',
      nativeContent: '',
      peer: null,
      peers: {}
    }
  }

  listen () {
    emit('set-peer-resolve-handler', (peer, peers) => {
      this.setState({ peers })
    })

    emit('set-peer-connect-handler', (peer, peers) => {
      this._luaContent[peer] = ''
      this._nativeContent[peer] = ''
      this.setState({ peer, peers })
    })

    emit('set-peer-disconnect-handler', (peer, peers) => {
      if (AUTO_CLEAR_DEVICE_LOG) {
        this.clear(peer, 'lua,native')
      }

      if (peer === this.state.peer) {
        [peer] = Object.keys(this.state.peers)
      } else {
        peer = this.state.peer
      }

      this.setState({ peer, peers })
    })

    emitter.on('clear-log', token => {
      _.each(this.state.peers, (device, key) => {
        if (device.token === token && AUTO_CLEAR_DEVICE_LOG) {
          this.clear(key, 'lua,native')
        }
      })
    })

    emitter.on('client-log', (key, type, timestamp, message) => {
      if (type === 'lua') {
        if (this._luaContent[key]) {
          this._luaContent[key] += '\n' + message
        } else {
          this._luaContent[key] = message
        }
      } else {
        // consider other log levels are native log
        type = 'native'
        if (this._nativeContent[key]) {
          this._nativeContent[key] += '\n' + message
        } else {
          this._nativeContent[key] = message
        }
      }

      if (key !== this.state.peer) {
        return
      }

      // if updated log is current showing log
      if (type === this.state.checked) {
        if (type === 'lua') {
          this.setState({
            luaContent: this._luaContent[key]
          })
        } else {
          this.setState({
            nativeContent: this._nativeContent[key]
          })
        }
      }
    })
  }

  toggleLogPanel (target = this.state.checked) {
    let luaPanel = $(this.refs.body).find('.lua')
    let nativePanel = $(this.refs.body).find('.native')

    if (target === 'lua') {
      nativePanel.hide()
      luaPanel.show()
      luaPanel.animateCss('bounceInRight')
    } else {
      luaPanel.hide()
      nativePanel.show()
      nativePanel.animateCss('bounceInLeft')
    }
  }

  check (event) {
    let target = event.target.getAttribute('data-id')

    if (target !== this.state.checked) {
      if (target === 'lua') {
        this.refs.headlua.checked = true
        this.refs.headnative.checked = false
        this.setState({
          checked: target,
          luaContent: this._luaContent[this.state.peer]
        })
      } else {
        this.refs.headlua.checked = false
        this.refs.headnative.checked = true
        this.setState({
          checked: target,
          nativeContent: this._nativeContent[this.state.peer]
        })
      }
      this.toggleLogPanel(target)
    }
  }

  content (target) {
    let content = ''

    if (target === 'lua') {
      content = this.state.luaContent
    } else {
      content = this.state.nativeContent
    }

    return { __html: content }
  }

  clear (key = this.state.peer, which = this.state.checked) {
    // log('clear', which, 'log content of', key)

    if (which.includes('lua')) {
      Reflect.deleteProperty(this._luaContent, key)
    }
    if (which.includes('native')) {
      Reflect.deleteProperty(this._nativeContent, key)
    }

    if (this.state.peer === key) {
      if (this.state.checked === 'lua') {
        this.setState({ luaContent: '' })
      } else if (this.state.checked === 'native') {
        this.setState({ nativeContent: '' })
      }
    }
  }

  highlightLabel (target) {
    let className = 'input-label'

    if (target === this.state.checked) {
      className += ' text-warning'
    }

    return className
  }

  heighten (e) {
    if (e.target === this.refs.heading) {
      this.lastY = e.screenY
      this.resizing = true
      $('atom-workspace').bind('mousemove.efd-log', (e) => {
        let _height = $(this.refs.body).height() + this.lastY - e.screenY
        this.lastY = e.screenY
        $(this.refs.body).height(_height)
      })
      $('atom-workspace').bind('mouseup.efd-log', (e) => {
        this.resizing = false
        $('atom-workspace').unbind('mousemove.efd-log')
        $('atom-workspace').unbind('mouseup.efd-log')
      })
    }
  }

  hide () {
    cmd.dispatch('toggle-log')
  }

  selectPeer (event) {
    let key = event.target.value
    if (this.state.checked === 'lua') {
      this.setState({
        peer: key,
        luaContent: this._luaContent[key]
      })
    } else {
      this.setState({
        peer: key,
        nativeContent: this._nativeContent[key]
      })
    }
  }

  componentDidMount () {
    let _setState = this.setState

    this.setState = (_state) => {
      _setState.call(this, _state)
      state.setState('log-panel', {
        ...this.state,
        _luaContent: this._luaContent,
        _nativeContent: this._nativeContent
      })
    }

    $(this.refs.heading)
      .find(`input[data-id="${this.state.checked}"]`)
      .get(0).checked = true
    $(this.refs.body).height(200)
    $(this.refs.body).attr('tabindex', -1)
  }

  componentDidUpdate () {
    $(this.refs.bodylua).find('a').each(function () {
      if ($(this).attr('bind-click') !== 'yes') {
        $(this).click((event) => {
          let node = $(event.target)
          let file = node.attr('file')
          let line = node.attr('line')
          let { isRunning, selectedApp } = store.getState()

          node.attr('bind-click', 'yes')
          if (isRunning) {
            file = ap.offlineToAbsolute(file, selectedApp)
            if (fs.existsSync(file)) {
              atom.workspace.open(file, {
                initialLine: line - 1,
                initialColumn: 1
              })
            }
          }
        })
      }
    })
  }

  render () {
    return (
      <div className='efd-log-view'>
        <div className='panel-heading'
          ref='heading'
          onMouseDown={(e) => this.heighten(e)}
        >
          <div className='headleft'>
            <label className={this.highlightLabel('lua')}>
              <input className='input-radio'
                type='radio'
                data-id='lua'
                ref='headlua'
                onClick={this.check.bind(this)}
              />Lua Log
            </label>
            <label className={this.highlightLabel('native')}>
              <input className='input-radio'
                type='radio'
                data-id='native'
                ref='headnative'
                onClick={this.check.bind(this)}
              />Native Log
            </label>
            <DeviceDisplay peer={this.state.peer}
              peers={this.state.peers}
              handleChange={this.selectPeer.bind(this)}
            />
          </div>
          <div className='headright'>
            <i className='icon icon-trashcan'
              onClick={() => this.clear()}
            />
            <i className='icon icon-remove-close'
              onClick={this.hide}
            />
          </div>
        </div>
        <div className='panel-body native-key-bindings' ref='body'>
          <pre className='lua'
            dangerouslySetInnerHTML={this.content('lua')}
            ref='bodylua'
           />
          <pre className='native'>{this.state.nativeContent}</pre>
        </div>
      </div>
    )
  }
}

const DeviceDisplay = (props) => {
  if (_.size(props.peers) > 0) {
    return (
      <select className='input-select'
        value={props.peer}
        onChange={props.handleChange}
      >
        {
        _.map(props.peers, (device, key) => {
          if (device) {
            return (
              <option value={key}>
                { device.token } ({ device.deviceInfo })
              </option>
            )
          } else {
            return (
              <option value={key}>
                { key }
              </option>
            )
          }
        })
       }
      </select>
    )
  } else {
    return (
      <span className='inline-block highlight-info'>
        waitting
      </span>
    )
  }
}

export default LogView
