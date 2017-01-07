'use babel'

import $ from 'jquery'
import path from 'path'
import open from 'open'
import { toggleApp } from './actions'
import store from './store'
import ar from './associative-refresh'
import isAppProject from './is-app-project'
import loader from './hot-loader.bundle/server'

let log = require('./log-prefix')('[menu]')

let name, action, refresh, _refresh, device,
  qr, expand, compress, state, project
const sizes = ['12px', '16px', '24px', '32px']

const draw = (toolBar) => {
  hijack(toolBar.toolBar)

  toolBar.addButton({
    icon: 'file-tree',
    iconset: 'mdi',
    tooltip: 'tree view',
    callback: 'tree-view:toggle'
  })

  toolBar.addSpacer()

  toolBar.addButton({
    icon: 'folder',
    iconset: 'mdi',
    tooltip: 'add ebank project',
    callback: () => {
      atom.pickFolder(paths => {
        if (paths !== null) {
          paths.filter(isAppProject).forEach(project => {
            atom.project.addPath(project)
          })
        }
      })
    }
  })

  toolBar.addButton({
    icon: 'new-box',
    iconset: 'mdi',
    tooltip: 'quick start',
    callback: 'emp-frontend-devtool:toggle-create-project'
  })

  toolBar.addSpacer()

  addProjectName(toolBar)

  toolBar.addSpacer()

  action = toolBar.addButton({
    icon: 'play-circle-outline',
    iconset: 'mdi',
    tooltip: 'ebank',
    callback: () => {
      store.dispatch(toggleApp(project))
      toggleAction(project)
    }
  })
  action.setEnabled(false)
  $(action.element).addClass('action')

  // logger
  toolBar.addButton({
    icon: 'console',
    iconset: 'mdi',
    tooltip: 'log view',
    callback: 'emp-frontend-devtool:toggle-log'
  })

  // debugger
  toolBar.addButton({
    icon: 'bug',
    tooltip: 'debug view',
    callback: 'emp-frontend-devtool:show_lua_debug_panel'
  })

  refresh = toolBar.addButton({
    icon: 'refresh',
    iconset: 'mdi',
    tooltip: '推送当前页面到设备',
    callback: () => {
      let editor = atom.workspace.getActiveTextEditor()

      if (ar.isRenderableEditor(editor)) {
        let absolutePath = editor.getPath()
        log('refresh', absolutePath)
        absolutePath && loader.open(absolutePath)

        refresh = null
        _refresh.setEnabled(false)
        setTimeout(() => (refresh = _refresh), 1000)
      }
    }
  })
  _refresh = refresh
  refresh.setEnabled(false)

  // exec
  toolBar.addButton({
    icon: 'code-braces',
    iconset: 'mdi',
    tooltip: 'lua view',
    callback: 'emp-frontend-devtool:toggle-lua'
  })

  device = toolBar.addButton({
    icon: 'cellphone',
    iconset: 'mdi',
    tooltip: 'device view',
    callback: () => atom.workspace.open('efd://devices')
  })

  qr = toolBar.addButton({
    icon: 'qrcode',
    iconset: 'mdi',
    tooltip: '扫码连接',
    callback: 'emp-frontend-devtool:toggle-qr'
  })
  $(qr.element).addClass('disabled')

  toolBar.addSpacer()

  // setting
  toolBar.addButton({
    icon: 'settings',
    tooltip: '机关',
    callback: ''
  })

  expand = toolBar.addButton({
    icon: 'arrow-expand',
    iconset: 'mdi',
    tooltip: '再大点',
    callback: () => {
      bigger()
      isBiggest() && expand.setEnabled(false)
      compress.setEnabled(true)
      $(name.element).css('font-size', suitableSize())
    }
  })
  isBiggest() && expand.setEnabled(false)

  compress = toolBar.addButton({
    icon: 'arrow-compress',
    iconset: 'mdi',
    tooltip: '再小点',
    callback: () => {
      smaller()
      isSmallest() && compress.setEnabled(false)
      expand.setEnabled(true)
      $(name.element).css('font-size', suitableSize())
    }
  })
  isSmallest() && compress.setEnabled(false)

  toolBar.addSpacer()

  // report issue
  toolBar.addButton({
    icon: 'github-circle',
    iconset: 'mdi',
    tooltip: 'report issue',
    callback: () => {
      open('https://github.com/RYTong/emp-frontend-devtool/issues/new')
    }
  })

  state = toolBar.addButton({
    icon: 'heart',
    iconset: 'mdi',
    callback: () => open('http://localhost:6102/state')
  })
  $(state.element).addClass('disabled')

  toolBar.addSpacer()

  toolBar.addButton({
    icon: 'power',
    iconset: 'mdi',
    tooltip: '万能的重启',
    callback: 'window:reload'
  })

  toolBar.addButton({
    icon: 'television-guide',
    iconset: 'mdi',
    tooltip: 'video intro',
    callback: () => atom.workspace.open('efd://intro')
  })

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
    _updatePosition.call(toolBar, pos)
  }
}

const shake = (jnode, color) => {
  if (!jnode.hasClass('animated')) {
    let _color = jnode.css('color')

    jnode.css('color', color)
    jnode.animateCss('bounce', () => jnode.css('color', _color))
  }
}

const addProjectName = (toolBar) => {
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
  config('iconSize', sizes[sizes.indexOf(curSize()) + 1])
}

const smaller = () => {
  config('iconSize', sizes[sizes.indexOf(curSize()) - 1])
}
