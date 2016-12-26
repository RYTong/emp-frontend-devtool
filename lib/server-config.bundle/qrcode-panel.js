'use babel'

import $ from 'jquery'

import QRCodeView from './qrcode.react'
import render from '../react-redux-render'
import { AUTO_HIDE_QR_WHEN_SCANED } from '../constants'

const log = require('../log-prefix')('[server-config.qrcode-panel]')
const item = render(QRCodeView)
const visible = false
const qrPanel = atom.workspace.addModalPanel({ visible, item })

$(item).css('margin', 0)
$(item).parent().css('padding', 2)
$(item).parent().css('width', '285px')
$(item).parent().css('margin-left', -100)

const toggle = () => {
  log('toggle qr panel', qrPanel.isVisible())
  qrPanel.isVisible()
    ? qrPanel.hide()
    : qrPanel.show()
}

const scaned = () => {
  log('QR scaned')
  if (qrPanel.isVisible() && AUTO_HIDE_QR_WHEN_SCANED) {
    $(item).find('img').hide()
    $(item).find('i').show()
    setTimeout(() => {
      qrPanel.hide()
      $(item).find('img').show()
      $(item).find('i').hide()
    }, 1000)
  }
}

export default { toggle, scaned }
