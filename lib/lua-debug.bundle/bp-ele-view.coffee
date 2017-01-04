{View} = require 'atom-space-pen-views'
{Point} = require "atom"
module.exports =
class BPEleView extends View

  @content: (cb, oBreakpoint) ->
    @tr =>
      @td =>
        @span outlet: 'ele_name', class: 'text-info status-added icon icon-diff-added icon-pointer', click:'linked', oBreakpoint.sID
      @td class:'btn-td ', align:"right", =>
        @div class:'db-remove inline-block icon status-removed icon-diff-removed', click:'del_dp'

        # @button class:'btn btn-info',click:'do_edit',"Edit"
        # @button class:'btn btn-error',click:'do_remove',"Remove"


  initialize: (@callback, @oBreakpoint) ->


  destroy: ->
    @detach()

  del_dp: ->
    @callback(@oBreakpoint)
    @detach()

  linked: ->
    # console.log "do link----"
    oEditor = @oBreakpoint.oEditor
    # console.log oEditor
    oPoint = new Point(@oBreakpoint.iLine-1, 0)
    atom.workspace.open(oEditor.getPath(), { changeFocus:true }).then (oNewEditor) =>
      # console.log "after editor open", oNewEditor
      oNewEditor?.setCursorBufferPosition(oPoint)
