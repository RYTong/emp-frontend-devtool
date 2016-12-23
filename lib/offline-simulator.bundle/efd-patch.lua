(function(modules)
  -- The module cache
  local installedModules = {};

  -- The require function
  local __luapack_require__ = {};

  setmetatable(__luapack_require__, {
    __call = function(self, moduleId)

      -- Check if module is in cache
      if (installedModules[moduleId]) then
        return installedModules[moduleId].exports;
      end

      -- Create a new module
      local module = {
        exports = {},
        id = moduleId,
        loaded = false
      };

      -- And put the new module into the cache
      installedModules[moduleId] = module;

      -- Execute the module function
      modules[moduleId](module, module.exports, __luapack_require__);

      -- Flag the module as loaded
      module.loaded = true;

      -- Return the exports of the module
      return module.exports;
    end
  });

  __luapack_require__.m = modules;
  __luapack_require__.c = installedModules;

  -- Load entry module and return exports
  return __luapack_require__(1);
end
--------------------------------------------------------------------------------
)({
---- (1) ----
function(module, exports, __luapack_require__)
  module.filename = '/Users/lujingbo/src/atomwork/emp-frontend-devtool/lib/offline-simulator.bundle/lua-src/main.lua';
  local inspect = __luapack_require__(2)
  local string = __luapack_require__(3)
  local _ = __luapack_require__(4)
  
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
  
  _G.openInTextEditor = function(path)
    http:postSyn(
      {["X-Method"]="open-file"},
      "command",
      "path="..utility:escapeURI(path)
    );
  end
end,
---- (2) ----
function(module, exports)
  module.filename = '/Users/lujingbo/src/atomwork/emp-frontend-devtool/lib/offline-simulator.bundle/lua-src/inspect.lua';
  local inspect ={
    _VERSION = 'inspect.lua 3.0.3',
    _URL     = 'http://github.com/kikito/inspect.lua',
    _DESCRIPTION = 'human-readable representations of tables',
    _LICENSE = [[
      MIT LICENSE
  
      Copyright (c) 2013 Enrique García Cota
  
      Permission is hereby granted, free of charge, to any person obtaining a
      copy of this software and associated documentation files (the
      "Software"), to deal in the Software without restriction, including
      without limitation the rights to use, copy, modify, merge, publish,
      distribute, sublicense, and/or sell copies of the Software, and to
      permit persons to whom the Software is furnished to do so, subject to
      the following conditions:
  
      The above copyright notice and this permission notice shall be included
      in all copies or substantial portions of the Software.
  
      THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
      OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
      MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
      IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
      CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
      TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
      SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
    ]]
  }
  
  inspect.KEY       = setmetatable({}, {__tostring = function() return 'inspect.KEY' end})
  inspect.METATABLE = setmetatable({}, {__tostring = function() return 'inspect.METATABLE' end})
  
  -- Apostrophizes the string if it has quotes, but not aphostrophes
  -- Otherwise, it returns a regular quoted string
  local function smartQuote(str)
    if str:match('"') and not str:match("'") then
      return "'" .. str .. "'"
    end
    return '"' .. str:gsub('"', '\\"') .. '"'
  end
  
  local controlCharsTranslation = {
    ["\a"] = "\\a",  ["\b"] = "\\b", ["\f"] = "\\f",  ["\n"] = "\\n",
    ["\r"] = "\\r",  ["\t"] = "\\t", ["\v"] = "\\v"
  }
  
  local function escape(str)
    local result = str:gsub("\\", "\\\\"):gsub("(%c)", controlCharsTranslation)
    return result
  end
  
  local function isIdentifier(str)
    return type(str) == 'string' and str:match( "^[_%a][_%a%d]*$" )
  end
  
  local function isSequenceKey(k, sequenceLength)
    return type(k) == 'number'
       and 1 <= k
       and k <= sequenceLength
       and math.floor(k) == k
  end
  
  local defaultTypeOrders = {
    ['number']   = 1, ['boolean']  = 2, ['string'] = 3, ['table'] = 4,
    ['function'] = 5, ['userdata'] = 6, ['thread'] = 7
  }
  
  local function sortKeys(a, b)
    local ta, tb = type(a), type(b)
  
    -- strings and numbers are sorted numerically/alphabetically
    if ta == tb and (ta == 'string' or ta == 'number') then return a < b end
  
    local dta, dtb = defaultTypeOrders[ta], defaultTypeOrders[tb]
    -- Two default types are compared according to the defaultTypeOrders table
    if dta and dtb then return defaultTypeOrders[ta] < defaultTypeOrders[tb]
    elseif dta     then return true  -- default types before custom ones
    elseif dtb     then return false -- custom types after default ones
    end
  
    -- custom types are sorted out alphabetically
    return ta < tb
  end
  
  -- For implementation reasons, the behavior of rawlen & # is "undefined" when
  -- tables aren't pure sequences. So we implement our own # operator.
  local function getSequenceLength(t)
    local len = 1
    local v = rawget(t,len)
    while v ~= nil do
      len = len + 1
      v = rawget(t,len)
    end
    return len - 1
  end
  
  local function getNonSequentialKeys(t)
    local keys = {}
    local sequenceLength = getSequenceLength(t)
    for k,_ in pairs(t) do
      if not isSequenceKey(k, sequenceLength) then table.insert(keys, k) end
    end
    table.sort(keys, sortKeys)
    return keys, sequenceLength
  end
  
  local function getToStringResultSafely(t, mt)
    local __tostring = type(mt) == 'table' and rawget(mt, '__tostring')
    local str, ok
    if type(__tostring) == 'function' then
      ok, str = pcall(__tostring, t)
      str = ok and str or 'error: ' .. tostring(str)
    end
    if type(str) == 'string' and #str > 0 then return str end
  end
  
  local maxIdsMetaTable = {
    __index = function(self, typeName)
      rawset(self, typeName, 0)
      return 0
    end
  }
  
  local idsMetaTable = {
    __index = function (self, typeName)
      local col = {}
      rawset(self, typeName, col)
      return col
    end
  }
  
  local function countTableAppearances(t, tableAppearances)
    tableAppearances = tableAppearances or {}
  
    if type(t) == 'table' then
      if not tableAppearances[t] then
        tableAppearances[t] = 1
        for k,v in pairs(t) do
          countTableAppearances(k, tableAppearances)
          countTableAppearances(v, tableAppearances)
        end
        countTableAppearances(getmetatable(t), tableAppearances)
      else
        tableAppearances[t] = tableAppearances[t] + 1
      end
    end
  
    return tableAppearances
  end
  
  local copySequence = function(s)
    local copy, len = {}, #s
    for i=1, len do copy[i] = s[i] end
    return copy, len
  end
  
  local function makePath(path, ...)
    local keys = {...}
    local newPath, len = copySequence(path)
    for i=1, #keys do
      newPath[len + i] = keys[i]
    end
    return newPath
  end
  
  local function processRecursive(process, item, path)
    if item == nil then return nil end
  
    local processed = process(item, path)
    if type(processed) == 'table' then
      local processedCopy = {}
      local processedKey
  
      for k,v in pairs(processed) do
        processedKey = processRecursive(process, k, makePath(path, k, inspect.KEY))
        if processedKey ~= nil then
          processedCopy[processedKey] = processRecursive(process, v, makePath(path, processedKey))
        end
      end
  
      local mt  = processRecursive(process, getmetatable(processed), makePath(path, inspect.METATABLE))
      setmetatable(processedCopy, mt)
      processed = processedCopy
    end
    return processed
  end
  
  
  -------------------------------------------------------------------
  
  local Inspector = {}
  local Inspector_mt = {__index = Inspector}
  
  function Inspector:puts(...)
    local args   = {...}
    local buffer = self.buffer
    local len    = #buffer
    for i=1, #args do
      len = len + 1
      buffer[len] = tostring(args[i])
    end
  end
  
  function Inspector:down(f)
    self.level = self.level + 1
    f()
    self.level = self.level - 1
  end
  
  function Inspector:tabify()
    self:puts(self.newline, string.rep(self.indent, self.level))
  end
  
  function Inspector:alreadyVisited(v)
    return self.ids[type(v)][v] ~= nil
  end
  
  function Inspector:getId(v)
    local tv = type(v)
    local id = self.ids[tv][v]
    if not id then
      id              = self.maxIds[tv] + 1
      self.maxIds[tv] = id
      self.ids[tv][v] = id
    end
    return id
  end
  
  function Inspector:putKey(k)
    if isIdentifier(k) then return self:puts(k) end
    self:puts("[")
    self:putValue(k)
    self:puts("]")
  end
  
  function Inspector:putTable(t)
    if t == inspect.KEY or t == inspect.METATABLE then
      self:puts(tostring(t))
    elseif self:alreadyVisited(t) then
      self:puts('<table ', self:getId(t), '>')
    elseif self.level >= self.depth then
      self:puts('{...}')
    else
      if self.tableAppearances[t] > 1 then self:puts('<', self:getId(t), '>') end
  
      local nonSequentialKeys, sequenceLength = getNonSequentialKeys(t)
      local mt                = getmetatable(t)
      local toStringResult    = getToStringResultSafely(t, mt)
  
      self:puts('{')
      self:down(function()
        if toStringResult then
          self:puts(' -- ', escape(toStringResult))
          if sequenceLength >= 1 then self:tabify() end
        end
  
        local count = 0
        for i=1, sequenceLength do
          if count > 0 then self:puts(',') end
          self:puts(' ')
          self:putValue(t[i])
          count = count + 1
        end
  
        for _,k in ipairs(nonSequentialKeys) do
          if count > 0 then self:puts(',') end
          self:tabify()
          self:putKey(k)
          self:puts(' = ')
          self:putValue(t[k])
          count = count + 1
        end
  
        if mt then
          if count > 0 then self:puts(',') end
          self:tabify()
          self:puts('<metatable> = ')
          self:putValue(mt)
        end
      end)
  
      if #nonSequentialKeys > 0 or mt then -- result is multi-lined. Justify closing }
        self:tabify()
      elseif sequenceLength > 0 then -- array tables have one extra space before closing }
        self:puts(' ')
      end
  
      self:puts('}')
    end
  end
  
  function Inspector:putValue(v)
    local tv = type(v)
  
    if tv == 'string' then
      self:puts(smartQuote(escape(v)))
    elseif tv == 'number' or tv == 'boolean' or tv == 'nil' then
      self:puts(tostring(v))
    elseif tv == 'table' then
      self:putTable(v)
    else
      self:puts('<',tv,' ',self:getId(v),'>')
    end
  end
  
  -------------------------------------------------------------------
  
  function inspect.inspect(root, options)
    options       = options or {}
  
    local depth   = options.depth   or math.huge
    local newline = options.newline or '\n'
    local indent  = options.indent  or '  '
    local process = options.process
  
    if process then
      root = processRecursive(process, root, {})
    end
  
    local inspector = setmetatable({
      depth            = depth,
      buffer           = {},
      level            = 0,
      ids              = setmetatable({}, idsMetaTable),
      maxIds           = setmetatable({}, maxIdsMetaTable),
      newline          = newline,
      indent           = indent,
      tableAppearances = countTableAppearances(root)
    }, Inspector_mt)
  
    inspector:putValue(root)
  
    return table.concat(inspector.buffer)
  end
  
  setmetatable(inspect, { __call = function(_, ...) return inspect.inspect(...) end })
  
  module.exports = inspect;
end,
---- (3) ----
function(module, exports, __luapack_require__)
  module.filename = '/Users/lujingbo/src/atomwork/emp-frontend-devtool/lib/offline-simulator.bundle/lua-src/string.lua';
  local _ = __luapack_require__(4);
  local inherit = __luapack_require__(5);
  local Array = __luapack_require__(6);
  
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
end,
---- (4) ----
function(module, exports, __luapack_require__)
  module.filename = '/Users/lujingbo/src/atomwork/emp-frontend-devtool/lib/offline-simulator.bundle/lua-src/underscore.lua';
  local inherit = __luapack_require__(5);
  local inspect = __luapack_require__(2);
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
end,
---- (5) ----
function(module, exports)
  module.filename = '/Users/lujingbo/src/atomwork/emp-frontend-devtool/lib/offline-simulator.bundle/lua-src/inherit.lua';
  --TODO: add Inerit.merge
  module.exports = function(meta, object)
    object = object or {};
  
    local mt = getmetatable(object);
  
    if (mt ~= nil) then
      for k, v in pairs(meta) do
        mt[k] = v;
      end
    else
      meta.__index = meta;
      setmetatable(object, meta);
    end
  
    return object;
  end
end,
---- (6) ----
function(module, exports, __luapack_require__)
  module.filename = '/Users/lujingbo/src/atomwork/emp-frontend-devtool/lib/offline-simulator.bundle/lua-src/array.lua';
  local inherit = __luapack_require__(5);
  
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
end
});
