const WebSocket = require('simple-websocket')
const protocol = require('rpc-protocol')
const peer = require('noise-peer')

const clientSocket = new WebSocket('ws://localhost:3000')
const sec = peer(clientSocket, true)

clientSocket.on('connect', onconnect)

function onconnect () {
  const rpc = protocol({ stream: sec })
  rpc.call('echo', 'hello world', (err, res) => {
    if (err) return console.error(err)
    console.log(res) // [ 'hello world' ]
  })
}
