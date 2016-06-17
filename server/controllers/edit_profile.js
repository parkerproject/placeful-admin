/* global appRoot */
'use strict'
require('dotenv').load()
const collections = ['merchants', 'promotions']
const db = require('mongojs').connect(process.env.DEALSBOX_MONGODB_URL, collections)
const cloudinary = require('./cloudinary')
const fs = require('fs')

module.exports = {
  index: {
    payload: {
      output: 'stream',
      parse: true,
      allow: 'multipart/form-data'
    },
    handler: function (request, reply) {
      if (!request.auth.isAuthenticated) {
        return reply.redirect('/login')
      }
      const data = request.payload

      let edits = {
        description: data.description,
        business_name: data.business_name,
        tags: data.tags.split(',')
      }

      if (data.photo.hapi.filename && data.photo.hapi.filename !== '') {
        let name = data.photo.hapi.filename
        let path = appRoot + '/uploads/' + name
        let file = fs.createWriteStream(path)
        data.photo.pipe(file)

        data.photo.on('end', function (err) {
          if (err) console.log(err)
          cloudinary.uploader.upload(path, function (result) {
            console.log(result)
            fs.unlinkSync(path)
            let large_image = result.url.replace('http://res.cloudinary.com/placeful/image/upload', 'http://res.cloudinary.com/placeful/image/upload/c_fill,h_71,w_71')
            edits.business_icon = large_image

            db.merchants.update({business_id: request.auth.credentials.business_id}, {$set: edits}, function () {
              db.promotions.update({merchant_id: request.auth.credentials.business_id}, {$set: {merchant_name: request.auth.credentials.business_name}}, function () {
                return reply.redirect('/manage_deals')
              })
            })
          })
        })
      } else {
        db.merchants.update({business_id: request.auth.credentials.business_id}, {$set: edits}, function () {
          db.promotions.update({merchant_id: request.auth.credentials.business_id}, {$set: {merchant_name: request.auth.credentials.business_name}}, function () {
            return reply.redirect('/manage_deals')
          })
        })
      }
    },
    auth: 'session'
  }
}
