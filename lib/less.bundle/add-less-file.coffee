{Disposable, CompositeDisposable} = require 'atom'
{$, $$} = require 'atom-space-pen-views'
emp = require '../global/emp'
AddDialog = require './add-dialog'

module.exports =

  new_less_file: ->
    treeView = atom.workspace.getLeftDock().getPaneItems()[0];
    selectedEntry = treeView.selectedEntry() ? treeView.roots[0]
    selectedPath = selectedEntry.getPath() ? ''
    console.log "selectedPath-----:", selectedPath
    # console.log selectedPath
    # console.log treeView.roots[0].getPath()
    # console.log treeView.find()
    # console.log atom.workspaceView.find('.tree-view .selected').views()?[0][0].getPath?()
    # sNewLessFile = path.join selectedPath, emp.DEFAULT_LESS_NAME
    dialog = new AddDialog(selectedPath, true)
    # dialog.on 'directory-created', (event, createdPath) =>
    #   @entryForPath(createdPath)?.reload()
    #   @selectEntryForPath(createdPath)
    #   false

    dialog.on 'file-created', (event, createdPath) ->
      atom.workspace.open(createdPath)
      false
    dialog.attach()
