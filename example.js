const WebSocketServer = require('simple-websocket/server')
const WebSocket = require('simple-websocket')
const protocol = require('rpc-protocol')
const server = new WebSocketServer({ port: 3000 })
const peer = require('noise-peer')

server.on('connection', onconnection)

function onconnection (socket) {
  const sec = peer(socket, false)
  const rpc = protocol({ stream: sec })
  rpc.command('echo', (req) => {
    return req.arguments
  })
}

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
