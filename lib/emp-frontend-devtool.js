'use babel';

import { CompositeDisposable } from 'atom';
import * as lschecker from './lua-syntax-checker';
import path from 'path';
import fs from 'fs';
import sh from 'shelljs';
import editors from './lua-editors';
import $ from 'jquery';
import lp from './luapack';
import lplh from './luapack-log-handler';
import luaOutputHandler from './lua-output-handler';
import * as luaClientLogListener from './luaclient-log-listener';
import clientLog from './luaclient-log-server';
import { MPV, PMV} from 'atom-message-panel';

export default {

  empFrontendDevtoolView: null,
  modalPanel: null,
  subscriptions: null,
  luaPack: null,
  clientLogTile: null,


  activate(state) {
    this.subscriptions = new CompositeDisposable();
    this.initLuaFile();
    this.initLuaPack();
    this.observeLuaEditors();
  },

  deactivate() {
    this.subscriptions.dispose();
    lp.stop(this.luaPack);
  },

  serialize() {
    // return {
    //   empFrontendDevtoolViewState: this.empFrontendDevtoolView.serialize()
    // };
  },

  initLuaFile() {
    let luaTempFile = path.join(__dirname, 'luapack-temp-bundle.lua');
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'emp-frontend-devtool:run-lua': (event) => {
        let luaFile = $(event.target).attr('data-path');

        if (!luaFile) {
          let editor = atom.workspace.getActiveTextEditor();
          if (editor && editor.getGrammar().name === 'Lua') {
            luaFile = editor.getPath();
          } else {
            return;
          }
        }

        if (!sh.which('lua')) {
          atom.notifications.addError('command not found: lua');
          return
        }

        lp.start({ entry: luaFile, build: luaTempFile});
        sh.exec(`lua ${luaTempFile}`, luaOutputHandler);
      }
    }));
  },

  initLuaPack() {
    let that = this;

    this.subscriptions.add(atom.contextMenu.add({
      "li[is='tree-view-file'] [data-name='luapack.json']": [
        {
          created() {
            if (that.luaPack) {
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

          this.luaPack = lp.start(options, lplh);
          // messages.panel.show();

          if (!options.watch) {
            $('.tree-view').find(`[data-path$="luapack.json"]`)
              .addClass('luapack-running-once-filename');
            setTimeout(() => {
              let target = document.querySelector('atom-workspace');
              let command = 'emp-frontend-devtool:stop-luapack';
              atom.commands.dispatch(target, command);
            }, 2000);
          } else {
            $('.tree-view').find(`[data-path$="luapack.json"]`)
              .addClass('luapack-running-filename');
          }
        } catch (e) {
          lplh.destroy();
          atom.notifications.addError(e.message || e);
        }
      },
      'emp-frontend-devtool:stop-luapack': () => {
        $('.tree-view').find(`[data-path$="luapack.json"]`)
          .removeClass('luapack-running-once-filename')
        $('.tree-view').find(`[data-path$="luapack.json"]`)
          .removeClass('luapack-running-filename')
        lp.stop(this.luaPack);
        this.luaPack = null;
        lplh.destroy();
      }
    }));
  },

  observeLuaEditors() {
    atom.workspace.observeTextEditors((editor) => {
      let file = editor.getPath();

      if (path.extname(file) === '.lua') {
        editors[file] = editor;

        // editor.onDidChangePath((newpath) => {
        //   let oldpath;
        //   for (let p in editors) {
        //     if (editors[p] === editor) {
        //       oldpath = p;
        //       break;
        //     }
        //   }
        //   delete editors[oldpath];
        //
        //   if (path.extname(newpath) === '.lua') {
        //     editors[newpath] = editor;
        //   }
        // });

        editor.onDidDestroy(() => {
          delete editors[file];
        });

        editor.onDidStopChanging(() => {
          lschecker.checkWithSource(file, editor.getText());
        });
      }
    });
  },

  getFileIconsProvider() {
    let that = this;
    let provider = {
      iconClassForPath(file) {
        lschecker.check(file);
        if (path.basename(file) === 'luapack.json') {
          process.nextTick(() => {
            if (that.luaPack) {
              $('.tree-view').find(`[data-path="${file}"]`)
                .addClass('luapack-running-filename')
            } else {
              $('.tree-view').find(`[data-path="${file}"]`)
                .removeClass('luapack-running-filename')
            }
          });
        }
        return 'icon-file-text'
      },
      onWillDeactivate() {}
    }

    return provider;
  },

  consumeStatusBar(statusBar) {
    let indicator = $('<div/>').html(`
      <div class="inline-block">
        <div id="status-bar-client-log">
          CLIENTLOG
        </div>
      </div>
      `).contents()[1];

    this.clientLogTile = statusBar.addRightTile({
      item: indicator,
      priority: 1000
    });

    let clientLogItem = $('<div/>').html(`
      <atom-panel class="inset-panel">
        <div class="panel-heading client-log-config">
          <label class='input-label'>
            <input class='input-checkbox lua' type='checkbox' checked>Lua
          </label>
          <label class='input-label client'>
            <input class='input-checkbox' type='checkbox'>Client
          </label>
          <label class='input-label'>OFF
            <input class='input-toggle record' type='checkbox' checked>ON
          </label>
          <button class='btn icon icon-trashcan clear'>Clear</button>
          <button class='btn icon icon-x close'>Close</button>
        </div>
        <div class="panel-body padded client-log-pane">
          <pre class="lua"></pre>
          <pre class="client"></pre>
        </div>
      </atom-panel>
      `).contents()[1];

    let clientLogPanel = atom.workspace.addBottomPanel({
      item: clientLogItem,
      visible: false
    });

    $('.client-log-pane .client').css('display', 'none');
    $('.client-log-config .lua').click((e) => {
      $('.client-log-pane .lua').toggle();
    });
    $('.client-log-config .client').click((e) => {
      $('.client-log-pane .client').toggle();
    });
    $('.client-log-config .record').click((e) => {
      luaClientLogListener.config(e.target.checked);
    });
    $('.client-log-config .clear').click((e) => {
      $('.client-log-pane pre').html('');
    });
    $('.client-log-config .close').click((e) => {
      clientLog.stop(() => {
        clientLogPanel.hide();
      });
    });

    indicator = $('#status-bar-client-log');

    $('.client-log-pane').height(170).css('overflow', 'scroll');
    indicator.click(() => {
      if (clientLog.isRunning()) {
        if (clientLogPanel.isVisible()) {
          clientLogPanel.hide();
        } else {
          clientLogPanel.show();
        }
      } else {
        clientLog.start();
      }
    });
    luaClientLogListener.setIndicator(indicator, $('.client-log-pane'));
    clientLog.setHandler(luaClientLogListener);
  }

};
