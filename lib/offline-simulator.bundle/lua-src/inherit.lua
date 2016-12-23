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
