local inherit = require('./inherit.lua');

local Array = {};

Array.__type__ = 'array';

Array.isArray = function(target)
  local mt;

  if (type(target) == 'table') then
    mt = getmetatable(target);
  end

  if mt == Array then
    return true;
  else
    return false;
  end
end

Array.push = function(self, value)
  table.insert(self, #self + 1, value);
end

Array.pop = function(self)
  return table.remove(self, #self);
end

Array.shift = function(self)
  --TODO
end

Array.unshift = function(self)
  --TODO
end

Array.remove = function(self, index)
  --TODO
end

Array.isEmpty = function(self)
  return #self == 0;
end

Array.length = function(self)
  return #self;
end

setmetatable(Array, {
  __call = function(self, array)
    return inherit(Array, array);
  end
});

module.exports = Array;
