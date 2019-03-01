const computation = (req, res) => {
  const limit = 1e6

  // :: this is a deliberately long, inefficient computation
  let lasthash = ''

  for (var i = 0; i < limit; i++) {
    lasthash = require('crypto')
      .createHash('md5')
      .update(lasthash + new Date())
      .digest('hex')
  }

  res.send(lasthash)
}

module.exports = computation