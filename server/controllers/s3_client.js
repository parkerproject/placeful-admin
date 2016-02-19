'use strict'
require('dotenv').load()

const s3 = require('s3')

module.exports = () => {
  let s3_client = s3.createClient({
    s3Options: {
      accessKeyId: process.env.AMAZON_ACCESS_KEY_ID,
      secretAccessKey: process.env.AMAZON_SECRET_ACCESS_KEY
    }
  })
  return s3_client
}