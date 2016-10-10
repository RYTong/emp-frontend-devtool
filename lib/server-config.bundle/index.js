'use babel';

import EventEmitter from 'events';
import React from 'react';
import ReactDOM from 'react-dom';

import render from '../react-render';
import ConfigStatusBar from './config-status-bar.react';
import ConfigView from './config-view.react';
import config, { update as updateConfig } from './config';

let log = require('../log-prefix')('[server-config]');

export default {

  activate(state) {
    updateConfig(state.config);
  },

  serialize() {
    return ['config', config];
  },

  consumeStatusBar(statusBar) {
    let configPanel = atom.workspace.addModalPanel({
     item: render(ConfigView),
     visible: false
    });

    statusBar.addRightTile({
      item: render(ConfigStatusBar,
                   {click: () => { configPanel.show() }},
                   'inline-block'),
      priority: 1001
    });
  }
}