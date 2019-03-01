require('isomorphic-fetch')

const getInstanceId = () => {
  return new Promise((resolve, reject) => {
    fetch('http://169.254.169.254/latest/meta-data/instance-id')
      .then(response => {
        if (response.status >= 400) { resolve('LOCAL') }
        else { resolve(response.text()) }
      })
      .catch(() => resolve('LOCAL'))
  })
}

const helloworldHandler = async (req, res) => {
  const instanceid = await getInstanceId()
  res.send(`
${instanceid}
-----------------------------------------
Hello world!`)
}

module.exports = helloworldHandler