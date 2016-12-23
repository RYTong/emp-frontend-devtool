local inherit = require('./inherit.lua');
local inspect = require('./inspect.lua');
local underscore = {};

underscore.each = function(collection, iteratee)
  for k, v in pairs(collection) do
    iteratee(k, v)
  end
end;

underscore.filter = function(collection, predicate)
  local f = {};

  for k, v in pairs(collection) do
    if predicate(k, v) == true then
      f[k] = v;
    end
  end

  return inherit(underscore, f);
end

underscore.some = function(collection, predicate)
  for k, v in pairs(collection) do
    if predicate(k, v) == true then
      return true;
    end
  end

  return false;
end

underscore.reduce = function(collection, iteratee, accumulator)
  for k, v in pairs(collection) do
    accumulator = iteratee(k, v, accumulator);
  end

  return accumulator;
end

underscore.assign = function(collection, ...)
  underscore.each({...}, function(i, object)
    underscore.each(object, function(k, v)
      collection[k] = v;
    end);
  end);

  return collection;
end

module.exports = underscore;
