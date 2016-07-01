'use strict'
require('dotenv').load()
const collections = ['promotions']
const db = require('mongojs').connect(process.env.DEALSBOX_MONGODB_URL, collections)
const slug = require('slug')
const cloudinary = require('./cloudinary')
const fs = require('fs')

module.exports = {
  index: {
    handler: function (request, reply) {
      if (!request.auth.isAuthenticated) {
        return reply.redirect('/login')
      }
      let id = request.params.promotion_id
      db.promotions.find({deal_id: id}, function (err, deal) {
        if (err) console.log(err)
        reply.view('merchant/edit_promotion', {
          deal: deal[0],
          business_name: request.auth.credentials.business_name
        })
      })
    },
    auth: 'session'
  },

  update: {
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
        fine_print: data.fine_print,
        title: data.title,
        slug: slug(data.title),
        approved: data.approved === 'true' ? true : false
      }

      if (data.photo.hapi.filename && data.photo.hapi.filename !== '') {
        let name = data.photo.hapi.filename
        let path = appRoot + '/uploads/' + name
        let file = fs.createWriteStream(path)
        data.photo.pipe(file)

        data.photo.on('end', function (err) {
          if (err) console.log(err)
          cloudinary.uploader.upload(path, function (result) {
            fs.unlinkSync(path)
            edits.large_image = result.url
            db.promotions.findAndModify({
              query: { deal_id: data.deal_id },
              update: { $set: edits },
              new: false
            }, function (err, doc, lastErrorObject) {
              if (err)console.log(err)
              return reply.redirect('/manage_deals')
            })
          })
        })
      } else {
        db.promotions.findAndModify({
          query: { deal_id: data.deal_id },
          update: { $set: edits },
          new: false
        }, function (err, doc, lastErrorObject) {
          if (err)console.log(err)
          return reply.redirect('/manage_deals')
        })
      }
    },
    auth: 'session'
  }
}
