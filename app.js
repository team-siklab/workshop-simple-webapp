require('dotenv-defaults').config()

const express = require('express')
const server = express()
const PORT = process.env.PORT

// :: ---

// :: do some very rudimentary error catching
server.on('error', (err) => {
  console.error('An error occurred!')
  console.error(err)
})

// :: specify a directory for static files (e.g. HTML, CSS, JS)
server.use(express.static('public'))

// :: register route handlers
server.get('/hello', require('./src/handlers/helloworld'))
server.get('/computation', require('./src/handlers/computation'))

// :: start the server
server.listen(PORT, () => {
  console.log(`Web application listening on port ${PORT}.`)
})