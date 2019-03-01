const { spawn } = require('threads')

const computation = () => {
  const thread = spawn((input, done) => {
    const limit = 1e6
    let lasthash = ''

    for (var i = 0; i < limit; i++) {
      lasthash = require('crypto')
        .createHash('md5')
        .update(lasthash + new Date())
        .digest('hex')
    }

    done(lasthash)
  })

  // :: ---
  return new Promise((resolve, reject) => {
    thread.on('message', (response) => {
      console.log(`Thread returned response: ${response}`)
      resolve(response)
      thread.kill()
    })

    thread.on('exit', () => console.log('Worker terminated.'))

    // :: start the thread
    thread.send()
  })
}

const handler = async (req, res) => {
  const result = await computation()
  res.send(result)
}

module.exports = handler