const upload = require('../utils/upload')
const singleupload = upload.single('image')

const handler = (req, res) => {
  singleupload(req, res, (err, some) => {
    if (err) {
      const errors = [{
        title: 'Image Upload Error',
        details: err.message
      }]

      return res.status(422).send({ errors })
    }

    // :: ---

    return res.json({ imageUrl: req.file.location })
  })
}

module.exports = handler