'use babel'

import _ from 'lodash'
import $ from 'jquery'
import fs from 'fs'
import path from 'path'
import React from 'react'
import state from '../component-state'
import cmd from '../command'
import emitter from './log-emitter'

let log = require('../log-prefix')('[client-log.log-view]')

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
    emitter.emit('set-peer-resolve-handler', (peer, peers) => {
      this.setState({ peers })
    })

    emitter.emit('set-peer-connect-handler', (peer, peers) => {
      this._luaContent[peer] = ''
      this._nativeContent[peer] = ''
      this.setState({ peer, peers })
    })

    emitter.emit('set-peer-disconnect-handler', (peer, peers) => {
      this.clear(peer, 'lua,native')

      if (peer === this.state.peer) {
        [peer] = Object.keys(this.state.peers)
      } else {
        peer = this.state.peer
      }

      this.setState({ peer, peers })
    })

    emitter.on('clear', (token) => {
      _.each(this.peers, (device, key) => {
        if (device.token === token) {
          this.clear(key, 'lua,native')
        }
      })
    })

    emitter.on('log', (key, type, timestamp, message) => {
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
    log('clear', which, 'log content of', key)

    if (which.includes('lua')) {
      Reflect.deleteProperty(this._luaContent, key)
    } else if (which.includes('native')) {
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
      $('atom-workspace').bind('mousemove.efd', (e) => {
        let _height = $(this.refs.body).height() + this.lastY - e.screenY
        this.lastY = e.screenY
        $(this.refs.body).height(_height)
      })
      $('atom-workspace').bind('mouseup.efd', (e) => {
        this.resizing = false
        $('atom-workspace').unbind('mousemove.efd')
        $('atom-workspace').unbind('mouseup.efd')
      })
    }
  }

  hide () {
    cmd('toggle-log')
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
  }

  componentDidUpdate () {
    $(this.refs.bodylua).find('a').each(function () {
      if ($(this).attr('bind-click') !== 'yes') {
        $(this).click((event) => {
          let node = $(event.target)
          let file = node.attr('file')
          let line = node.attr('line')

          node.attr('bind-click', 'yes')

          if (path.extname(file) !== '.lua') {
            file = path.join(file, 'index.lua')
          }

          if (fs.existsSync(file)) {
            atom.workspace.open(file, {
              initialLine: line - 1,
              initialColumn: 1
            })
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
            <DeviceDisplay peer={ this.state.peer }
                           peers={ this.state.peers }
                           handleChange={ this.selectPeer.bind(this) }
            />
          </div>
          <div className='headright'>
            <button className='btn btn-error icon icon-remove-close'
                    onClick={this.hide}
            >Hide</button>
            <button className='btn btn-error icon icon-trashcan'
                    onClick={() => this.clear()}
            >Clear</button>
          </div>
        </div>
        <div className='panel-body' ref='body'>
          <pre className='lua'
               dangerouslySetInnerHTML={this.content('lua')}
               ref='bodylua'
          ></pre>
          <pre className='native'>{this.state.nativeContent}</pre>
        </div>
      </div>
    )
  }
}

const DeviceDisplay = (props) => {
  if (_.size(props.peers) > 0) {
    return (
      <select className = 'input-select'
              value = { props.peer }
              onChange = { props.handleChange }
      >
      {
        _.map(props.peers, (device, key) => {
          if (device) {
            return (
              <option value = { key }>
                { device.token } ({ device.deviceInfo })
              </option>
            )
          } else {
            return (
              <option value = { key }>
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
