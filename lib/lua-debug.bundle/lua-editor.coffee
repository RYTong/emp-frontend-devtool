{CompositeDisposable} = require 'atom'
emp = require './global/emp'
Breakpoint = require './breakpoint/breakpoint'

module.exports =
class LuaEditor
  breakMarkers:null
  editorMap:null

  constructor:() ->
    # console.log "lua editor constructor"
    @disposable = new CompositeDisposable()
    @breakMarkers = []
    @editorMap = new Map()

  init:(@oBreakpointStore) =>
    @disposable.add atom.workspace.observeTextEditors(@observeTextEditors)

  observeTextEditors:(tmpEditor) =>
    grammar = tmpEditor.getGrammar()
    unless grammar.scopeName is emp.LUA_GRAMMAR
      return
    # console.log grammar

    # o = {markers:[],gutter: tmpEditor.addGutter({ name: 'lua-debug', priority: -100 })
    # }

    tmpGutter = tmpEditor.addGutter({ name: 'lua-debug', priority: -100 })

    gutterView = atom.views.getView(tmpGutter)
    gutterView.addEventListener 'click', (ev)=> @onGutterClick(tmpEditor, ev)
    @resumeEditor(tmpEditor)

  onGutterClick:(editor, ev) =>
    # console.log "onGutterClick callback"
    editorView = atom.views.getView editor
    {row:sLine} = editorView.component.screenPositionForMouseEvent(ev)
    sELine = editor.bufferRowForScreenRow(sLine)
    sNLine = sELine+1
    sContent = editor.lineTextForBufferRow(sELine)
    sContent = sContent?.trim()
    # console.log "click line is:", sContent
    sName = editor.getTitle()
    sFile = editor.getPath()

    if sContent.length > 0
      if sContent.match /^--/i
        @deleteBreakpoint(sName, sFile, sNLine, editor)
      else
        @addBreakpoint(sName, sFile, sNLine, editor)
    else
      # console.log "not process----"
      @deleteBreakpoint(sName, sFile, sNLine, editor)

  addBreakpoint:(sName, sFile, sLine, oEditor) =>
    # console.log 'addBreakpoint'
    oBP = new Breakpoint(sName, sFile, sLine, oEditor)
    @oBreakpointStore.addBreakpoint(oBP, oEditor)

  deleteBreakpoint:(sName, sFile, sLine, oEditor) =>
    oBP = new Breakpoint(sName, sFile, sLine, oEditor)
    @oBreakpointStore.deleteBreakpoint(oBP)

  resumeEditor:(oEditor)=>
    # console.log "do resume"
    @oBreakpointStore.resumeEditor(oEditor)



  dispose: ->
    @disposable.dispose()
