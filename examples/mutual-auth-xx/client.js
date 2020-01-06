const secureRPC = require('../../.')
const net = require('net')
const { client, server } = require('./preshared-keys.js')

const socket = new net.Socket()

socket.connect(8124, () => {
  const rpc = secureRPC(socket, true, {
    pattern: 'XX',
    staticKeyPair: client,
    onstatickey (remoteKey, done) {
      if (remoteKey.equals(server.publicKey)) {
        console.log(`server authenticated as ${remoteKey.toString('hex')}`)
        return done()
      }

      return done(new Error('Unauthorized key'))
    }
  })

  socket.on('close', () => {
    console.log('underlying socket close')
    clearInterval(pinger)
  })

  rpc.sec.on('end', () => {
    console.log('noise-peer received end packet')
  })

  rpc.sec.on('error', (err) => {
    // handle secure socket errors if you want
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

  rpc.call('echo', 'hello world', (err, res) => {
    if (err) return console.error(err)
    console.log(res) // [ 'hello world' ]
  })

  function receivePong (err, res) {
    if (err) console.error(err)
    console.log(res)
  }

  const pinger = setInterval(() => {
    rpc.call('ping', null, receivePong)
  }, 1000)

  process.once('SIGINT', quit)
  process.once('SIGTERM', quit)

  function quit () {
    clearInterval(pinger)
    rpc.sec.end(() => {
      console.log('client sent `FINISH` message')
    })
  }
})
