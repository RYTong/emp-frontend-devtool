'use babel'

import React from 'react'
import $ from 'jquery'
import qr from 'qr-image'
import ConfigView from './config-view.react'
import { getHostInfo } from '../store'
import render from '../react-render'

let qrnode = null
let outer = null

const QRImage = () => (
  <atom-panel className='modal'>
    <div className="efd-qrcode-panel"
         ref = { div => { outer = div }}
    >
      <img ref = { img => { qrnode = img } }/>
    </div>
  </atom-panel>
)

const panel = atom.workspace.addModalPanel({
    item: render(QRImage),
    visible: false
  });



export default {
  toggle() {
    if (panel.isVisible()) {
      panel.hide()
    } else {
      let qrbuf = qr.imageSync(JSON.stringify(getHostInfo()));
      let value = 'data:image/png;base64,' + qrbuf.toString('base64')
      $(qrnode).attr('src', value)
      // TODO: avoid bind repeatly
      $(qrnode).click(e => e.stopPropagation())
      $(outer).click(e => panel.hide())
      panel.show()
    }
  }
}
