{$, $$, $$$, View} = require 'atom-space-pen-views'
# VarEleUlView = require './variable-ele-ul-view'
_ = require 'underscore-plus'

module.exports =
class VarEleLiView extends View
  oStoreView:{}
  @content: (sKey, sVal) ->
    # if typeof(sVal) isnt "object"
    #   @li outlet: 'fa_view', class: 'vlist_li icon', =>
    #       @span class:'text-warning', "#{sKey} "
    #       @span class:'text-info', " = "
    #       @span outlet:'vSpanVal', class:'text-info', "#{sVal}"
    # else
    unless sVal
      sVal = "Table"

    @li outlet: 'fa_view',class: 'vlist_li', =>
      @div outlet: 'li_view', class:'icon', click:'show_var_detail', =>
        @span class:'text-warning', "#{sKey} "
        @span class:'text-info', " = "
        @span outlet:'vSpanVal', class:'text-info', "#{sVal}"
      @ul class:'vlist_ul',outlet:'ul_list', style:"display:none;"

  initialize: (@sKey, @sVal) ->
    # console.log @vSpanVal.text()
    # console.log @sVal
    @oStoreView={}
    @sShowType = "text"
    if typeof(@sVal) is "object"
      # console.log "is obj"
      @sShowType = "table"
      @li_view.addClass('icon-triangle-right')
      aKeys = _.keys(@sVal).sort()
      for sTmpKey in aKeys
        # for sTmpKey, sTmpVal of @sVal
        sTmpVal = @sVal[sTmpKey]
        # if typeof(sTmpVal) isnt "object"
        # console.log "isnt obj", sKey, sVal
        vEleView = new VarEleLiView(sTmpKey, sTmpVal)
        @oStoreView[sTmpKey] = @new_store_obj(sTmpVal, vEleView)
        @ul_list.append vEleView
      # vUlView = new VarEleLiView(@sVal)
      # console.log vUlView
      # @li_view.after vUlView

  destroy: ->
    @detach()

  new_store_obj: (val, vView) ->
    return {val:val, view:vView}

  show_var_detail:() ->
    # console.log "show_var_view"
    unless @sShowType isnt 'table'
      if @ul_list.isVisible()
        @ul_list.hide()
        @li_view.addClass('icon-triangle-right')
        @li_view.removeClass('icon-triangle-down')
      else
        @ul_list.show()
        @li_view.removeClass('icon-triangle-right')
        @li_view.addClass('icon-triangle-down')

  refresh_variable:(sNKey, sNVal) ->
    # console.log "refresh li:", sNKey, sNVal

    # if @sShowType is 'object'

    # console.log typeof(sNVal), @sShowType
    if typeof(sNVal) is 'object'
      if @sShowType is 'table'
        for sOKey, sOVal of @oStoreView
          if not sNVal[sOKey]
            sOVal.view.destroy()
            delete @oStoreView[sOKey]

        aKeys = _.keys(sNVal).sort()
        for sNewSubK in aKeys
          # for sNewSubK, sNewSubV of sNVal
          sNewSubV = sNVal[sNewSubK]
          if oViewObj = @oStoreView[sNewSubK]
            oViewObj.view.refresh_variable(sNewSubK, sNewSubV)

          else
            vEleUlView = new VarEleLiView(sNewSubK, sNewSubV)
            @oStoreView[sNewSubK] = @new_store_obj(sNewSubV, vEleUlView)
            @ul_list.append vEleUlView
      else
        @oStoreView = {}
        @li_view.addClass('icon-triangle-right')
        @vSpanVal.text('Table')
        aKeys = _.keys(sNVal).sort()
        for sNewSubK in aKeys
          # for sNewSubK, sNewSubV of sNVal
          sNewSubV = sNVal[sNewSubK]
          vEleUlView = new VarEleLiView(sNewSubK, sNewSubV)
          @oStoreView[sNewSubK] = @new_store_obj(sNewSubV, vEleUlView)
          @ul_list.append vEleUlView

      @sVal = sNVal
      @sShowType = 'table'

    else
      if @sShowType is 'table'
        @li_view.removeClass('icon-triangle-right')
        @li_view.removeClass('icon-triangle-down')
        @ul_list.empty()
        @ul_list.hide()
        @oStoreView = {}
        @sVal = sNVal
        @vSpanVal.text(@sVal)
      else
        if sNVal isnt @sVal
          # console.log @vSpanVal
          @sVal = sNVal
          @vSpanVal.text(@sVal)
      @sShowType = 'text'
        # @vSpanVal  oStoreView:{}
