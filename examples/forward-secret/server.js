const secureRPC = require('../../.')
const net = require('net')

const server = net.createServer((socket) => {
  // 'connection' listener.
  console.log('client connected')
  socket.on('end', () => {
    console.log('client disconnected')
  })

  const rpc = secureRPC(socket, false)

  rpc.sec.on('error', err => {
    console.error(err)
  })

  rpc.command('echo', (req) => {
    return req.arguments
  })

  rpc.command('ping', (req) => {
    return 'pong'
  })
})

server.on('error', (err) => {
  throw err
})

server.listen(8124, () => {
  console.log('server bound')
})

process.once('SIGINT', quit)
process.once('SIGTERM', quit)

function quit () {
  server.close(() => {
    console.log('server gracefully shutdown')
    process.exit(0)
  })
}
