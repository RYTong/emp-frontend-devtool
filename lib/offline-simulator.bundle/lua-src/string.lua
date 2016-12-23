local _ = require('./underscore.lua');
local inherit = require('./inherit.lua');
local Array = require('./array.lua');

local magics = {'^', "$", '(', ')', '%', '.', '[', ']', '*', '+', '-', '?'};
local String = {};

String.each = function(str, iteratee)
  local i, size = 1, string.len(str);

  while (i <= size) do
    iteratee(string.sub(str, i, i));
    i = i + 1;
  end
end

String.escape = function(str)
  local escaped, isMagic = '';

  --XXX
  String.each(str, function(char)
    isMagic = _.some(magics, function(i, magic)
      return char == magic;
    end);

    if isMagic then
      char = '%' .. char;
    end

    escaped = escaped .. char;
  end)

  return escaped;
end

String.startsWith = function(str, start)
  local escaped = String.escape(start);

  return string.match(str, '^'..escaped) ~= nil;
end

String.trim = function(str)
  str = string.gsub(str, "^%s*", '');
  str = string.gsub(str, "%s*$", '');
  return str;
end

String.split = function(str, sep)
  sep = sep or ' ';
  local result = Array();
  local temp = Array();
  local s = '';

  --XXX
  String.each(str, function(char)
    if char ~= sep then
      temp:push(char);
    else
      s = String.join(temp);
      temp = Array();
      if s ~= '' then
        result:push(s);
      end
    end
  end);

  s = String.join(temp);
  if s ~= '' then
    result:push(s);
  end

  return result;
end

String.join = function(strAry, sep)
  return table.concat(strAry, sep);
  -- sep = sep or '';
  -- local result = '';
  -- local start = #sep + 1;
  --
  -- _.each(strAry, function(_k, v)
  --   result = result .. sep .. v;
  -- end);
  --
  -- return string.sub(result, start);
end

module.exports = inherit(string, String);
