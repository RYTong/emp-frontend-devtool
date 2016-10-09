'use babel';

import path from 'path';
import server from './server';
import config, { update as updateConfig } from '../server-config.bundle/config';

export default {
  activate(state) {
    updateConfig(state.config);
    server.init();
    // server.start();

    atom.workspace.observeTextEditors((editor) => {
      let filepath = editor.getPath();
      let project = state.config.simulator.project;
      let wwwpath = path.join(project, 'public/www');

      if (project && filepath.startsWith(wwwpath)) {
        editor.onDidSave(() => {
          server.notify(path.basename(filepath));
        });
      }
    });
  },

  deactivate() {
    server.stop();
  }
}
