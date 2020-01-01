const secureRPC = require('../../.')
const net = require('net')

const server = net.createServer((socket) => {
  // 'connection' listener.
  const client = {
    id: Math.random().toString(36).slice(2)
  }
  console.log(`client ${client.id} connected`)

  const rpc = secureRPC(socket, false)

  rpc.sec.on('close', () => {
    console.log('noise-peer close')
  })

  rpc.sec.on('error', (err) => {
    console.error('noise-peer errored')
    console.error(err)
  })

  rpc.sec.on('timeout', () => {
    console.error('noise-peer timeout')
    rpc.sec.end(() => console.error('noise-peer ended after timeout'))
  })

  rpc.command('echo', (req) => {
    console.log(req.arguments)
    return req.arguments
  })

  rpc.command('ping', (req) => {
    console.log(`ping ${client.id}`)
    return 'pong'
  })

  process.once('SIGINT', endSession)
  process.once('SIGTERM', endSession)

  function endSession () {
    console.error(`ending session for ${client.id}:`)
    rpc.sec.end(() => console.log(`session for ${client.id} is ended`))
  }
})

server.on('error', (err) => {
  console.error('server error:')
  console.error(err)
})

server.listen(8124, () => {
  console.log('server listening on 8124')
})

process.once('SIGINT', quit)
process.once('SIGTERM', quit)

function quit () {
  console.log('server is shutting down')
  server.close((err) => {
    if (err) throw err
    console.log('server gracefully shutdown')
    process.exit(0)
  })
}
