'use babel'

import $ from 'jquery'
import store from '../store'
import ap from '../app-path'
import fs from 'fs'
import { join } from 'path'

const log = require('../log-prefix')('[goto]')
const click = 'click.efd-goto'
const klass = 'efd-goto-marker'

let links = []

const mark = () => {
  let editor = atom.workspace.getActiveTextEditor()
  let { isRunning, selectedApp } = store.getState()
  let filepath
  let offline
  let attr

  if (editor && isRunning) {
    $(editor.element.shadowRoot)
      .find('.entity.other.attribute-name.html')
      .each(function () {
        attr = $(this).text().trim()
        if (attr === 'src' || attr === 'ref') {
          if ($(this).next().get(0)) {
            // if (/\.(lua|css)\s*['"]/.test($(this).next().text())) {
            offline = $(this).next().text().match('[^\'"]+')
            if (offline) {
              [offline] = offline
              if (offline.includes('/')) {
                offline = join('channels', offline)
              }
              filepath = ap.offlineToAbsolute(offline, selectedApp)
              if (fs.existsSync(filepath)) {
                links.push($(this).next())
                $(this).next().addClass(klass)
                $(this).next().bind(click, ((abspath) => () => {
                  log('open file:', abspath)
                  atom.workspace.open(abspath)
                })(filepath))
              }
            }
          }
        }
      })
  }
}

const unmark = () => {
  links.forEach(link => {
    link.removeClass(klass)
    link.unbind(click)
  })
  links = []
}

export default {
  activate (state) {
    // get keycode from http://keycode.info
    $('atom-workspace')
      .keydown(e => { e.keyCode === 91 && mark() })
      .keyup(e => { e.keyCode === 91 && unmark() })
  }
}
