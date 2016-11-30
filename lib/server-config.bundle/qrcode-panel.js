'use babel'

import $ from 'jquery'
import qr from 'qr-image'
import React from 'react'
import { connect } from 'react-redux'

import cmd from '../command'
import store from '../store'
import render from '../react-redux-render'

const log = require('../log-prefix')('[server-config.qrcode]')

let mapStateToProps = (state) => { available: state.isRunning }

class QRImage extends React.Component {
  constructor(props) {
    super(props)
    store.subscribe(() => {
      this.setState({ content: this.generateContent() })
    })
    this.state = { content: this.generateContent() }
  }

  generateContent() {
    if (store.getState().isRunning) {
      let info = store.getHostInfo()
      let qrbuf = qr.imageSync(JSON.stringify(info))
      let b64 = 'data:image/png;base64,' + qrbuf.toString('base64')

      log('generate QR Code for Dev Env:', info)

      return <img src = { b64 }/>
    } else {
      return (
        <ul className='error-messages block'>
          <li>开发环境尚未启动</li>
        </ul>
      )
    }
  }

  render() {
    return (
      <div className="efd-qrcode-panel"
           onClick = { () => cmd('toggle-qr') }
      >
        { this.state.content }
      </div>
    )
  }
}

QRImage = connect(mapStateToProps)(QRImage)

const item = render(QRImage)
const visible = false
const qrPanel = atom.workspace.addModalPanel({ visible, item })

$(item).css('margin', 0)
$(item).parent().css('padding', 2)
$(item).parent().css('width', 'auto')
$(item).parent().css('margin-left', -100)

let toggle = () => {
  qrPanel.isVisible()
    ? qrPanel.hide()
    : qrPanel.show()
}

atom.commands.add('atom-workspace', { 'emp-frontend-devtool:toggle-qr': toggle })

export default { toggle }
