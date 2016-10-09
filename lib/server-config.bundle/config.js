'use babel';

let updated = false;
let config = {
  loader: { port: 7004 },
  logger: { port: 7003 },
  simulator: {
    port: 4002,
    project: ''
  }
};

export default config;

export let update = (newConfig) => {
  if (!updated) {
    Object.keys(newConfig).forEach((skey) => {
      let server = newConfig[skey];
      Object.keys(server).forEach((key) => {
        config[skey][key] = server[key];
      });
    });
    updated = true;
  }
}
