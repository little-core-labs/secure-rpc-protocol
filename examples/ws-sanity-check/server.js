const protocol = require('rpc-protocol')
const Server = require('simple-websocket/server')

const server = new Server({ port: 3000 })

server.on('connection', (socket) => {
  // 'connection' listener.
  console.log('client connected')
  socket.on('end', () => {
    console.log('client disconnected')
  })

  socket.on('data', console.log)

  const rpc = protocol({ socket })

  rpc.command('echo', (req) => {
    console.log(req)
    return req.arguments
  })

  rpc.command('ping', (req) => {
    console.log(req)
    return 'pong'
  })
})

server.on('error', (err) => {
  throw err
})

process.once('SIGINT', quit)
process.once('SIGTERM', quit)

function quit () {
  server.close(() => {
    console.log('server gracefully shutdown')
    process.exit(0)
  })
}
