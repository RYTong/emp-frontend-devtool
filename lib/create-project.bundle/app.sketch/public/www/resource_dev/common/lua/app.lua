local function bind(ctrl, color)
  -- FIXME: not work on ERT6.0
  ctrl:setOnClickListener(function()
    print('set color to', color)
    query('files'):setStyleByName("color", color)
  end)
end

local function query(selector)
  return document:getElementsByClassName(selector)[1]
end

local setWidth = function(selector, width)
  query(selector):setStyleByName('width', width..'px')
end

local function setTimeout(callback, delay)
  thetimer = timer:startTimer(0, 0, function()
    callback()
  end, delay)
end

local function task()
  setWidth('red', math.random(40, 300))
  setWidth('green', math.random(40, 300))
  setWidth('blue', math.random(40, 300))
  setWidth('yellow', math.random(40, 300))
  location:reload()
  setTimeout(task, 1)
end

local function stopTask()
  if (thetimer~=nil) then
    timer:stopTimer(thetimer)
    thetimer = nil
  end
end

local function startTask()
  stopTask()
  setTimeout(task, 0)
end

tip = function()
  window:alert(query('info'):getPropertyByName('text'))
end

toggleTask = function()
  if (thetimer ~=nil ) then
    query('task-action-label'):setPropertyByName('text', 'Start')
    stopTask()
  else
    query('task-action-label'):setPropertyByName('text', 'Stop')
    startTask()
  end
end

print('app start')

bind(query('red'), '#FF0000')
bind(query('green'), '#00FF0000')
bind(query('blue'), '#0000FF')
bind(query('yellow'), '#FFFF00')

stopTask()
