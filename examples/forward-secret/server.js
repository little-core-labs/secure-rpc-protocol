const secureRPC = require('../../.')
const net = require('net')
const runp = require('run-parallel')

const server = net.createServer({
  allowHalfOpen: true
}, (socket) => {
  // 'connection' listener.
  console.log('client connected')
  socket.on('close', () => {
    console.log('socket closed')
  })

  socket.on('connect', () => {
    console.log('socket connected')
  })

  socket.on('drain', () => {
    console.log('socket drain')
  })

  socket.on('end', () => {
    console.log('socket ended')
  })

  socket.on('error', (err) => {
    console.error('socket errored')
    console.error(err)
  })

  socket.on('lookup', (...args) => {
    console.log('socket lookup')
    console.log(args)
  })

  socket.on('ready', () => {
    console.log('socket ready')
  })

  socket.on('timeout', () => {
    console.log('socket timeout')
  })

  const rpc = secureRPC(socket, false)

  rpc.sec.on('end', () => {
    console.log('noise-peer end')
    rpc.sec.end(err => {
      if (err) {
        console.error('sec error:')
        console.error(err)
      }
      console.log(`session for ${client.id} is ended`)
    })
  })

  rpc.sec.on('close', () => {
    console.log('noise-peer close')
  })

  rpc.sec.on('error', (err) => {
    console.error('noise-peer errored')
    console.error(err)
  })

  rpc.sec.on('timeout', () => {
    console.error('noise-peer timeout')
    rpc.sec.end(err => {
      if (err) console.err(err)
      console.error('noise-peer ended after timeout')
    })
  })

  const client = {
    id: Math.random().toString(36).slice(2)
  }

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
    rpc.sec.end(err => {
      if (err) {
        console.error('sec error:')
        console.error(err)
      }
      console.log(`session for ${client.id} is ended`)
    })
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
