const WebSocketServer = require('simple-websocket/server')
const server = new WebSocketServer({ port: 3000 })
const secureRPC = require('../../.')

server.on('connection', onconnection)

function onconnection (socket) {
  const rpc = secureRPC(socket, false)
  rpc.command('echo', (req) => {
    console.log(req)
    return req.arguments
  })
}
