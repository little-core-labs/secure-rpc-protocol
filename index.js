const peer = require('noise-peer')
const protocol = require('rpc-protocol')

function createSecureRPC (stream, isInitiator, opts) {
  const sec = peer(stream, isInitiator, opts)
  const rpc = protocol({ stream, encoding: opts.encoding })
  rpc.sec = sec

  return rpc
}

module.exports = createSecureRPC
