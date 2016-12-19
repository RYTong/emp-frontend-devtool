{CompositeDisposable, Emitter} = require 'atom'

net = require('net');
_ = require('underscore-plus')
emp = require '../global/emp'
detect = require 'detect-port'

DEFAULT_PORT = '8172'
DEFAULT_TIMEOUT = 14400000
MSG_END_FLAG = "#luaDebugEndflag#"
MSG_START_FLAG = "#luaDebugStartflag#"

su = require '../../server-util'
store = require('../../store')
log = require('../../log-prefix')('[lua-debug.server]')
{startService, stopService} = require '../../actions'
# unless emitter
emitter = new Emitter()

_oServer = null
_aSocketArr = {}
# _bServerState = false

initial = (oSocket) ->
  log("initial")
  iPort = oSocket.remotePort
  sRemoteAddress = oSocket.remoteAddress
  log("New Client connect:#{sRemoteAddress}:#{iPort}")
  sBuffer = ''
  oSocket.on 'data', (sData)=>
    sData = String(sData)
    tailFlag = 0  #字符串结尾再减一
    tailChar = sData.substr -1, 1 # 取得data最后一个字符
    if tailChar == '\0'
      tailFlag = 1
    if sData.indexOf(MSG_START_FLAG) == 0
      if (sData.lastIndexOf(MSG_END_FLAG) == sData.length - MSG_END_FLAG.length - tailFlag)
        do_preprocess(sData)
        sBuffer=''
      else
        sBuffer=sBuffer+sData
    else
      if sData.indexOf(MSG_END_FLAG) > -1
        aSplitRe = sData.split MSG_END_FLAG
        iSpliteReLen = aSplitRe.length
        switch iSpliteReLen
          when 1
            sBuffer+=sData
            process_msg(sBuffer)
            sBuffer=''
          when 2
            sBuffer+=aSplitRe[0]
            process_msg(sBuffer)
            sBuffer=aSplitRe[1]
          else
            sBuffer+=aSplitRe.shift()
            process_msg(sBuffer)
            sBuffer=aSplitRe.pop()
            _.each aSplitRe, (sTmpMsg) =>
              process_msg(sTmpMsg)
            sBuffer
      else
        sBuffer=sBuffer+sData

  oSocket.on 'close', (data)=>
    log("Client close:#{sRemoteAddress}")
    delSocket(iPort)
    # emitClientOff(_.size(_aSocketArr))
    store.default.dispatch(stopService('lua-debug'))

  oSocket.setTimeout DEFAULT_TIMEOUT, =>
    log("Client connect timeout")
    oSocket.end()

do_preprocess = (sData) ->
  newDataArr = sData.split MSG_END_FLAG
  for sEleData in newDataArr
    if sEleData.trim().length > 2
      process_msg(sEleData)


process_msg = (sData) ->
  # log sData
  newDataArr = sData.split MSG_START_FLAG
  for sEleData in newDataArr
    if sEleData?.trim().length > 2
      try # MSG_END_FLAG
        oRe = JSON.parse sEleData
        sState = oRe.state
        # log("lua send state: ", sState)
        switch sState
          when '202'
            # console.log oRe
            sFileName = oRe.file
            iLineNum = emp.toNumber oRe.line
            sLocalVar = oRe.args
            # log(sFileName, iLineNum) #, sLocalVar
            emitRTInfo(sFileName, iLineNum, sLocalVar)
          else
            log("else state:#{sState}", oRe)
      catch error
        log("error data\n", sEleData)
        console.error error

storeSocket = (oSocket)=>
  iRPort = oSocket.remotePort
  _aSocketArr[iRPort] = oSocket
  return iRPort

delSocket = (iPort)=>
  delete _aSocketArr[iPort]

resetState = () ->
  # _bServerState = false
  _oServer = null
  _aSocketArr = {}

# 发送 client 端的状态给 editor, 并使该 editor 被选中
emitRTInfo = (sFileName, iLineNum, sLocalVar) =>
  emitter.emit 'get-runtime-info', {name:sFileName, line:iLineNum, variable:sLocalVar}

module.exports =
  start:() ->
    _oServer = net.createServer initial
    _oServer.on 'error', (exception) =>
      if exception.code is 'EADDRINUSE'
        _oServer = null
        # @fFCallback() unless !@fFCallback
        @stopped()
        # emp_server_error = 'EADDRINUSE'
        su.default.handleError("lua-debug", "Address or Port in use, retrying...")
      else
        su.default.handleError("lua-debug",exception)

    detect(DEFAULT_PORT).then((port) =>
      _oServer.listen port, () =>
        # console.log store
        store.default.dispatch(startService('lua-debug', port))
      ).catch( (err) =>
        _oServer = null
        su.default.handleError("lua-debug","cant alloc port for lua-debug server")
      )

    _oServer.on 'connection', (oSocket) =>
      log("new client in +++++++ ")
      iRPort = storeSocket(oSocket)
      @getAllBP(iRPort)
      # @emitClientOn(_.size(@aSocketArr))

    _oServer.on 'listening', =>
      console.info '\nSocket Server start as:' + _oServer.address().address + ":" +_oServer.address().port

    @started()

  stop:() ->
    log("Cllose Debug server")
    try
      if _oServer
        _oServer.close()
        resetState()
        console.info "close socket sever over"
      else
        console.info "close socket sever over"
      # @fFCallback() unless !@fFCallback
      @stopped()
    catch exc
      # console.log su
      su.default.handleError("lua-debug", exc)
      resetState()
      @stopped()

  send:(sMsg)->
    # log(_aSocketArr, sMsg)
    for k, oSocket of _aSocketArr
      # _.each @aSocketArr, (oSocket)=>
      oSocket.write(sMsg)

  send_specify:(oSocket, sMsg)->
    oSocket.write(sMsg)

  addBPCB:(bp) ->
    log("send :add")
    @send(bp.addCommand())

  delBPCB:(bp) ->
    log("send :del")
    @send(bp.delCommand())

  sendAllBPsCB:({msg:iRPort}, oBPMaps) ->
    if oSocket = _aSocketArr[iRPort]
      for k, aBPList of oBPMaps
        for iL, oBP of aBPList
          @send_specify(oSocket, oBP.addCommand())

  started:() =>
    emitter.emit 'started'

  onStarted:(callback) ->
    emitter.on 'started', callback

  stopped:()=>
    emitter.emit 'stopped'

  onStopped:(callback) ->
    emitter.on 'stopped', callback

  getAllBP:(iRPort) =>
    emitter.emit 'get-all-bp',{msg:iRPort}

  onGetAllBP:(callback) ->
    emitter.on 'get-all-bp', callback

  # 发送 client 端的状态给 editor, 并使该 editor 被选中
  emitRTInfo:()=>
    emitRTInfo()

  onRTInfo:(callback) ->
    emitter.on 'get-runtime-info', callback

  # 修改页面显示状态
  emitClientOn:(iSize) =>
    emitter.emit 'set-client-on', {size:iSize}

  onClientOn:(callback) ->
    emitter.on 'set-client-on', callback

  emitClientOff:(iSize) =>
    emitter.emit 'set-client-off', {size:iSize}

  onClientOff:(callback) ->
    emitter.on 'set-client-off', callback
