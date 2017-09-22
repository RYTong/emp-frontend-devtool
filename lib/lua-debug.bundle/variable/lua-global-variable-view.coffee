{CompositeDisposable, Emitter} = require 'atom'
{$, $$, View,TextEditorView} = require 'atom-space-pen-views'
# VarEleUlView = require './subview/variable-ele-ul-view'

VarEleView = require './lua-variable-ele-view'

emp = require '../../global/emp'

module.exports = class LuaDebugGloVarView extends View

  @content: ->
    # local variable list
    @div outlet: 'vVarView', class: 'lua-debug-server-row', style:"display:inline;", =>
      @div class: "server-con panel-body padded", click:'show_var_view', =>
        @div outlet:'var_icon', class: "block conf-heading icon icon-triangle-right", "Global Variables"

      @div outlet:'var_list_panel', class: "server-con panel-body padded",style:"display:none;",  =>
        # @div class: "state-div-content", =>
        #   @label outlet:"vServerState", class: "debug-label-content", "--"
        @div class:'control-ol', outlet:'locv_tree'
          # @table class:'control-tab',outlet:'locv_tree'
          # @ul class:'vlist_ul',outlet:'locv_tree1'

  initialize:() ->
    console.log @locv_tree
    @iTestCon = 10


  show_var_view:() ->
    console.log "show_var_view"

    if @var_list_panel.isVisible()
      @var_list_panel.hide()
      @var_icon.addClass('icon-triangle-right')
      @var_icon.removeClass('icon-triangle-down')
    else
      @var_list_panel.show()
      @var_icon.removeClass('icon-triangle-right')
      @var_icon.addClass('icon-triangle-down')


  refresh_variable:(fFileName, oRe) ->

    console.log fFileName, oRe
    # oRe = JSON.parse(sVariable)
    # console.log oRe
    if !@vVarEleView
      @vVarEleView = new VarEleView(oRe)
      @locv_tree.append @vVarEleView
    else
      @vVarEleView.refresh_variable(oRe)
