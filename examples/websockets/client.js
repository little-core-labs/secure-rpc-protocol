const WebSocket = require('simple-websocket')
const secureRPC = require('../../.')

const clientSocket = new WebSocket('ws://localhost:3000')

clientSocket.on('connect', onconnect)

function onconnect () {
  const rpc = secureRPC(clientSocket, true)
  rpc.call('echo', 'hello world', (err, res) => {
    if (err) return console.error(err)
    console.log(res) // [ 'hello world' ]
  })
}
