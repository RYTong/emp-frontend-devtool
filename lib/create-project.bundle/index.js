'use babel'

import { add } from '../command'
import { toggle } from './create-project-panel'

export default {
  activate (state) {
    add({ 'toggle-create-project': toggle })
  }
}
