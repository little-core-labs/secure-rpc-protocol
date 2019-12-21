const WebSocketServer = require('simple-websocket/server')
const protocol = require('rpc-protocol')
const server = new WebSocketServer({ port: 3000 })
const peer = require('noise-peer')

server.on('connection', onconnection)

function onconnection (socket) {
  const sec = peer(socket, false)
  const rpc = protocol({ stream: sec })
  rpc.command('echo', (req) => {
    console.log(req)
    return req.arguments
  })
}
