'use babel';

export default function(prefix) {
  return (...args) => {
    console.log(prefix, ...args);
  }
}
