'use babel'

import QRViewPanel from './qrcode-panel'

export default {
  activate (state) {
    atom.commands.add('atom-workspace', {
      'emp-frontend-devtool:toggle-qr': QRViewPanel.toggle,
      'emp-frontend-devtool:scan-qr': QRViewPanel.scaned
    })
  },

  serialize () {
  }

}
