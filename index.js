const peer = require('noise-peer')
const protocol = require('rpc-protocol')

function createSecureRPC (stream, isInitiator, opts = {}) {
  const { encoding, ...rest } = opts
  const sec = peer(stream, isInitiator, rest)
  const rpc = protocol({ stream: sec, encoding })
  rpc.sec = sec

  return rpc
}

module.exports = createSecureRPC
