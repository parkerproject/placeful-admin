'use strict'
require('dotenv').load()
const fs = require('fs')
const collections = ['merchants', 'promotions']
const db = require('mongojs').connect(process.env.DEALSBOX_MONGODB_URL, collections)
const request = require('request')
const s3 = require('s3')
const s3_client = require('./s3_client')

let uploadToAmazon = function (file, file_name) {
  let params = {
    localFile: file,

    s3Params: {
      Bucket: 'zeus00',
      Key: file_name,
      Expires: 60,
      ACL: 'public-read'
    },
  }
  let uploader = s3_client.uploadFile(params)

  return uploader
}

module.exports = (filepath, file_name) => {
  if (filepath === '') {
    return
  }

  let imagePath = appRoot + '/public/images/promotions/' + file_name + '.jpg'
  let body = fs.createWriteStream(imagePath)

  request(filepath).pipe(body)

  body.on('close', function () {
    let uploader = uploadToAmazon(imagePath, file_name)

    uploader.on('error', function (err) {
      console.error('unable to upload:', err.stack)
    })
    uploader.on('progress', function () {
      console.log('progress', uploader.progressMd5Amount, uploader.progressAmount, uploader.progressTotal)
    })
    uploader.on('end', function () {
      fs.unlinkSync(imagePath)
      db.promotions.update({
        deal_id: file_name
      }, {
        $set: {
          large_image: 'https://s3-us-west-2.amazonaws.com/zeus00/' + file_name
        }
      }, () => {
        console.log('image uploaded')
      })

    })
  })

}