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
log = require('../../log-prefix')('[lua-debugger.server]')
parseIP =  require '../../parse-ip'
socketEmitter = require '../../socket-emitter'

{startService, stopService} = require '../../actions'
# unless emitter
emitter = new Emitter()

_oServer = null
_aSocketArr = {}
_oBPMaps = {}
_sSelectID = null
# _bServerState = false
emit = socketEmitter.getEmit('lua-debugger')
# emit = (event, args...) =>
#   socketEmitter.emit(event, 'lua-debug', args...)

initial = (oSocket) ->
  # sRemoteAddress = oSocket.remoteAddress
  sKey = storeSocket(oSocket)
  emit('peer-connect', sKey)
  log("New Client connect:#{sKey}")

  oSocket.setEncoding('utf8')
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
    log("Client close:#{sKey}")
    emit('peer-disconnect', sKey)
    delSocket(sKey)
    # emitClientOff(_.size(_aSocketArr))

  oSocket.setTimeout DEFAULT_TIMEOUT, =>
    log("Client connect timeout")
    oSocket.end()

  # 判断 如果为第一个链接的设备, 并且 断点数 > 0, 则不立刻运行 (会在回调中加入断点, 并发送 run)
  # 否则发送 run, 不阻塞
  # unless (_.size(_aSocketArr) is 1) and (_.size(_oBPMaps) > 0)
  initialRun(oSocket)


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
          when '200'
            continue
          else
            log("else state:#{sState}", oRe)
      catch error
        log("error data\n", sEleData)
        console.error error

storeSocket = (oSocket)=>
  sNewIp = parseIP(oSocket.remoteAddress)
  sKey = "#{sNewIp}##{oSocket.remotePort}"
  # console.log sKey
  oSocket.sKey = sKey
  # iRPort = oSocket.remotePort
  _aSocketArr[sKey] = oSocket
  return sKey

delSocket = (sKey)=>
  delete _aSocketArr[sKey]

resetState = () ->
  # _bServerState = false
  _oServer = null
  _aSocketArr = {}
  _sSelectID = null

# 发送 client 端的状态给 editor, 并使该 editor 被选中
emitRTInfo = (sFileName, iLineNum, sLocalVar) =>
  emitter.emit 'get-runtime-info', {name:sFileName, line:iLineNum, variable:sLocalVar}

getAllBP = (sKey) =>
  emitter.emit 'get-all-bp',{msg:sKey}

initialRun = (oSocket) =>
  oSocket.write(emp.LUA_MSG_RUN)

module.exports =
  start:() ->
    _oServer = net.createServer initial
    _oServer.on 'error', (exception) =>
      if exception.code is 'EADDRINUSE'
        _oServer = null
        # @fFCallback() unless !@fFCallback
        @stopped()
        # emp_server_error = 'EADDRINUSE'
        su.default.handleError("lua-debugger", "Address or Port in use, retrying...")
      else
        su.default.handleError("lua-debugger",exception)

    detect(DEFAULT_PORT).then((port) =>
      _oServer.listen port, () =>
        # console.log store
        log("lua-debugger server start:", port)
        store.default.dispatch(startService('lua-debugger', port))
      ).catch( (err) =>
        _oServer = null
        su.default.handleError("lua-debugger","cant alloc port for lua-debug server")
      )

    _oServer.on 'close',  =>
      store.default.dispatch(stopService('lua-debugger'))
      resetState()

    @started()

  stop:() ->
    log("Cllose Debug server")
    try
      if _oServer
        _oServer.close()
        # resetState()
        console.info "close socket sever over"
      else
        console.info "close socket sever over"
      # @fFCallback() unless !@fFCallback
      @stopped()
    catch exc
      # console.log su
      # console.log exc
      su.default.handleError("lua-debugger", exc)
      resetState()
      @stopped()

  send:(sMsg)->
    # log(_aSocketArr, sMsg)
    # for k, oSocket of _aSocketArr
      # _.each @aSocketArr, (oSocket)=>
      # oSocket.write(sMsg)
    if _sSelectID
      oSocket = _aSocketArr[_sSelectID]
      oSocket.write(sMsg)

  send_specify:(oSocket, sMsg)->
    oSocket.write(sMsg)

  addBPCB:(bp) ->
    # log("send :add")
    _oBPMaps[bp.sID] = bp
    @send(bp.addCommand())
    # if _sSelectID
    #   oSocket = _aSocketArr[_sSelectID]
    #   @send_specify(oSocket, bp.addCommand())


  delBPCB:(bp) ->
    # log("send :del")
    delete _oBPMaps[bp.sID]
    @send(bp.delCommand())
    # if _sSelectID
    #   oSocket = _aSocketArr[_sSelectID]
    #   @send_specify(oSocket, bp.delCommand())

  sendAllBPsCB:({msg:sKey}, oBPMaps) ->

    if oSocket = _aSocketArr[sKey]
      if _.size(oBPMaps) > 0
        for k, aBPList of oBPMaps
          for iL, oBP of aBPList
            @send_specify(oSocket, oBP.addCommand())
      else
        @send_specify(oSocket, emp.LUA_MSG_RUN)

  setSelectClient:({msg:sKey, isDel:bIsDel}) ->
    # console.log _sSelectID, _aSocketArr, sKey
    if !bIsDel
    # else
      if _sSelectID
        oPreSocket = _aSocketArr[_sSelectID]
        @send_specify(oPreSocket, emp.LUA_MSG_DELBALL)
        @send_specify(oPreSocket, emp.LUA_MSG_RUN)

    if oSocket = _aSocketArr[sKey]
      _sSelectID = sKey
      if _.size(_oBPMaps) > 0
        for iL, oBP of _oBPMaps
          @send_specify(oSocket, oBP.addCommand())
    else
      _sSelectID = null

  started:() =>
    emitter.emit 'started'

  onStarted:(callback) ->
    emitter.on 'started', callback

  stopped:()=>
    emitter.emit 'stopped'

  onStopped:(callback) ->
    emitter.on 'stopped', callback

  getAllBP:(sKey) =>
    getAllBP(sKey)

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
