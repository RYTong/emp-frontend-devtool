'use babel'

import $ from 'jquery'
import _ from 'lodash'
import path from 'path'
import open from 'open'
import cmd from './command'
import { toggleApp } from './actions'
import store from './store'
import ap from './app-path'
import ar from './associative-refresh'
import loader from './hot-loader.bundle/server'

let log = require('./log-prefix')('[menu]')

let name, action, logger, dbg, refresh, exec, device,
  qr, setting, expand, compress, issue, state, project
let shakings = []
const sizes = ['12px', '16px', '24px', '32px']

const draw = (toolBar) => {
  hijack(toolBar.toolBar)

  toolBar.addButton({
    icon: 'file-tree',
    iconset: 'mdi',
    callback: 'tree-view:toggle',
    tooltip: 'tree view'
  })

  toolBar.addSpacer()

  addProjectName()

  toolBar.addSpacer()

  action = toolBar.addButton({
    icon: 'play-circle-outline',
    iconset: 'mdi',
    callback: () => {
      store.dispatch(toggleApp(project))
      toggleAction(project)
    },
    tooltip: 'ebank'
  })
  action.setEnabled(false)
  $(action.element).addClass('action')

  logger = toolBar.addButton({
    icon: 'console',
    iconset: 'mdi',
    callback: 'emp-frontend-devtool:toggle-log',
    tooltip: 'log view'
  })

  dbg = toolBar.addButton({
    icon: 'bug',
    callback: 'emp-frontend-devtool:show_lua_debug_panel',
    tooltip: 'debug view'
  })

  refresh = toolBar.addButton({
    icon: 'refresh',
    iconset: 'mdi',
    callback: () => {
      let editor = atom.workspace.getActiveTextEditor()

      if (ar.isRenderableEditor(editor)) {
        let absolutePath = editor.getPath()
        let offlinePath = ap.absoluteToOffline(absolutePath, project)

        log('refresh', absolutePath)
        offlinePath && loader.open(offlinePath)
      }
    },
    tooltip: '推送当前页面到设备'
  })
  refresh.setEnabled(false)

  exec = toolBar.addButton({
    icon: 'rename-box',
    iconset: 'mdi',
    callback: 'emp-frontend-devtool:toggle-lua',
    tooltip: 'lua view'
  })

  device = toolBar.addButton({
    icon: 'cellphone',
    iconset: 'mdi',
    callback: () => atom.workspace.open('efd://devices'),
    tooltip: 'device view'
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

  toolBar.addSpacer()

  issue = toolBar.addButton({
    icon: 'github-circle',
    iconset: 'mdi',
    callback: () => {
      open('https://github.com/RYTong/emp-frontend-devtool/issues/new')
    },
    tooltip: 'report issue'
  })

  state = toolBar.addButton({
    icon: 'heart',
    iconset: 'mdi',
    callback: () => open('http://localhost:6102/state')
  })
  $(state.element).addClass('disabled')

  config('visible', true)
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

const enableRefresh = () => {
  refresh && refresh.setEnabled(true)
}

const disableRefresh = () => {
  refresh && refresh.setEnabled(false)
}


export default {
  draw,
  select,
  unselect,
  deviceOnline,
  deviceOffline,
  enableRefresh,
  disableRefresh
}


const hijack = toolBar => {
  let _updatePosition = toolBar.updatePosition

  toolBar.updatePosition = pos => {
    if (pos === 'Left' || pos === 'Right') {
      $(name.element).hide()
    } else {
      $(name.element).show()
    }
    _updatePosition.call(toolBar, pos);
  }
}

const shake = (jnode, color) => {
  if (!jnode.hasClass('animated')) {
    let _color = jnode.css('color')

    jnode.css('color', color)
    jnode.animateCss('bounce', () => jnode.css('color', _color) )
  }
}

const addProjectName = () => {
  let pos = config('position')

  name = toolBar.addButton({})
  name.setEnabled(false)

  if (pos === 'Left' || pos === 'Right') {
    $(name.element).hide()
  }

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
  $(state.element).toggleClass('disabled')
  $(`.tree-view .header span[data-path="${project}"]`)
    .toggleClass('efd-app-running')

  if ($(name.element).hasClass('running-name')) {
    ar.start()
  } else {
    refresh.setEnabled(false)
    ar.stop()
  }
}

const curSize = () => {
  return config('iconSize')
}

const config = (key, value) => {
  if (value !== undefined) {
    atom.config.set('tool-bar.' + key, value)
  } else {
    return atom.config.get('tool-bar.' + key)
  }
}

const suitableSize = () => {
  let size = parseInt(curSize())
  return Math.round(size * 0.73) + 'px'
}

const isSmallest = () => curSize() === sizes[0]

const isBiggest = () => curSize() === sizes[sizes.length - 1]

const bigger = () => {
  let val = sizes[sizes.indexOf(curSize()) + 1]

  config('iconSize', val)
}

const smaller = () => {
  let val = sizes[sizes.indexOf(curSize()) - 1]

  config('iconSize', val)
}
