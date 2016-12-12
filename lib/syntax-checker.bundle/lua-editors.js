'use babel'

let editors = {}

export default {
  set (path, editor) {
    editors[path] = editor
  },

  get (path) {
    return editors[path]
  }
}
