const peer = require('noise-peer')
const protocol = require('rpc-protocol')
const pump = require('pump')

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
  const rpc = protocol({ encoding })
  rpc.sec = sec

  // Important detail:
  // internally, rpc will perform pump(rpc, sec, rpc). We must
  // call pump(sec, rpc, sec) instead.  It should be the same but it isn't.
  //
  // Using the built in stream option for rpc results in finish messages
  // not properly propagating from both ends.
  pump(sec, rpc, sec)

  return rpc
}

module.exports = createSecureRPC
module.exports.peer = peer
