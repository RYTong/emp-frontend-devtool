'use babel'

import $ from 'jquery'

import QRImage from './qrcode.react'
import render from '../react-redux-render'

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
