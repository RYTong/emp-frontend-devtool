'use babel'

import $ from 'jquery'
import _ from 'lodash'
import qr from 'qr-image'
import React from 'react'

import cmd from '../command'
import store from '../store'
import getHostInfo from '../get-host-info'

const log = require('../log-prefix')('[server-config.qrcode]')

const Warning = (props) => {
  if (props.visible) {
    return (
      <ul className='error-messages block'>
        <li>开发环境尚未启动</li>
      </ul>
    )
  } else {
    return null
  }
}

const QRImage = (props) => {
  if (props.visible) {
    let hostInfo = getHostInfo(props.servicePorts)
    let qrbuf = qr.imageSync(JSON.stringify(hostInfo))
    let b64 = 'data:image/png;base64,' + qrbuf.toString('base64')

    log('generate QR Code for Dev Env:', hostInfo)

    return <img src = { b64 } ref = { (node) => $(node).animateCss("pulse") }/>
  } else {
    return null
  }
}

class QRCodeView extends React.Component {
  constructor (props) {
    super(props)

    store.subscribe(() => {
      let newState = this.getNewState()
      if (!_.isEqual(this.state, newState)) {
        this.setState(newState)
      }
    })
    this.state = this.getNewState()
  }

  getNewState () {
    let { isRunning, servicePorts } = store.getState()
    return {isRunning, servicePorts}
  }

  render () {
    return (
      <div className="efd-qrcode-panel"
           onClick = { () => cmd('toggle-qr') }
      >
        <Warning visible={!this.state.isRunning}/>
        <QRImage visible={this.state.isRunning}
                 servicePorts={this.state.servicePorts}
        />
      </div>
    )
  }
}

export default QRCodeView
