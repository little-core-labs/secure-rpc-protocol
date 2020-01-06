const tap = require('tap')
const secureRPC = require('.')
const net = require('net')

tap.test('api exports', async t => {
  t.equal(typeof secureRPC, 'function', 'main export is the rpc function')
  t.equal(typeof secureRPC.peer, 'function', 'peer export is included')
})

tap.test('server ends', t => {
  const clientSock = new net.Socket()
  let serverRPC
  const server = net.createServer((socket) => {
    const rpc = secureRPC(socket, false)
    serverRPC = rpc

    rpc.sec.on('error', (err) => {
      t.fail(err, 'No errors fro the server allowed')
    })

    rpc.command('echo', (req) => {
      t.pass(req.arguments, 'received an echo command')
      return req.arguments
    })
  })

  server.on('error', (err) => {
    t.fail(err, 'Server should not emit an error')
  })

  server.listen(8124, () => {
    t.pass('server started')

    clientSock.connect(8124, () => {
      const clientRpc = secureRPC(clientSock, true)
      clientRpc.sec.on('error', (err) => {
        t.fail(err, 'client should not error')
      })

      clientSock.on('close', () => {
        t.pass('client socket closed')
        server.close((err) => {
          t.error(err, 'no error when closing the server')
          t.end('client is closed')
        })
      })

      clientRpc.call('echo', 'hello world', (err, res) => {
        t.error(err, 'no error returned')
        t.deepEqual(res, ['hello world'], 'echo server works')

        // server closes connection
        setTimeout(() => { // Not sure why this is needed.
          serverRPC.sec.end(() => {
            t.pass('server ended client session')
          })
        }, 100)
      })
    })
  })
})

tap.test('client ends', t => {
  const clientSock = new net.Socket()
  const server = net.createServer((socket) => {
    const rpc = secureRPC(socket, false)

    rpc.sec.on('error', (err) => {
      t.fail(err, 'No errors fro the server allowed')
    })

    rpc.command('echo', (req) => {
      t.pass(req.arguments, 'received an echo command')
      return req.arguments
    })

    clientSock.on('close', () => {
      server.close((err) => {
        t.error(err, 'no error when closing the server')
        t.end('server is closed')
      })
    })
  })

  server.on('error', (err) => {
    t.fail(err, 'Server should not emit an error')
  })

  server.listen(8124, () => {
    t.pass('server started')

    clientSock.connect(8124, () => {
      const clientRpc = secureRPC(clientSock, true)
      clientRpc.sec.on('error', (err) => {
        t.fail(err, 'client should not error')
      })

      clientSock.on('close', () => {
        t.pass('client socket closed')
      })

      clientRpc.call('echo', 'hello world', (err, res) => {
        t.error(err, 'no error returned')
        t.deepEqual(res, ['hello world'], 'echo server works')

        // server closes connection
        setTimeout(() => { // Not sure why this is needed.
          clientRpc.sec.end(() => {
            t.pass('client ended client session')
          })
        }, 100)
      })
    })
  })
})
