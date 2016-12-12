'use babel'

import { check, getLinter } from './lua-syntax-checker'

export default {
  activate (state) {
  },

  onFileVisibleInTree (file) {
    check(file)
  },

  getLinter
}
