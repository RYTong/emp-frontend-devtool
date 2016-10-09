'use babel';

import EventEmitter from 'events';
import React from 'react';
import ReactDOM from 'react-dom';

import render from '../react-render';
import server from './server';
import LogStatusBar from './log-status-bar.react';
import LogView from './log-view.react';
import emitter from './log-emitter'

let log = require('../log-prefix')('[client-log]');

export default {
  activate(state) {
    server.init();
    // server.start();
  },

  deactivate() {
    server.stop();
  },

  consumeStatusBar(statusBar) {
    let logViewPanel = atom.workspace.addBottomPanel({
      item: render(LogView),
      visible: false
    });

    let toggleLogViewPanel = () => {
      if (logViewPanel.isVisible()) {
        logViewPanel.hide();
      } else {
        emitter.emit('panel-show');
        logViewPanel.show();
      }
    };

    emitter.on('panel-hide', () => {
      logViewPanel.hide();
    });

    statusBar.addRightTile({
      item: render(LogStatusBar,
                  {toggle: toggleLogViewPanel},
                  'inline-block'),
      priority: 1000
    });
  }
}
