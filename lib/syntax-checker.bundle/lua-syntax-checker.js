'use babel'

import { Point, Range } from 'atom'
import { extname } from 'path'
import { readFile } from 'fs'
import { parse } from 'luaparse'
import $ from 'jquery'
import editors from './lua-editors'

export let check = function (file) {
  if (extname(file) === '.lua') {
    readFile(file, 'utf8', (err, content) => {
      if (err) return
      checkWithSource(file, content)
    })
  }
}

export let checkWithSource = function (file, source) {
  try {
    parse(source)
    $('.tree-view').find(`[data-path="${file}"]`)
      .removeClass('lua-syntax-error-filename')
    $('.texteditor').find(`[data-path="${file}"]`)
      .removeClass('lua-syntax-error-filename')
    mark(null, file)
  } catch (err) {
    $('.tree-view').find(`[data-path="${file}"]`)
      .addClass('lua-syntax-error-filename')
    $('.texteditor').find(`[data-path="${file}"]`)
      .addClass('lua-syntax-error-filename')
    mark(err, file)
  }
}

export let getLinter = (editor) => {
  let file = editor.getPath()
  try {
    parse(editor.getText())
    $('.tree-view').find(`[data-path="${file}"]`)
      .removeClass('lua-syntax-error-filename')
    $('.texteditor').find(`[data-path="${file}"]`)
      .removeClass('lua-syntax-error-filename')
    return []
  } catch (err) {
    $('.tree-view').find(`[data-path="${file}"]`)
      .addClass('lua-syntax-error-filename')
    $('.texteditor').find(`[data-path="${file}"]`)
      .addClass('lua-syntax-error-filename')
    let line = err.line - 1
    let col = err.column
    let lineRange = editor.getBuffer().rangeForRow(line, false)
    let message = err.message.match(/\[\d+:\d+] (.*)/)[1]

    return [{
      type: 'Error',
      text: message,
      filePath: editor.getPath(),
      range: new Range(new Point(line, col), lineRange.end)
    }]
  }
}

let mark = function (err, file) {
  let editor = editors[file]

  if (!editor) return

  if (editor.luaMarker) editor.luaMarker.destroy()
  if (editor.luaTooltip) editor.luaTooltip.dispose()

  if (err) {
    let point = new Point(err.line - 1, err.column - 1)
    let range = new Range(point, point)
    let marker = editor.markBufferRange(range)
    let host = atom.views.getView(editor)
    let target = host.shadowRoot.querySelector('.line-numbers')

    editor.decorateMarker(marker, {
      type: 'line-number',
      class: 'lua-error-line-number'
    })

    editor.luaMarker = marker

    editor.luaTooltip = atom.tooltips.add(target, {
      delay: 0,
      trigger: 'click',
      selector: '.lua-error-line-number',
      title: function () {
        return err.message
      }
    })
  }
}
