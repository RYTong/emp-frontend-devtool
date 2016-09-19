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
  return __luapack_require__({{ENTRYPOINT}});
end
--------------------------------------------------------------------------------
)({
{{MODULES}}
});
