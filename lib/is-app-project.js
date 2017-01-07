'use babel'

import { existsSync, readdirSync } from 'fs'

export default function (project) {
  let isAppProject = false

  if (existsSync(project)) {
    if (readdirSync(project).some(x => x.endsWith('.app'))) {
      isAppProject = true
    }
  }

  return isAppProject
}
