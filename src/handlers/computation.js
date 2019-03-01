const computation = () => {
  const limit = 1e6

  return new Promise((resolve, reject) => {
    // :: this is a deliberately long, inefficient computation
    let lasthash = ''

    for (var i = 0; i < limit; i++) {
      lasthash = require('crypto')
        .createHash('md5')
        .update(lasthash + new Date())
        .digest('hex')
    }

    resolve(lasthash)
  })
}

const handler = async (req, res) => {
  const result = await computation()
  res.send(result)
}

module.exports = handler