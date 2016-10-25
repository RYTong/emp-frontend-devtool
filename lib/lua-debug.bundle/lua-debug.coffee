{CompositeDisposable} = require 'atom'
LuaDebugView = require './lua-debug-view'
LuaEditor = require './lua-editor'
CodeRunner = require './code/code-runner'
CodeEventEmitter = require './event-emitter'
CodeView = require './code/code-view'
DebugSocket = require './net/debug-server'
BreakpointStore = require './breakpoint/breakpoint-store'

module.exports =

  config:
    defLuaDebugServerHost:
      type:'string'
      default:'default'

    defLuaDebugServerPort:
      type:'string'
      default:'8172'

    defLuaDebugServerTimeout:
      type:'integer'
      default:'14400000'

  luaDebugView:null
  codeEventEmitter:null
  oCodeRunner:null
  oDebugServer:null
  luaEditor:null
  oBreakpointStore:null

  activate:(state) ->
    @luaEditor = new LuaEditor()
    @oDebugServer = new DebugSocket()
    @codeView = new CodeView()
    @codeEventEmitter = new CodeEventEmitter(@codeView, @oDebugServer)
    @oCodeRunner = new CodeRunner(@codeEventEmitter)
    @luaDebugView = new LuaDebugView(state, @codeEventEmitter)
    @oBreakpointStore = new BreakpointStore(@codeEventEmitter)
    @luaEditor.init(@oBreakpointStore)

  deactivate: ->
    # subscriptions.dispose();
    # subscriptions = null
    @oBreakpointStore.dispose()
    @oDebugServer.dispose()
    @codeEventEmitter.dispose()
    @oCodeRunner.dispose()
    @luaDebugView.dispose()

  serialize: ->
    luaDebugView:@luaDebugView.serialize()
