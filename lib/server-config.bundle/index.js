'use babel'

import config, { update as updateConfig } from './config'

export default {
  activate (state) {
    updateConfig(state.config)
  },

  serialize () {
    return ['config', config]
  }

}
