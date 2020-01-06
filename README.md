# secure-rpc-protocol
[![Actions Status](https://github.com/little-core-labs/secure-rpc-protocol/workflows/tests/badge.svg)](https://github.com/little-core-labs/secure-rpc-protocol/actions)

Secure [rpc-protocol][rpc] over any duplex socket using [noise-protocol][npeer].

## Installation

```
npm install secure-rpc-protocol
```

## Usage

``` js
// client.js
const secureRPC = require('secure-rpc-protocol')
const net = require('net')

const socket = new net.Socket()

socket.connect(8124, () => {
  const rpc = secureRPC(socket, true)

  rpc.call('echo', 'hello world', (err, res) => {
    if (err) return console.error(err)
    console.log(res) // [ 'hello world' ]
  })
})
```

``` js
// server.js
const net = require('net')
const secureRPC = require('secure-rpc-protocol')

const server = net.createServer((socket) => {
  const rpc = secureRPC(socket, false)

  rpc.command('echo', (req) => {
    console.log(req.arguments)
    return req.arguments
  })
})

server.listen(8124, () => {
  console.log('server listening on 8124')
})
```

## API

### `secureRPC = require('secure-rpc-protocol')`

Import the `secureRPC` factory function used to create a secureRPC instance.

### `peer = secureRPC.peer`

Access to [noise-peer](https://github.com/emilbayes/noise-peer).  Useful for accessing `peer.keygen`.

### `rpc = secureRPC(stream, isInitiator, [opts])`

Pass in a [duplex][duplex] `stream` and indicate if the stream `isInitiator` according to what [noise-protocol][np] being used.

The `opts` object is passed to [`noise-peer`][npeer] with the exception of the `encoder` property, which is passed to [rpc-protocol][rpc].

See [rpc-protocol][rpc] docs on how to use the rpc api.

See [`noise-peer`][npeer] and [`noise-protocol`][np] and the included examples to understand the details of securing the connection.

## Examples

- [forward-secret-nn](examples/forward-secret-nn): Forward secret only, no authentication using the [nn][nn] pattern.
- [mutual-auth-xx](examples/mutual-auth-xx): Mutual authentication using the [xx][xx] pattern.
- [client-auth-psk-xk](examples/client-auth-psk-xk): Client authentication with pre shared server key using the [xk][xk] pattern.
- [websockets](examples/websockets): Example using [`simple-websocket`][sw] demonstrating stream agnostic nature of the library.

## See also

- [rpc-protocol][rpc]
- [noise-peer][npeer]
- [simple-handshake][sh]: Docs on the underlying handshake used by [`noise-peer`][npeer]
- [noise-protocol][np]: Docs on the noise protocol itself.
- [secret-handshake-over-hypercore](https://github.com/secure-local-node/secret-handshake-over-hypercore): a precursor to this module.
- [noise-network](https://github.com/mafintosh/noise-network): Noise secured connections over [hyperswarm](https://github.com/hyperswarm).
- [secure-wsnet](https://github.com/secure-local-node/secure-wsnet): A precursor module specific to websockets.
- [secure-websocket-rpc](https://github.com/secure-local-node/secure-websocket-rpc): A precursor module specific to websockets.

## License

MIT
