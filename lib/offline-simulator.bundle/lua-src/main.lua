local inspect = require('./inspect.lua')
local string = require('./string.lua')
local _ = require('./underscore.lua')
local Array = require('./array.lua')

local log = function(...)
  local args = {...}
  if (type(args[1]) == 'table' and args[1].gfile == 'ert.lua') then
    _print('ignore ert object')
    Array.unshift(args)
  end

  local upFrame = string.split(debug.traceback('[call at]',2), '\n')[3];
  _print(string.trim(upFrame));
  _print(_.reduce(args, function(_k, v, acc)
    local val = v;

    if type(v) ~= 'string' then
      val = inspect(v);
    end

    return acc..val;
  end, ''));
end

if (type(_G._print) ~= 'function') then
  _G._print = _G.print
end

_G.print = log

_G.openInTextEditor = function(path)
  http:postSyn(
    {["X-Method"]="open-file"},
    "command",
    "path="..utility:escapeURI(path)
  );
end


test = function(...)
end
