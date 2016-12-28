{View} = require 'atom-space-pen-views'
{CompositeDisposable, Emitter} = require "atom"

module.exports =
class StepDetailView extends View

  @content: () ->
    # stop at
    @div outlet:'stepDetailView', class: 'lua-debug-server-row', style:"display:none;", =>

      @div class: "server-con panel-body padded", =>
        @div class: "block conf-heading icon icon-milestone", "Stop At"

      @div class: "server-con panel-body padded",  =>
        # @div class: "state-div-content", =>
        #   @label outlet:"vServerState", class: "debug-label-content", "--"
        @div class:'control-ol', =>
          @table class:'control-tab', outlet:'stop_at', =>
            @tr =>
              @td =>
                @span outlet: 'detail_info', class: 'text-success icon-pointer',  click:'linked'
              @td class:'btn-td ', align:"right", =>
                @div class:'db-remove inline-block icon status-added icon-diff-renamed', click:'linked'

  initialize: (@codeEventEmitter) ->
    @emitter = new Emitter()


  destroy: ->
    @sFile=null
    @sLine=null
    @detach()

  refresh_state:(@sFile, @sLine) ->
    @.show()
    @detail_info.text("#{@sFile}:#{@sLine}")

  set_empty:() ->
    @.hide()
    @detail_info.text('')


  linked: ->
    # console.log "do link----"
    @activeEditor()

  activeEditor:() ->
    @emitter.emit 'active-debug-editor', {name:@sFile, line:@sLine}

  onActiveEditor:(callback) ->
    @emitter.on 'active-debug-editor', callback
