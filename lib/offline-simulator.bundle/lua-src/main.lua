local inspect = require('./inspect.lua')
local string = require('./string.lua')
local _ = require('./underscore.lua')

local log = function(...)
  local upFrame = string.split(debug.traceback('[call at]',2), '\n')[3];
  _print(string.trim(upFrame));
  _print(_.reduce({...}, function(_k, v, acc)
    local val = v;

    if type(v) ~= 'string' then
      val = inspect(v);
    end

    return acc..val;
  end, ''));
end

if (type(_G._print) ~= 'function') then
  _G._print = _G.print
  _G.print = log
end
