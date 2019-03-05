const multer = require('multer')
const multerS3 = require('multer-s3')
const aws = require('aws-sdk')

const s3 = new aws.S3()

// :: ---

const upload = multer({
  storage: multerS3({
    s3,
    bucket: process.env.AWS_UPLOAD_BUCKET_NAME,
    acl: 'public-read',
    metadata: (_, file, cb) => cb(null, { fieldName: file.fieldname }),
    key: (_, file, cb) => cb(null, Date.now().toString())
  })
})

module.exports = upload