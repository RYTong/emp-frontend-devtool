'use babel'

import $ from 'jquery'
import _ from 'lodash'
import path from 'path'
import cmd from './command'
import { toggleEbank } from './actions'
import store from './store'

let name, action, log, dbg, exec, device, qr, setting, expand, compress, project
let shakings = []
const sizes = ['12px', '16px', '24px', '32px']

const draw = (toolBar) => {
  toolBar.addButton({
    icon: 'file-tree',
    iconset: 'mdi',
    callback: 'tree-view:toggle',
    tooltip: '目录之树'
  })

  toolBar.addSpacer()

  addProjectName()

  toolBar.addSpacer()

  action = toolBar.addButton({
    icon: 'play-circle-outline',
    iconset: 'mdi',
    callback: () => {
      store.dispatch(toggleEbank(project))
      toggleAction()
    },
    tooltip: '你有本事抢男人，你有本事点我呐'
  })
  action.setEnabled(false)
  $(action.element).addClass('action')

  log = toolBar.addButton({
    icon: 'console',
    iconset: 'mdi',
    callback: 'emp-frontend-devtool:toggle-log',
    tooltip: '死亡笔记'
  })

  dbg = toolBar.addButton({
    icon: 'bug',
    callback: 'emp-frontend-devtool:show_lua_debug_panel',
    tooltip: '一步一步似爪牙，似魔鬼的步伐'
  })

  exec = toolBar.addButton({
    icon: 'rename-box',
    iconset: 'mdi',
    callback: 'emp-frontend-devtool:toggle-lua',
    tooltip: '咻'
  })

  device = toolBar.addButton({
    icon: 'cellphone',
    iconset: 'mdi',
    callback: () => atom.workspace.open('efd://devices'),
    tooltip: '有心跳的设备们'
  })

  qr = toolBar.addButton({
    icon: 'qrcode',
    iconset: 'mdi',
    callback: 'emp-frontend-devtool:toggle-qr',
    tooltip: '高清有码'
  })
  $(qr.element).addClass('disabled')

  toolBar.addSpacer()

  setting = toolBar.addButton({
    icon: 'settings',
    callback: '',
    tooltip: '机关'
  })

  expand = toolBar.addButton({
    icon: 'arrow-expand',
    iconset: 'mdi',
    callback: () => {
      bigger()
      isBiggest() && expand.setEnabled(false)
      compress.setEnabled(true)
      $(name.element).css('font-size', suitableSize())
    },
    tooltip: '再大点'
  })
  isBiggest() && expand.setEnabled(false)

  compress = toolBar.addButton({
    icon: 'arrow-compress',
    iconset: 'mdi',
    callback: () => {
      smaller()
      isSmallest() && compress.setEnabled(false)
      expand.setEnabled(true)
      $(name.element).css('font-size', suitableSize())
    },
    tooltip: '再小点'
  })
  isSmallest() && compress.setEnabled(false)

}

const deviceOnline = () => shake($(device.element), 'green')

const deviceOffline = () => shake($(device.element), 'red')

const select = (_project) => {
  project = _project
  action.setEnabled(true)
  $(action.element).addClass('ready')
  $(name.element).find('span').text(path.basename(project))
}

const unselect = () => {
  project = null
  action.setEnabled(false)
  $(action.element).removeClass('ready')
  $(name.element).find('span').text('(none)')
}


export default { draw, select, unselect, deviceOnline, deviceOffline }


const shake = (jnode, color) => {
  if (!jnode.hasClass('animated')) {
    let _color = jnode.css('color')

    jnode.css('color', color)
    jnode.animateCss('bounce', () => jnode.css('color', _color) )
  }
}

const addProjectName = () => {
  name = toolBar.addButton({})

  name.setEnabled(false)
  $(name.element).html(`<span>(none)</span>`)
  $(name.element).css('font-size', suitableSize())
  $(name.element).css('width', 'auto')
}

const toggleAction = () => {
  ['ready', 'running',
   'mdi-play-circle-outline',
   'mdi-stop-circle-outline'].forEach((klass) => {
     $(action.element).toggleClass(klass)
   })
  $(name.element).toggleClass('running-name')
  $(qr.element).toggleClass('disabled')
}

const curSize = () => {
  return atom.config.get('tool-bar.iconSize')
}

const suitableSize = () => {
  let size = parseInt(curSize())
  return Math.round(size * 0.73) + 'px'
}

const isSmallest = () => curSize() === sizes[0]

const isBiggest = () => curSize() === sizes[sizes.length - 1]

const bigger = () => {
  let val = sizes[sizes.indexOf(curSize()) + 1]
  atom.config.set('tool-bar.iconSize', val)
}

const smaller = () => {
  let val = sizes[sizes.indexOf(curSize()) - 1]
  atom.config.set('tool-bar.iconSize', val)
}
