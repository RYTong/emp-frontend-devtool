{CompositeDisposable, Emitter} = require 'atom'
{$, $$, View,TextEditorView} = require 'atom-space-pen-views'
BPEleView = require './bp-ele-view'
StepDetailView = require './lua-debug-step-view'
LuaDebugVarView = require './variable/lua-variable-view'
emp = require '../global/emp'
oServer = require './net/server'
socketEmitter = require '../socket-emitter'
socketEmit = socketEmitter.getEmit('lua-debugger')
_ = require 'underscore-plus'

module.exports = class LuaDebugView extends View
  modalPanel:null
  aBPMap:null
  sDefaultClient:"None"

  @content: ->
    @div class: 'lua-debug-view tool-panel',=>
      @div  class:'lua-debug-panel', =>
        @div outlet:'vLuaDebugFlow', class:'lua-debug-flow',  =>

          # @div outlet: 'vServerConfView', class: 'lua-debug-server-row',style:"display:node;", =>
          #   @div class: "server-con panel-body padded", =>
          #     @div class: "block conf-heading icon icon-gear", "Lua Debug Server"
          #   @div class: "server-con panel-body padded", =>
          #     @label class: "debug-label", "Host "
          #     @div class: 'controls', =>
          #       @div class: 'setting-editor-container', =>
          #         @subview 'vHostTextEditor', new TextEditorView(mini: true, attributes: {id: 'emp_host', type: 'string'}, placeholderText: 'Server Host')
          #     @label class: "debug-label", "Port "
          #     @div class: 'controls', =>
          #       @div class: 'setting-editor-container', =>
          #         @subview 'vPortTextEditor', new TextEditorView(mini: true, attributes: {id: 'emp_port', type: 'string'}, placeholderText: 'Server Port')
          #     @button class: 'btn btn-else btn-primary inline-block-tight ', click: 'start_server', "Start Server"

          # # server state inline
          @div outlet: 'vServerStateView', class: 'lua-debug-server-row', =>
          # @div outlet: 'vServerStateView', class: 'lua-debug-server-row', style:"display:inline;", =>
            @div class: "server-con panel-body padded", =>
              @div class: "block conf-heading icon icon-gear", "Lua Debugger"
          #
            @div class: "server-con panel-body padded",  =>
              @div outlet:'state_div',class: "state-div-content", =>
                @label class: "debug-label", "Server State: "
                @label outlet:'vClientState', class: "debug-label-content debug-label-off", "Off"
              @div outlet:'select_div', class: "state-div-content", style:"display:none", =>
                @select outlet: "client_info", class: "form-control", =>
                  @option outlet:'emp_default_client', value: "None","None"
          #     # @div class: 'controls', =>
          #     #   @div class: 'setting-editor-container', =>
          #     #     @subview 'vMsgEditor', new TextEditorView(mini: true, attributes: {id: 'msg', type: 'string'}, placeholderText: 'Send Msg')

          #     @button class: 'btn btn-else btn-error inline-block-tight', click: 'stop_server', "Stop Server"
            #   @button class: 'btn btn-else btn-info inline-block-tight', click: 'send_msg', "Send"
            # @div class: "server-con panel-body padded",  =>
            #   @button class: 'btn btn-else btn-primary inline-block-tight ', click: 'onStart', "Run Code In Atom"
            @div class: "server-con panel-body padded",  =>
              @div outlet:'tool_bar_div', class: "control-btn-group btn-group" , =>
                @button outlet:'btn_run', class: 'btn icon icon-playback-play btn-else', disabled:"disabled", title:"Run Until Next Breakpoint" ,click: 'send_run'
                @button outlet:'btn_over', class: 'btn mdi mdi-debug-step-over btn-else', title:"Step Over" , disabled:"disabled" ,click: 'send_over'
                @button outlet:'btn_step', class: 'btn mdi mdi-debug-step-into btn-else',  disabled:"disabled",title:"Step Into" ,click: 'send_step'
                @button outlet:'btn_out', class: 'btn mdi mdi-debug-step-out btn-else',  disabled:"disabled",title:"Step Out" ,click: 'send_out'
                @button outlet:'btn_done', class: 'btn icon icon-arrow-down btn-else',  disabled:"disabled",title:"Run Done" ,click: 'send_done'
                # @button outlet:'btn_test', class: 'btn mdi mdi-debug-step-into btn-else',  disabled:"disabled",title:"Step Into" ,click: 'te1'
                # @button outlet:'btn_out', class: 'btn mdi mdi-debug-step-out btn-else',  disabled:"disabled",title:"Step Out" ,click: 'te2'
                # @button outlet:'btn_done', class: 'btn icon icon-arrow-down btn-else',  disabled:"disabled",title:"Run Done" ,click: 'te3'


          # break points list
          @div outlet: 'vBPView', class: 'lua-debug-server-row', style:"display:inline;", =>

            @div class: "server-con panel-body padded", =>
              @div class: "block conf-heading icon icon-gear", "BreakPoints"

            @div class: "server-con panel-body padded",  =>
              # @div class: "state-div-content", =>
              #   @label outlet:"vServerState", class: "debug-label-content", "--"
              @div class:'control-ol', =>
                @table class:'control-tab',outlet:'bp_tree'

          # # local variable list
          # @div outlet: 'vVarView', class: 'lua-debug-server-row', style:"display:inline;", =>
          #   @div class: "server-con panel-body padded", =>
          #     @div class: "block conf-heading icon icon-gear", "Variables"
          #
          #   @div class: "server-con panel-body padded",  =>
          #     # @div class: "state-div-content", =>
          #     #   @label outlet:"vServerState", class: "debug-label-content", "--"
          #     @div class:'control-ol', =>
          #       @table class:'control-tab',outlet:'glv_tree'

  initialize:(serializeState, @codeEventEmitter) ->
    @aBPMap = {}
    @vClientMap = {}
    @emitter = new Emitter
    # @oDebugServer = new DebugSocket()
    @disposable = new CompositeDisposable
    # @codeView = new CodeView()

    @stepDetailView = new StepDetailView(@codeEventEmitter)
    @codeEventEmitter.doManaEmit(@, @stepDetailView)
    @vBPView.before(@stepDetailView)
    @luaDebugVarView = new LuaDebugVarView(emp.LOCAL_VAR_VIEW_NAME)
    @luaDebugUPVarView = new LuaDebugVarView(emp.UP_VAR_VIEW_NAME)
    @luaDebugGloVarView = new LuaDebugVarView(emp.GLOBAL_VAR_VIEW_NAME )

    # console.log @luaDebugVarView

    @disposable.add atom.commands.add "atom-workspace","emp-frontend-devtool:show_lua_debug_panel", => @toggle_show()
    # @disposable.add @luaDebugVarView,@luaDebugUPVarView, @luaDebugGloVarView
    # @disposable.add @oDebugServer

    @vLuaDebugFlow.append @luaDebugVarView
    @vLuaDebugFlow.append @luaDebugUPVarView
    @vLuaDebugFlow.append @luaDebugGloVarView
    @sSelectClient = null
    @client_info.change =>
      @sSelectClient = @client_info.val()
      # console.log @sSelectClient
      @setSelectClient(@sSelectClient)
      # @empty_variable()
    # initial the handler
    @handler()
    # @sServerHost = atom.config.get(emp.LUA_SERVER_HOST)
    # @sServerPort = atom.config.get(emp.LUA_SERVER_PORT)
    # @vHostTextEditor.setText @sServerHost
    # @vPortTextEditor.setText @sServerPort

    # initial listening
    # @vHostTextEditor.getModel().onDidStopChanging =>
    #   sNewServerHost = @vHostTextEditor.getText().trim()
    #   atom.config.set(emp.LUA_SERVER_HOST, sNewServerHost)
    #
    # @vPortTextEditor.getModel().onDidStopChanging =>
    #   sNewServerPort = @vPortTextEditor.getText().trim()
    #   atom.config.set(emp.LUA_SERVER_PORT, sNewServerPort)


  handler:() ->
    socketEmit 'set-peer-resolve-handler', (peer, peers) =>
      console.log "set-peer-resolve-handler:", peer, peers
      @set_options(peer, peers[peer])
    socketEmit 'set-peer-connect-handler', (peer, peers) =>

      console.log "set-peer-connect-handler:", peer, peers
      #
      if _.size(@vClientMap) is 0
        # 如果为第一个 id 则设为默认的选中
        @sSelectClient = peer
        @add_option peer, true
        @setSelectClient(peer)
      else
        @add_option peer
      @select_div.show()
      @state_div.hide()

      # if _.size(peers) is 1

    socketEmit 'set-peer-disconnect-handler', (peer, peers) =>
      console.log "set-peer-disconnect-handler:", peer, peers
      # console.log peer
      # console.log @sSelectClient
      if peer is @sSelectClient
        @sSelectClient = @sDefaultClient
        @emp_default_client.attr('selected', true)
        @setSelectClient(@sDefaultClient, true)
      @remove_option(peer, peers)
      if _.size(peers) is 0
        @select_div.hide()
        @state_div.show()

  set_options: (peer, oDetail) ->
    # @sSelectClient = @client_info.val()
    # @client_info.empty()
    # console.log peer, oDetail
    vView = @vClientMap[peer]

    sNewName = oDetail?.token + " (#{oDetail?.deviceInfo})"
    vView?.text(sNewName)

  add_option:(peer, bIsSel=false) ->
    console.log peer
    if bIsSel
      vOption = @new_select_option(peer)
    else
      vOption = @new_option(peer)

    @vClientMap[peer] = vOption
    @client_info.append(vOption)


  remove_option:(peer, peers) ->
    @vClientMap[peer]?.remove()
    delete @vClientMap[peer]


  resetClientMap:() ->
    for sKey, vView of @vClientMap
      vView.remove()
    @vClientMap = {}

  new_option: (name, value=name)->
    $$ ->
      @option value: value, name

  new_select_option: (name, value=name) ->
    $$ ->
      @option selected:'select', value: value, name

  toggle_show:() ->
    unless @modalPanel
      @modalPanel = atom.workspace.addRightPanel(item:this,visible:true)
      return

    if @modalPanel.isVisible()
      @modalPanel.hide()
    else
      @modalPanel.show()


  # Returns an object that can be retrieved when package is activated
  serialize: ->
    # @vLuaDebugFlow.append @luaDebugVarView


  # Tear down any state and detach
  destroy: ->
    @dispose()

  dispose:()->
    @aBPMap = {}
    @modalPanel?.destroy()
    @disposable?.dispose()

  # hanle click callback
  # start_server: (event, element) =>
  #
  #   sNewServerHost = @sServerHost unless sNewServerHost = @vHostTextEditor.getText().trim()
  #   sNewServerPort = @sServerPort unless sNewServerPort = @vPortTextEditor.getText().trim()
  #   console.log sNewServerHost,sNewServerPort
  #   @emitter.emit 'start_server', {host:sNewServerHost, port:sNewServerPort}
    #
    # @oDebugServer.start(sNewServerHost,sNewServerPort, @show_state_panel, @show_server_panel)
    # @show_state_panel()

  send_msg:(event, element) ->
    sMsg = @vMsgEditor.getText()
    console.log sMsg
    if sMsg
      @emitter.emit 'send_msg', sMsg

  # stop_server:(event, element) ->
  #   @emitter.emit 'stop_server'

    # @oDebugServer.close()
    # @show_server_panel()

  # some callback
  hide_bar_panel:() =>
    # @tool_bar_div.disable()
    @disable_control_together()
    @state_div.show()
    @select_div.hide()
    @show_client_state_off()
    @resetClientMap()
    # @vServerConfView.show()
    # @vServerStateView.hide()

  show_bar_panel:() =>
    # @tool_bar_div.enable()
    # @btn_run.enable()
    # @btn_over.enable()
    # @btn_step.enable()
    # @btn_out.enable()
    # @btn_done.enable()

    # @select_div.show()
    # @state_div.hide()

    # @vServerState["context"].innerHTML = "On"

    # @vServerConfView.hide()
    # @vServerStateView.show()
    @show_client_state_on()

  show_client_state_on:() =>
    @vClientState["context"].innerHTML = "Waitting"
    @vClientState.removeClass('debug-label-off')
    @vClientState.addClass('debug-label-waite')
    # console.log @vClientState
    # @vClientState.css('color', @client_off)
  #
  show_client_state_off:() =>
    @vClientState["context"].innerHTML = "Off"
    @vClientState.addClass('debug-label-off')
    @vClientState.removeClass('debug-label-waite')

  # 客户端发送断点阻塞时, 联动
  refresh_variable:(fFileName, sVariable, sLine) =>
    # 启用调试按键
    @en_btns()
    @stepDetailView.refresh_state(fFileName, sLine)
    # console.log "show variable:+++++++", fFileName, sVariable
    if typeof(sVariable) is 'string'
      oRe = JSON.parse(sVariable)
    else
      oRe = sVariable
    @luaDebugVarView.refresh_variable(fFileName, oRe.locVal)
    @luaDebugUPVarView.refresh_variable(fFileName, oRe.upVal)
    @luaDebugGloVarView.refresh_variable(fFileName, oRe.G)

  refresh_gl_variable:(sVariable) ->
    if typeof(sVariable) is 'string'
      oRe = JSON.parse(sVariable)
    else
      oRe = sVariable
    @luaDebugGloVarView.refresh_variable(null, oRe)

  dis_btns:() ->
    @btn_run.disable()
    @btn_over.disable()
    @btn_step.disable()
    @btn_out.disable()
    @btn_done.disable()

  en_btns:() ->
    @btn_run.enable()
    @btn_over.enable()
    @btn_step.enable()
    @btn_out.enable()
    @btn_done.enable()

  empty_variable:() =>
    @luaDebugVarView.empty_variable()
    @luaDebugUPVarView.empty_variable()
    @luaDebugGloVarView.empty_variable()

  setSelectClient:(sKey, bIsDel=false) =>
    @disable_control_together()
    # 选择 client 后清空变量
    @empty_variable()
    @emitter.emit 'set-select-client', {msg:sKey, isDel:bIsDel}

  #
  disable_control_together:() ->
    # 禁用调试按键
    @dis_btns()
    @stepDetailView.set_empty()

  addBPCB:(bp) ->
    # console.log bp
    vBPEleView = new BPEleView(@delBPEvnent, bp, @stepDetailView)
    @aBPMap[bp.sID] = vBPEleView
    @bp_tree.append vBPEleView

  delBPCB:(bp) ->
    if vBPEleView = @aBPMap[bp.sID]
      vBPEleView.destroy()

  # event emit

  delBPEvnent:(bp) =>
    @emitter.emit 'del_bp', bp

  # run_code:() =>
  #   @emitter.emit 'start'
  #
  # stop_run:() =>
  #   @emitter.emit 'stop'

  # send msg to socket
  # runs until next breakpoint
  send_run:() =>
    console.log "send run"
    @disable_control_together()
    @emitter.emit 'send_run'

  # runs until next line, stepping over function calls
  send_over:() =>
    @emitter.emit 'send_over'

  # runs until next line, stepping into function calls
  send_step:() =>
    @emitter.emit 'send_step'
    # @oDebugServer.send(emp.LUA_MSG_STEP)

  # runs until line after returning from current function
  send_out:() =>
    @emitter.emit 'send_out'
    # @oDebugServer.send(emp.LUA_MSG_OVER)

  send_done:() =>
    @disable_control_together()
    @emitter.emit 'send_done'
    # @oDebugServer.send(emp.LUA_MSG_DONE)

  onSendMsg:(callback)->
    @emitter.on 'send_msg', callback


  onSendRun:(callback)->
    @emitter.on 'send_run', callback
  onSendOver:(callback)->
    @emitter.on 'send_over', callback
  onSendStep:(callback)->
    @emitter.on 'send_step', callback
  onSendOut:(callback)->
    @emitter.on 'send_out', callback
  onSendDone:(callback)->
    @emitter.on 'send_done', callback

  # -------

  # onLogStdOut: (callback) ->
  #   @oCodeRunner.onLogStdOut callback
  #
  # onLogStdErr: (callback) ->
  #   @oCodeRunner.onLogStdErr callback
  #
  # onLogExit: (callback) ->
  #   @oCodeRunner.onLogExit callback
  #
  # onDidNotRun: (callback) ->
  #   @oCodeRunner.onDidNotRun callback

  # onStartServer:(callback) ->
  #   @emitter.on 'start_server', callback
  #
  # onStopServer:(callback) ->
  #   @emitter.on 'stop_server', callback

  # onStart: (callback) ->
  #   @emitter.on 'start', callback
  #
  # onStop: (callback) ->
  #   @emitter.on 'stop', callback

  onDelBPEvnent:(callback) ->
    @emitter.on 'del_bp', callback

  onSetSelectClient:(callback) ->
    @emitter.on 'set-select-client', callback
