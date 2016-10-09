'use babel';

import { CompositeDisposable } from 'atom';
import $ from 'jquery';
import fs from 'fs';
import path from 'path';
import EventEmitter from 'events';
import lp from '../luapack';
import lplh from './luapack-log-handler';
import render from '../react-render';
import LuaPackStatusBar from './luapack-status-bar.react';

export default {
  subscriptions: new CompositeDisposable(),
  emitter: new EventEmitter(),
  handlers: {},

  activate(state) {
    let that = this;

    this.subscriptions.add(atom.contextMenu.add({
      "li[is='tree-view-file'] [data-name='luapack.json']": [
        {
          created(event) {
            let optionsFile = $(event.target).attr('data-path');

            if (that.handlers[optionsFile]) {
              this.label = "Stop LuaPack";
              this.command = "emp-frontend-devtool:stop-luapack";
            } else {
              this.label = "Start LuaPack";
              this.command = "emp-frontend-devtool:start-luapack";
            }
          }
        },
        { type: "separator" }
      ]
    }));

    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'emp-frontend-devtool:start-luapack': (event) => {
        let optionsFile = $(event.target).attr('data-path');

        try {
          let options = JSON.parse(fs.readFileSync(optionsFile, 'utf8'));
          let dirname = path.dirname(optionsFile);
          let messages = lplh.instance;

          options.entry = path.resolve(dirname, options.entry);
          if (options.build) {
            options.build = path.resolve(dirname, options.build);
          }

          this.handlers[optionsFile] = lp.start(options, lplh);
          // messages.panel.show();

          if (!options.watch) {
            let _target = $('.tree-view').find(`[data-path="${optionsFile}"]`);

            _target.addClass('luapack-running-once-filename');
            setTimeout(() => {
              let target = document.querySelector('atom-workspace');
              let command = 'emp-frontend-devtool:stop-luapack';
              atom.commands.dispatch(_target.get(0), command);
            }, 2000);
          } else {
            $('.tree-view').find(`[data-path="${optionsFile}"]`)
              .addClass('luapack-running-filename');
          }
        } catch (e) {
          lp.stop(this.handlers[optionsFile]);
          delete this.handlers[optionsFile];
          atom.notifications.addError(e.message || e);
        } finally {
          this.emit();
        }
      },
      'emp-frontend-devtool:stop-luapack': (event) => {
        let optionsFile = $(event.target).attr('data-path');

        $('.tree-view')
          .find(`[data-path="${optionsFile}"]`)
          .removeClass('luapack-running-once-filename')
        $('.tree-view').find(`[data-path$="${optionsFile}"]`)
          .removeClass('luapack-running-filename')

        lp.stop(this.handlers[optionsFile]);
        delete this.handlers[optionsFile];

        this.emit();
      }
    }));
  },

  deactivate() {
    this.subscriptions.dispose();
  },

  consumeStatusBar(statusBar) {
    statusBar.addRightTile({
      item: render(LuaPackStatusBar,
                  {emitter: this.emitter},
                  'inline-block'),
      priority: 1000
    });
  },

  onFileVisibleInTree(file) {
    if (path.basename(file) === 'luapack.json') {
      process.nextTick(() => {
        if (this.handlers[file]) {
          $('.tree-view').find(`[data-path="${file}"]`)
            .addClass('luapack-running-filename')
        } else {
          $('.tree-view').find(`[data-path="${file}"]`)
            .removeClass('luapack-running-filename')
        }
      });
    }
  },

  emit() {
    this.emitter.emit('change', Object.keys(this.handlers).length);
  }
}
