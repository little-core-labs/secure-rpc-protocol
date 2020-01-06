const secureRPC = require('../../.')
const net = require('net')
const { client: c, server: s } = require('./preshared-keys.js')

const server = net.createServer((socket) => {
  // 'connection' listener.
  const client = {
    id: Math.random().toString(36).slice(2)
  }
  console.log(`client ${client.id} connected`)

  const rpc = secureRPC(socket, false, {
    pattern: 'XX',
    staticKeyPair: s,
    onstatickey (remoteKey, done) {
      if (remoteKey.equals(c.publicKey)) {
        console.log(`client ${client.id} authenticated: ${remoteKey.toString('hex')}`)
        return done()
      }

      console.log(`client ${client.id} unknown`)
      return done(new Error('Unauthorized key'))
    }
  })

  socket.on('close', () => {
    console.log(`socket closed for ${client.id}`)
    // clean up any remaining listeners when the socket is closed
    process.removeListener('SIGINT', endSession)
    process.removeListener('SIGTERM', endSession)
  })

  rpc.sec.on('end', () => {
    console.log(`noise-peer received end packet for ${client.id}`)
  })

  rpc.sec.on('error', (err) => {
    // handle secure socket errors if you want
    console.error(`noise-peer client ${client.id} errored`)
    console.error(err)
  })

  rpc.sec.on('timeout', () => {
    // handle timeouts if you need to
    console.error(`noise-peer ${client.id} timeout`)
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
    // End sessions from the secure stream
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
    // Runs after all sessions are ended.  You should set up session
    // signalling  or listen to the same ending signal from the session.
    if (err) throw err
    console.log('server gracefully shutdown')
  })
}
