'use babel';

import { CompositeDisposable } from 'atom';

import LuaDebugView from './lua-debug-view';
import LuaEditor from './lua-editor';
import CodeRunner from './code/code-runner';
import CodeEventEmitter from './event-emitter';
import CodeView from './code/code-view';
import DebugSocket from './net/debug-server';
import BreakpointStore from './breakpoint/breakpoint-store';


var subscriptions, luaDebugView, codeEventEmitter,
    oCodeRunner, oDebugServer, luaEditor, oBreakpointStore;

export let config = {
    defLuaDebugServerHost: {
      type: 'string',
      "default": 'default'
    },
    defLuaDebugServerPort: {
      type: 'string',
      "default": '8172'
    },
    defLuaDebugServerTimeout: {
      type: 'integer',
      "default": '14400000'
    }
  };

export default {

  activate(state) {
    console.log("lua dbeug activate --------++++++");
    luaEditor = new LuaEditor();
    oDebugServer = new DebugSocket();
    codeView = new CodeView();
    codeEventEmitter = new CodeEventEmitter(codeView, oDebugServer);
    oCodeRunner = new CodeRunner(codeEventEmitter);
    luaDebugView = new LuaDebugView(state, codeEventEmitter);
    oBreakpointStore = new BreakpointStore(codeEventEmitter);
    luaEditor.init(oBreakpointStore);
  },

  deactivate() {
    // this.modalPanel.destroy();
    oBreakpointStore.dispose();
    oDebugServer.dispose();
    codeEventEmitter.dispose();
    oCodeRunner.dispose();
    luaDebugView.dispose();
  },

  serialize() {
    return {luaDebugView:luaDebugView.serialize()
      // luaDebugViewState: luaDebugView.serialize()
    };
  }

}
