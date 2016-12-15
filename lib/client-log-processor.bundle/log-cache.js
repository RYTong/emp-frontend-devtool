'use babel'

import escape from 'html-escape'
import emitter from '../socket-emitter'
import transform from './source-transform'

let log = require('../log-prefix')('[client-log.log-cache]')
let caches = {}

let feed = (key, data) => {
  let chunk

  if (!Reflect.has(caches, key)) {
    caches[key] = data
  } else {
    caches[key] += data
  }

  while ((chunk = /^#s#(.*?)#e#/g.exec(caches[key])) !== null) {
    let payload, size

    size = chunk[0].length

    try {
      payload = JSON.parse(chunk[1])
    } catch (err) {
      payload = {}
      log('failed to parse log text to JSON with', chunk[1])
    }

    if (payload.level) {
      let message = Buffer.from(payload.message, 'base64').toString()
      let logtime = message.match(/^\d{4}-\d{2}-\d{2}\s*\d*:\d*:\d*\.\d*\s*/)
      let timestamp = null

      if (logtime) {
        // log(logtime[0])
        message = message.substr(logtime[0].length)
        timestamp = logtime[0]
      }

      message = message.trim()
      if (payload.level === 'lua') {
        message = transform(escape(message))
      }
      emitter.emit('client-log', key, payload.level, timestamp, message)
    }

    caches[key] = caches[key].substr(size)
  }
}

const remove = () => {}

export default { feed, remove }
