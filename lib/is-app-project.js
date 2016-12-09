'use babel'

import fs from 'fs'

export default function(project) {
  return fs.readdirSync(project).some(x => x.endsWith('.app'));
}
