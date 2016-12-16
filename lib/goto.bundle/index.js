'use babel'

import $ from 'jquery'
import store from '../store'
import ap from '../app-path'
import fs from 'fs'

const log = require('../log-prefix')('[goto]')
const selector = 'atom-text-editor::shadow .efd-goto-marker span.quoted.string'
const luaRegex = /src\s*=\s*["']([^"']*?)["']/g
const cssRegex = /ref\s*=\s*["']([^"']*?)["']/g
const click = 'click.efd-goto'

let markers = []

const mark = () => {
  let editor = atom.workspace.getActiveTextEditor()
  let { isRunning, selectedApp } = store.getState()
  let filepath
  let marker
  let offline

  if (editor && isRunning) {
    [cssRegex, luaRegex].forEach(regex => {
      editor.scan(regex, result => {
        marker = editor.markBufferRange(result.computedRange)
        editor.decorateMarker(marker, {
          type: 'line',
          class: 'efd-goto-marker'
        })
        markers.push(marker)
      })
    })
    setTimeout(() => {
      $(selector)
        .bind(click, e => {
          offline = $(e.target).text().match('[^\'"]+')

          if (offline) {
            [offline] = offline
            filepath = ap.offlineToAbsolute(offline, selectedApp)
            if (fs.existsSync(filepath)) {
              log('open file:', filepath)
              atom.workspace.open(filepath)
            }
          }
        })
    }, 100)
  }
}

const unmark = () => {
  markers.forEach(marker => marker.destroy())
  markers = []
  $(selector).unbind(click)
}

export default {
  activate (state) {
    $('atom-workspace').keydown(e => {
      if (e.keyCode === 91) {
        mark()
      }
    })
    $('atom-workspace').keyup(e => {
      if (e.keyCode === 91) {
        unmark()
      }
    })
  }
}
