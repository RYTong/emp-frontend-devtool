'use babel'

import emitter from '../socket-emitter'

const emit = emitter.getEmit('hot-loader')
let _peers = {}

emit('set-peer-resolve-handler', (peer, peers) => {
  _peers = peers
})

emit('set-peer-connect-handler', (peer, peers) => {
  _peers = peers
})

emit('set-peer-disconnect-handler', (peer, peers) => {
  _peers = peers
})

const getPeers = () => _peers

export default getPeers
