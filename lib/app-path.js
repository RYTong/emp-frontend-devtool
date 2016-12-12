'use babel'

import { join, relative, extname, basename } from 'path'
import { COMMON_PATH, WWW_PATH } from './constants'

const absoluteToOffline = (abspath, project) => {
  let offline, relpath, wwwpath, commonpath

  wwwpath = join(project, WWW_PATH)

  if (!abspath.startsWith(wwwpath)) {
    return null
  }

  relpath = relative(wwwpath, abspath)

  if (relpath.includes('/')) {
    commonpath = join(project, COMMON_PATH)
    relpath = relative(commonpath, abspath)

    if (relpath.startsWith('channels')) {
      offline = relpath
    } else {
      offline = basename(relpath)
    }
  } else {
    offline = relpath
  }

  return offline
}

const offlineToAbsolute = (offline, project) => {
  let abspath

  if (offline.includes('/')) {
    abspath = join(project, COMMON_PATH, 'channels', offline)
  } else {
    switch (extname(offline)) {
      case '.lua':
        abspath = join(project, COMMON_PATH, 'lua', offline)
        break
      case '.css':
        abspath = join(project, COMMON_PATH, 'css', offline)
        break
      case '.xhtml':
        abspath = join(project, WWW_PATH, offline)
        break
      default:
        // FIXME:
        abspath = join(project, COMMON_PATH, 'images', offline)
    }
  }

  return abspath
}

export default {
  absoluteToOffline,
  offlineToAbsolute
}
