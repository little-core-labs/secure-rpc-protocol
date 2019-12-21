const protocol = require('rpc-protocol')
const Socket = require('simple-websocket')

const socket = new Socket('ws://localhost:3000')

socket.on('connect', () => {
  console.log('connected')
  const rpc = protocol({ socket })
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
    socket.end(() => {
      console.log('client gracefully shutdown')
      process.exit(0)
    })
  }
})
