'use babel'

import _ from 'lodash'
import $ from 'jquery'
import path from 'path'
import store from '../store'
import server from './server'
import getPeers from './get-peers'
import { WWW_PATH, OPENABLE_DEVICES_COUNT } from '../constants'

let selector = 'li[is="tree-view-file"] [data-name$=".xhtml"]'

const getPeerDesc = (key, device) => {
  if (device) {
    return `${device.token}(${device.deviceInfo})`
  } else {
    return key
  }
}

const peerItem = i => ({
  created (event) {
    let { isRunning, selectedApp } = store.getState()
    let filepath = $(event.target).attr('data-path')
    let isAppFile = filepath.startsWith(selectedApp)
    let peers = getPeers()
    let keys = Object.keys(peers)
    let hasPeer = keys.length > 0

    this.visible = false
    if (isRunning && isAppFile && hasPeer) {
      let key = keys[i]
      if (key) {
        let command = 'emp-frontend-devtool:open-file-in-device' + i
        this.label = `在 ${getPeerDesc(key, peers[key])} 中打开`
        this.command = command
        this.visible = true

        atom.commands.add(selector, {
          [command]: () => server.open(filepath, key)
        })
      }
    }
  }
})

const sepItem = () => ({
  created (event) {
    let { isRunning, selectedApp } = store.getState()
    let filepath = $(event.target).attr('data-path')
    let isAppFile = filepath.startsWith(selectedApp)
    let peers = getPeers()
    let hasPeer = _.size(peers) > 0

    this.type = 'separator'
    if (isRunning && isAppFile && hasPeer) {
      this.visible = false
    } else {
      this.visible = true
    }
  }
})

export default {
  activate (state) {
    let items = []
    for (let i = 0; i < OPENABLE_DEVICES_COUNT; i++) {
      items.push(peerItem(i))
    }
    items.push(sepItem())

    atom.contextMenu.add({ [selector]: items })

    atom.workspace.observeTextEditors((editor) => {
      let filepath = editor.getPath()
      let { isRunning, selectedApp } = store.getState()

      if (isRunning) {
        let wwwpath = path.join(selectedApp, WWW_PATH)

        if (filepath && filepath.startsWith(wwwpath)) {
          editor.onDidSave(() => server.notify(filepath))
        }
      }
    })

    server.init()
  },

  deactivate () {
    server.stop()
  }
}
