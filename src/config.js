const { AWS_ACCESS_KEY, AWS_SECRET_ACCESS_KEY } = process.env

module.exports = () => {
  // :: failsafe
  if (!AWS_ACCESS_KEY || !AWS_SECRET_ACCESS_KEY) return

  const aws = require('aws-sdk')
  aws.config.update({
    accessKeyId: AWS_ACCESS_KEY,
    secretAccessKey: AWS_SECRET_ACCESS_KEY
  })
}