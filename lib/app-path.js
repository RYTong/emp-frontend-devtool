'use babel'

import { existsSync } from 'fs'
import { join, relative, extname, basename, sep } from 'path'
import { WWW_PATH, COMMON_PATH_V5, COMMON_PATH_V4,
  OFFLINE_VERSION_V4 as V4, OFFLINE_VERSION_V5 as V5
} from './constants'

let pathMap = {}

const setFilePath = (name, filepath) => (pathMap[name] = filepath)

const getFilePath = name => pathMap[name]

const absoluteToOffline = (abspath, project) => {
  let relpath, wwwpath, commonpath, ext, version

  version = detectOfflineVersion(project)
  ext = extname(abspath)
  wwwpath = join(project, WWW_PATH)

  if (!abspath.startsWith(wwwpath)) {
    return abspath
  }

  relpath = relative(wwwpath, abspath)

  if (relpath.includes('/')) {
    commonpath = resolveCommonPath(project, version)
    relpath = relative(commonpath, abspath)

    if (isGlobalFile(relpath)) {
      return basename(relpath)
    } else { // channel files
      if (version === V4 && (ext === '.lua' || ext === '.css')) {
        return relative('channels', relpath)
      }
    }
  }

  return relpath
}

const offlineToAbsolute = (offline, project) => {
  let abspath, commonpath, version

  version = detectOfflineVersion(project)
  commonpath = resolveCommonPath(project, version)

  if (offline.startsWith('channels/')) {
    if (version === V4) {
      abspath = join(commonpath, offline)
    } else {
      abspath = join(commonpath, relative('channels', offline))
    }
  } else {
    if (version === V5) {
        if (extname(offline) === '.xhtml') {
            abspath = join(project, WWW_PATH, offline)
        } else {
            abspath = join(commonpath, offline)
        }
    } else {
        switch (extname(offline)) {
          case '.lua':
            abspath = join(commonpath, 'lua', offline)
            break
          case '.css':
            abspath = join(commonpath, 'css', offline)
            break
          case '.xhtml':
            abspath = join(project, WWW_PATH, offline)
            break
          case '.json':
            abspath = join(commonpath, 'json', offline)
            break
          default:
            // FIXME:
            abspath = join(commonpath, 'images', offline)
        }
    }
  }

  return abspath
}

const resolveCommonPath = (project, version) => {
  version = version || detectOfflineVersion(project)
  if (version === V4) {
    return join(project, COMMON_PATH_V4)
  } else if (version === V5) {
    return join(project, COMMON_PATH_V5)
  } else {
    throw new Error('unknown offline version')
  }
}

const isGlobalFile = (filepath) => {
  let dirs = ['css', 'images', 'json', 'lua']

  return dirs.includes(filepath.split(sep)[0])
}

const detectOfflineVersion = proj => {
  if (existsSync(join(proj, COMMON_PATH_V5))) {
    return V5
  } else if (existsSync(join(proj, COMMON_PATH_V4))) {
    return V4
  } else {
    return null
  }
}

export default {
  setFilePath,
  getFilePath,
  absoluteToOffline,
  offlineToAbsolute,
  detectOfflineVersion,
  resolveCommonPath
}
