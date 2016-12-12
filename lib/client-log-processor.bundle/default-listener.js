'use babel'

import escape from 'html-escape'
import emitter from './log-emitter'
import transform from './source-transform'

let log = require('../log-prefix')('[client-log]')
let caches = {}

let bind = (socket) => {
  let key = `${socket.remoteAddress}#${socket.remotePort}`
  caches[key] = ''

  log('client connected', key)
  emitter.emit('peer-connect', key)

  socket.on('data', (data) => {
    let chunk = ''
    caches[key] += data

    while ((chunk = /^#s#(.*?)#e#/g.exec(caches[key])) !== null) {
      let size = chunk[0].length
      let log = JSON.parse(chunk[1])

      if (log.level) {
        let message = Buffer.from(log.message, 'base64').toString()
        let logtime = message.match(/^\d{4}-\d{2}-\d{2}\s*\d*:\d*:\d*\.\d*\s*/)
        let timestamp = null

        if (logtime) {
          // log(logtime[0])
          message = message.substr(logtime[0].length)
          timestamp = logtime[0]
        }

        message = message.trim()

        if (log.level === 'lua') {
          message = transform(escape(message))
        }
        emitter.emit('log', log.level, timestamp, message)
      }

      caches[key] = caches[key].substr(size)
    }
  })

  ['end', 'close', 'error'].forEach((event) => {
    socket.on(event, () => {
      emitter.emit('peer-disconnect', key)
      delete caches[key]
    })
  })
}

export default { bind }
