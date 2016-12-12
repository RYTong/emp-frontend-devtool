'use babel'

import $ from 'jquery'
import escape from 'html-escape'
import {MessagePanelView, PlainMessageView} from 'atom-message-panel'

let log = require('../log-prefix')('[lua-exec]')
let messages = new MessagePanelView({title: 'Lua output'})

export default function (code, stdout, stderr) {
  if (!messages.pannel) {
    messages.attach()
  }

  messages.clear()

  let message = stdout
  let classname = 'lua-output-success-info'

  if (code !== 0) {
    log(stderr)
    message = stderr.split(':')[3] || 'unknown error'
    classname = 'lua-output-error-info'
  }

  // message = message.replace('\n', '<br/>')
  message = `<pre class="${classname}">${escape(message)}</pre>`
  messages.attach()

  messages.add(new PlainMessageView({
    message: message,
    raw: true })
  )
  $(messages.body).animate({ scrollTop: $(messages.element).height() }, 500)
}
