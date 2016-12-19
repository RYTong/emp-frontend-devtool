'use babel';

import { CompositeDisposable } from 'atom';

import LuaDebugView from './lua-debug-view';
import LuaEditor from './lua-editor';
// import CodeRunner from './code/code-runner';
import CodeEventEmitter from './event-emitter';
// import CodeView from './code/code-view';
// import DebugSocket from './net/debug-server';
import BreakpointStore from './breakpoint/breakpoint-store';
import _ from 'underscore-plus'

let emp = require('./global/emp')


var subscriptions, luaDebugView, codeEventEmitter,
    luaEditor, oBreakpointStore;

export default {
  config: {
    defLuaDebugServerHost: {
      key:emp.LUA_SERVER_HOST,
      type: 'string',
      "default": 'default'
    },
    defLuaDebugServerPort: {
      key:emp.LUA_SERVER_PORT,
      type: 'string',
      "default": '8172'
    },
    defLuaDebugServerTimeout: {
      key:emp.LUA_SERVER_TIMEOUT,
      type: 'integer',
      "default": '14400000'
    }
  },

  activate(state) {
    this.setconfig()
    luaEditor = new LuaEditor();
    // oDebugServer = new DebugSocket();
    // codeView = new CodeView();
    codeEventEmitter = new CodeEventEmitter();
    // oCodeRunner = new CodeRunner(codeEventEmitter);
    luaDebugView = new LuaDebugView(state, codeEventEmitter);
    oBreakpointStore = new BreakpointStore(codeEventEmitter);
    luaEditor.init(oBreakpointStore);
  },

  deactivate() {
    // this.modalPanel.destroy();
    // oBreakpointStore.dispose();
    // oDebugServer.dispose();
    codeEventEmitter.dispose();
    // oCodeRunner.dispose();
    luaDebugView.dispose();
  },

  serialize() {
    return {luaDebugView:luaDebugView.serialize()
      // luaDebugViewState: luaDebugView.serialize()
    };
  },

  setconfig(){
    _.mapObject(this.config, function (key, val) {
      atom.config.set(val.key, val.default, {type:val.type})
      return val;
    });

  }

}
