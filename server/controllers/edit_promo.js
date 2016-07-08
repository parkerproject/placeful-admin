'use strict'
require('dotenv').load()
const collections = ['promotions', 'merchants']
const db = require('mongojs').connect(process.env.DEALSBOX_MONGODB_URL, collections)
const slug = require('slug')
const cloudinary = require('./cloudinary')
const fs = require('fs')
const geocoderProvider = 'google'
const httpAdapter = 'https'
const extra = {
  apiKey: process.env.GOOGLE_API_KEY,
  formatter: null
}
const geocoder = require('node-geocoder')(geocoderProvider, httpAdapter, extra)
const endTimeString = require('./end_time')

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
      let category = []

      let edits = {
        description: data.description,
        fine_print: data.fine_print,
        title: data.title,
        slug: slug(data.title),
        approved: data.approved === 'true' ? true : false
      // merchant_category: category.push(data.category),
      // start_time: data.start_time,
      // end_time: data.end_time,
      // endTimeString: endTimeString(data.end_time)
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

            let basePath = 'http://res.cloudinary.com/placeful/image/upload/'
            let lastPath = (result.url).split(basePath)[1]
            let icon = `${basePath}c_fill,h_50,w_50/${lastPath}`
            edits.merchant_icon = icon

            geocoder.geocode(data.merchant_address).then((res) => {
              let longitude = res[0].longitude
              let latitude = res[0].latitude
              edits.loc = {
                type: 'Point',
                coordinates: [longitude, latitude]
              }

              db.promotions.findAndModify({
                query: { deal_id: data.deal_id },
                update: { $set: edits },
                new: false
              }, function (err, doc, lastErrorObject) {
                if (err)console.log(err)
                db.merchants.findAndModify({
                  query: { deal_id: data.merchant_id },
                  update: { $set: { business_icon: icon, loc: edits.loc} },
                  new: false
                }, function (err, doc, lastErrorObject) {
                  if (err)console.log(err)
                  return reply.redirect('/manage_deals')
                })
              })
            }).catch(function (err) {
              console.log(err)
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
