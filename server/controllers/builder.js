require('dotenv').load()
var swig = require('swig')
var collections = ['merchants', 'promotions']
var db = require('mongojs').connect(process.env.DEALSBOX_MONGODB_URL, collections)
var fs = require('fs')
var path = require('path')
var Promise = require('es6-promise').Promise
var Factual = require('factual-api')
var factual = new Factual(process.env.FACTUAL_KEY, process.env.FACTUAL_SECRET)
const uploadToAmazon = require('./s3')

const yelp = require('yelp').createClient({
  consumer_key: process.env.CONSUMER_KEY,
  consumer_secret: process.env.CONSUMER_SECRET,
  token: process.env.TOKEN,
  token_secret: process.env.TOKEN_SECRET
})

module.exports = {
  builder: {
    payload: {
      output: 'stream',
      parse: true,
      allow: 'multipart/form-data'
    },
    handler: function (request, reply) {
      var yelpBizId
      var uploader

      var filename = payload.file.hapi.filename
      filename = deal_id + path.extname(filename)

      var imagePath = appRoot + '/public/images/' + filename || appRoot + '/deal_images/' + filename
      var file = fs.createWriteStream(imagePath)

      // begin amazon image upload processing
      payload.file.pipe(file)
        // stream.pipe(res)

      file.on('close', function () {
        uploader = uploadToAmazon(imagePath, deal_id)

        uploader.on('error', function (err) {
          console.error('unable to upload:', err.stack)
        })
        uploader.on('progress', function () {
          console.log('progress', uploader.progressMd5Amount,
            uploader.progressAmount, uploader.progressTotal)
        })
        uploader.on('end', function () {
          fs.unlinkSync(imagePath)
          deal.large_image = 'https://s3.amazonaws.com/dealsbox/' + deal_id
          deal.small_image = 'https://s3.amazonaws.com/dealsbox/' + deal_id

          if (payload.business_phone) { // search yelp for biz using business phone
            var cleanPhone = payload.business_phone.replace(/[^A-Z0-9]/ig, '')
            factual.get('/t/places-us', {
              q: cleanPhone
            }, function (error, res) {
              if (error) console.log(error)
              if (res.data.length === 1) {
                deal.hours = res.data[0].hours_display
                deal.zip_code = res.data[0].postcode
              }
              yelp.phone_search({
                phone: cleanPhone
              }, function (error, data) {
                if (error) console.log(error)
                if (data.businesses.length === 1) {
                  yelp.business(data.businesses[0].id, function (error, data) {
                    db.promotions.save(deal, function () {
                      return reply.redirect('/manage_deals')
                    })
                  })
                } else {
                  db.promotions.save(deal, function () {
                    return reply.redirect('/manage_deals')
                  })
                }

              })

            })

          } else {}

        })
      })
    }
  }
}