'use babel'

import $ from 'jquery'
import path from 'path'
import cmd from './command'
import { toggleEbank } from './actions'
import store from './store'

let name, action, log, dbg, exec, device, qr, setting, expand, compress, project
const sizes = ['12px', '16px', '24px', '32px']

const draw = (toolBar) => {
  toolBar.addButton({
    icon: 'file-tree',
    iconset: 'mdi',
    callback: 'tree-view:toggle',
    tooltip: '显示或隐藏目录树'
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
    tooltip: '启动或关闭开发环境'
  })
  action.setEnabled(false)
  $(action.element).addClass('action')

  log = toolBar.addButton({
    icon: 'console',
    iconset: 'mdi',
    callback: 'emp-frontend-devtool:toggle-log',
    tooltip: '显示或隐藏日志面板'
  })

  dbg = toolBar.addButton({
    icon: 'bug',
    callback: 'emp-frontend-devtool:show_lua_debug_panel',
    tooltip: '显示或隐藏调试面板'
  })

  exec = toolBar.addButton({
    icon: 'rename-box',
    iconset: 'mdi',
    callback: '',
    tooltip: '显示或隐藏Lua交互面板'
  })

  device = toolBar.addButton({
    icon: 'cellphone',
    iconset: 'mdi',
    callback: () => atom.workspace.open('efd://devices'),
    tooltip: '查看当前连接设备'
  })

  qr = toolBar.addButton({
    icon: 'qrcode',
    iconset: 'mdi',
    callback: 'emp-frontend-devtool:toggle-qr',
    tooltip: '生成二维码'
  })
  $(qr.element).addClass('disabled')

  toolBar.addSpacer()

  setting = toolBar.addButton({
    icon: 'settings',
    callback: '',
    tooltip: '显示或隐藏设置面板'
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
    tooltip: '更大的菜单栏'
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
    tooltip: '更小的菜单栏'
  })
  isSmallest() && compress.setEnabled(false)

}

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

export default { draw, select, unselect }

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
