'use babel'

import LuaPack from './luapack'

export default {
  start (options, loghandler) {
    let lp = new LuaPack(loghandler)

    lp.run(options)

    return lp
  },

  stop (lp) {
    if (lp) {
      lp.stop()
    }
  }
}
