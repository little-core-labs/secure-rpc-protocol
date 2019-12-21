const secureRPC = require('../../.')
const net = require('net')

const socket = new net.Socket()

socket.connect(8124, () => {
  const rpc = secureRPC(socket, true)
  rpc.call('echo', 'hello world', (err, res) => {
    if (err) return console.error(err)
    console.log(res) // [ 'hello world' ]
  })

  rpc.call('ping', null, receivePong)

  function receivePong (err, res) {
    if (err) console.error(err)
    console.log(res)
    setTimeout(() => {
      rpc.call('ping', null, receivePong)
    }, 5000)
  }

  process.once('SIGINT', quit)
  process.once('SIGTERM', quit)

  function quit () {
    rpc.sec.on('end', () => {
      console.log('client gracefully shutdown')
      process.exit(0)
    })
    rpc.sec.end()
  }
})
