require('dotenv').load()
var swig = require('swig')
var collections = ['merchants', 'deals']
var db = require('mongojs').connect(process.env.DEALSBOX_MONGODB_URL, collections)
var randtoken = require('rand-token')
var fs = require('fs')
var path = require('path')
var s3 = require('s3')
var http = require('http')
var https = require('https')
var _request = require('request')
var querystring = require('querystring')
var Promise = require('es6-promise').Promise
var Factual = require('factual-api')
var factual = new Factual(process.env.FACTUAL_KEY, process.env.FACTUAL_SECRET)

http.globalAgent.maxSockets = https.globalAgent.maxSockets = 20
var yelp = require('yelp').createClient({
  consumer_key: process.env.CONSUMER_KEY,
  consumer_secret: process.env.CONSUMER_SECRET,
  token: process.env.TOKEN,
  token_secret: process.env.TOKEN_SECRET
})

var s3_client = s3.createClient({
  s3Options: {
    accessKeyId: process.env.AMAZON_ACCESS_KEY_ID,
    secretAccessKey: process.env.AMAZON_SECRET_ACCESS_KEY
  },
})

var uploadToAmazon = function (file, file_name) {
  var params = {
    localFile: file,

    s3Params: {
      Bucket: 'dealsbox',
      Key: file_name,
      Expires: 60,
      ACL: 'public-read'
    },
  }
  var uploader = s3_client.uploadFile(params)

  return uploader
}

