'use babel'

import { join } from 'path'

const videopath = join(__dirname, 'video')

const slides = [
  {
    key: 'new-app',
    tag: '启动',
    tagClass: 'mdi mdi-server badge badge-success',
    title: '创建一个示例工程并启动',
    video: join(videopath, 'new-app.mp4')
  },
  {
    key: 'open-app',
    tag: '启动',
    tagClass: 'mdi mdi-server badge badge-success',
    title: '打开已存在的工程并启动',
    video: join(videopath, 'open-app.mp4')
  },
  {
    key: 'start-iphone-simulator',
    tag: '连接',
    tagClass: 'mdi mdi-cellphone badge badge-info',
    title: '启动 iPhone 模拟器并自动连接',
    video: join(videopath, 'iphone-simulator-start.mp4'),
    note: '菜单触发: ctrl + cmd + z'
  },
  {
    key: 'start-android-simulator',
    tag: '连接',
    tagClass: 'mdi mdi-cellphone badge badge-info',
    title: '启动 Android 模拟器并自动连接',
    video: join(videopath, 'android-simulator-start.mp4'),
    note: '菜单触发: ctrl + m / cmd + m'
  },
  {
    key: 'start-client',
    tag: '连接',
    tagClass: 'mdi mdi-cellphone badge badge-info',
    title: '启动真机并自动连接',
    video: join(videopath, 'iphone-start.mp4'),
    note: '菜单触发: 摇一摇'
  },
  {
    key: 'auto-connect',
    tag: '管理',
    tagClass: 'mdi mdi-cellphone badge badge-warning',
    title: '设备查看',
    video: join(videopath, 'auto-connect.mp4'),
    note: '支持多设备连接、掉线自动连接'
  },
  {
    key: 'hot-load',
    tag: '开发',
    tagClass: 'mdi mdi-code-tags badge badge-error',
    title: '代码编辑，实时生效',
    video: join(videopath, 'hot-load.mp4'),
    note: '按下 cmd / win 提示可跳转的链接后，点击前往'
  },
  {
    key: 'play-lua',
    tag: '开发',
    tagClass: 'mdi mdi-code-tags badge badge-error',
    title: 'Lua 脚本及日志输出',
    video: join(videopath, 'play-lua.mp4'),
    note: '日志窗口点击脚本链接前往'
  }
]

export default slides
