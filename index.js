const peer = require('noise-peer')
const protocol = require('rpc-protocol')

/**
 * createSecureRPC returns an rpc-protocol instance connected over a secure socket.
 * @param  {Object}  stream      Any duplex stream.
 * @param  {Boolean} isInitiator Noise protocol initiator status.
 * @param  {Object}  opts        Options object passed to noise-peer.
 * @param  {Object}  opts.encoding  Encoding object passed to rpc-protocol.
 * @return {Object}              Returns an rpc-protocol instance pumping into the noise-peer wrapped stream.
 */
function createSecureRPC (stream, isInitiator, opts = {}) {
  const { encoding, ...rest } = opts
  const sec = peer(stream, isInitiator, rest)
  const rpc = protocol({ stream: sec, encoding })
  rpc.sec = sec

  return rpc
}

module.exports = createSecureRPC
module.exports.peer = peer