module.exports = {
  index: {
    handler: function (request, reply) {
      if (!request.auth.isAuthenticated) {
        return reply.redirect('/login')
      }

      db.merchants.find({
        business_id: request.auth.credentials.business_id
      }).limit(1, function (err, result) {
        var now = new Date()
        now = now.toISOString()
        if (result[0] != null) {
          if (result[0].current_period_end < now || result[0].subscriber === 'no') {
            return reply.redirect('/payment')
          } else {
            reply.view('merchant/add_deal', {
              _class: 'login-page',
              business_email: request.auth.credentials.business_email,
              yelp_URL: request.auth.credentials.yelp_URL,
              business_name: request.auth.credentials.business_name,
              business_id: request.auth.credentials.business_id,
              business_map: request.auth.credentials.business_map,
              business_lat: request.auth.credentials.business_lat,
              business_lng: request.auth.credentials.business_lng,
              business_phone: request.auth.credentials.business_phone,
              business_address: request.auth.credentials.business_address,
              business_icon: request.auth.credentials.business_icon,
              business_locality: request.auth.credentials.business_locality
            })
          }

        } else {
          request.auth.session.clear()
          return reply.redirect('/login')
        }

      })

    },
    auth: 'session'
  },

  edit: {
    handler: function (request, reply) {
      if (!request.auth.isAuthenticated) {
        return reply.redirect('/login')
      }

      if (request.query.id) {
        db.deals.find({
          deal_id: request.query.id,
          merchant_id: request.auth.credentials.business_id
        }).limit(1, function (err, result) {
          if (err) console.log(err)
          if (result == null) {
            reply.redirect('/builder')
          } else {
            var hasDealStarted = new Date() > new Date(result[0].start_date)

            reply.view('merchant/edit_deal', {
              _class: 'login-page',
              business_email: request.auth.credentials.business_email,
              yelp_URL: request.auth.credentials.yelp_URL,
              business_name: request.auth.credentials.business_name,
              business_id: request.auth.credentials.business_id,
              deal: result[0],
              hasDealStarted: hasDealStarted
            })

          }

        })
      } else {
        reply('How did you arrive here?')
      }

    },
    auth: 'session'
  },

  edit_post: {
    payload: {
      output: 'stream',
      parse: true,
      allow: 'multipart/form-data'
    },
    handler: function (request, reply) {
      if (!request.auth.isAuthenticated) {
        return reply.redirect('/login')
      }

      var payload = request.payload

      if (payload.nonhumans.length === 0) {
        var deal_id = payload.deal_id
        var deal = {}

        if (payload.deal_date) {
          var start_date = payload.deal_date.split('-')[0]
          var end_date = payload.deal_date.split('-')[1]
          var d = new Date()
          var date_edited = d.toISOString()
          deal.start_date = start_date.trim()
          deal.date_edited = date_edited
          deal.expires_at = end_date.trim()
        }

        if (payload.title) deal.title = payload.title
        if (payload.description) deal.description = payload.description
        if (payload.fine_print) deal.fine_print = payload.fine_print
        if (payload.publish) deal.published = payload.publish

        if (payload.file && payload.file.hapi.filename.length !== 0) {
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
            })
          })
        }

        db.deals.findAndModify({
          query: {
            deal_id: deal_id,
            merchant_id: request.auth.credentials.business_id
          },
          update: {
            $set: deal
          },
          new: true
        }, function (err, doc, lastErrorObject) {
          return reply.redirect('/manage_deals')
        })
      }

    },
    auth: 'session'
  },

  delete_deal: {
    handler: function (request, reply) {
      var deal_id = request.payload.deal_id
      var merchant_id = request.payload.merchant_id

      var params = {
        s3Params: {
          Bucket: 'dealsbox',
          Delete: {
            Objects: [{
              Key: deal_id,
            }]
          }
        }
      }

      s3_client.deleteObjects(params.s3Params, function (err, data) {
        if (err) console.log(err)
        console.log('deleted deal from amazon')
      })

      db.deals.remove({
        deal_id: deal_id,
        merchant_id: merchant_id
      }, {}, function () {
        reply('deal deleted')
      })
    },
    auth: 'session'
  },

  builder: {
    payload: {
      output: 'stream',
      parse: true,
      allow: 'multipart/form-data'
    },
    handler: function (request, reply) {
      var deal_id = ''
      deal_id = randtoken.generate(12)
      var payload = request.payload
      var yelpBizId
      var offer
      var uploader

      if (payload.nonhumans.length === 0) {
        var start_date = request.payload.deal_date.split('-')[0]
        var end_date = request.payload.deal_date.split('-')[1]
        var d = new Date()
        var insert_date = d.toISOString()

        if (payload.discount_type === '%') {
          offer = payload.discount_value + payload.discount_type + ' Off'
        }
        if (payload.discount_type === '$') {
          offer = payload.discount_type + payload.discount_value + ' Off'
        }

        var deal = {
          insert_date: insert_date,
          coupon: 'yes',
          offer: offer,
          coupon_code: payload.coupon_code,
          deal_id: deal_id,
          loc: {
            type: 'Point',
            coordinates: [Number(payload.business_lng), Number(payload.business_lat)]
          },
          title: payload.title,
          provider_name: 'DEALSBOX',
          merchant_locality: payload.business_locality,
          merchant_name: payload.business_name,
          merchant_id: payload.business_id,
          large_image: '',
          description: payload.description,
          fine_print: payload.fine_print,
          expires_at: end_date.trim(),
          published: payload.publish,
          start_date: start_date.trim(),
          phone: payload.business_phone,
          category_name: payload.category,
          url: 'http://dealsbox.co/',
          small_image: payload.business_icon,
          merchant_address: payload.business_address,
          zip_code: ''
        }
        if (payload.file) {
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
                        if (payload.business_lng == '' || payload.business_lat == '') {
                          deal.loc = {
                            type: 'Point',
                            coordinates: [data.location.coordinate.longitude, data.location.coordinate.latitude]
                          }
                        }

                        if (payload.business_locality == '') {
                          deal.merchant_locality = data.location.city
                        }

                        db.deals.save(deal, function () {
                          return reply.redirect('/manage_deals')
                        })
                      })
                    } else {
                      db.deals.save(deal, function () {
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
  },

  searchYelpPhone: {
    handler: function (request, reply) {
      var cleanPhone = request.query.phone.replace(/[^A-Z0-9]/ig, '')
      yelp.phone_search({
        phone: cleanPhone
      }, function (error, data) {
        if (error) console.log({
          error_message: error
        })
        if (data.businesses[0] != null) {
          yelp.business(data.businesses[0].id, function (err, data) {
            if (err) return console.log(error)
            reply(data)
          })
        } else {
          reply(null)
        }
      })
    }
  },

  deals: {
    handler: function (request, reply) {
      db.merchants.find({
        business_id: request.auth.credentials.business_id
      }).limit(1, function (err, result) {
        if (err) console.log(err)
        var now = new Date()
        now = now.toISOString()
        if (result[0] != null) {
          if (result[0].current_period_end < now || result[0].subscriber === 'no') {
            return reply.redirect('/payment')
          } else {
            db.deals.find({
              merchant_id: request.auth.credentials.business_id
            }, function (err, deals) {
              if (err) console.log(err)
              reply.view('merchant/manage_deals', {
                deals: deals,
                business_name: request.auth.credentials.business_name,
                business_email: request.auth.credentials.business_email
              })
            })
          }
        } else { // could find session
          request.auth.session.clear()
          return reply.redirect('/login')
        }

      })

    },
    auth: 'session'
  }
}