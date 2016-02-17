'use strict'
require('dotenv').load()
const fs = require('fs')
const AWS = require('aws-sdk')
const collections = ['merchants', 'promotions']
const db = require('mongojs').connect(process.env.DEALSBOX_MONGODB_URL, collections)

AWS.config.region = 'us-west-2'

var uploadToAmazon = function (file, file_name, body) {
  let s3obj = new AWS.S3({
    params: {
      Bucket: 'zeus00',
      Key: file_name,
      ACL: 'public-read'
    }
  })

  s3obj.upload({
    Body: body
  }).on('httpUploadProgress', function (evt) {
    console.log('file upload in progress')
  }).send(function (err, data) {
    console.log(err, data)
      // db.promotions.update({
      //   deal_id: file_name
      // }, {
      //   $set {
      //     large_image: data.location
      //   }
      // }, () => {
      //   console.log('image uploaded')
      // })

  })

}

module.exports = (filepath, file_name) => {
  if (photo === '') {
    return
  }

  let body = fs.createReadStream(filepath)
  uploadToAmazon(filepath, file_name, body)
}