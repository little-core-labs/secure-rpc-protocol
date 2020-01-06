const secureRPC = require('../../.')
const net = require('net')

const socket = new net.Socket()

socket.connect(8124, () => {
  const rpc = secureRPC(socket, true)

  rpc.sec.on('end', () => {
    console.log('noise-peer end')
  })

  rpc.sec.on('close', () => {
    console.log('noise-peer close')
    clearInterval(pinger)
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
