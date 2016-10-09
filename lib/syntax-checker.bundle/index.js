'use babel';

import path from 'path';

import editors from './lua-editors';
import { check, checkWithSource } from './lua-syntax-checker';

export default {
  activate(state) {
    atom.workspace.observeTextEditors((editor) => {
      let file = editor.getPath();

      if (path.extname(file) === '.lua') {
        editors[file] = editor;

        editor.onDidDestroy(() => {
          delete editors[file];
        });

        editor.onDidStopChanging(() => {
          checkWithSource(file, editor.getText());
        });
      }
    });
  },

  onFileVisibleInTree(file) {
    check(file);
  },

  deactivate() {
    //TODO
  },

  serialize() {

  }
}
