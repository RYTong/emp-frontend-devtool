'use babel'

import $ from 'jquery'

import qrPanel from './qrcode-panel'
import config, { update as updateConfig } from './config'

let log = require('../log-prefix')('[server-config]')

export default {

  activate(state) {
    updateConfig(state.config)
  },

  serialize() {
    return ['config', config]
  }

}
