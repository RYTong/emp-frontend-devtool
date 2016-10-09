'use babel';

import fs from 'fs';
import path from 'path';

let log = require('../log-prefix')('[sourcemap]');
let smfile = '/Users/lujingbo/src/rytongwork/ebank-poc/public/www/resource_dev/common/lua/eff.lua.sourcemap';
let pattern = /\[string "\(function\(modules\)\.{3}"\]:(\d+)/g;
let _sourcemap = {};

let load = () => {
  try {
    _sourcemap = JSON.parse(fs.readFileSync(smfile, 'utf8'));
  } catch (err) {
    _sourcemap = {};
    console.log(err.message);
  }
}

fs.watch(smfile, (event) => {
  if (event === 'change') {
    load();
  }
});

load();

export default function(source) {
  return source.replace(pattern, (orig, line) => {
    for (let file in _sourcemap) {
      let region = _sourcemap[file];
      if (line >= region[0] && line <= region[1]) {
        let lineno = line - region[0] - 2;
        let bn = path.basename(file);
        return `<a href="#" class="text-subtle" file=${file} line=${lineno}>${bn}:${lineno}</a>`
      }
    }

    return orig;
  });
}
