require('dotenv').load()
var swig = require('swig')
var collections = ['merchants', 'promotions']
var db = require('mongojs').connect(process.env.DEALSBOX_MONGODB_URL, collections)
var randtoken = require('rand-token')
var fs = require('fs')
var path = require('path')
var http = require('http')
var https = require('https')
var _request = require('request')
var querystring = require('querystring')
var Promise = require('es6-promise').Promise
var Factual = require('factual-api')
var factual = new Factual(process.env.FACTUAL_KEY, process.env.FACTUAL_SECRET)
const uploadToAmazon = require('./s3')

http.globalAgent.maxSockets = https.globalAgent.maxSockets = 20
var yelp = require('yelp').createClient({
  consumer_key: process.env.CONSUMER_KEY,
  consumer_secret: process.env.CONSUMER_SECRET,
  token: process.env.TOKEN,
  token_secret: process.env.TOKEN_SECRET
})

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
        if (result != null) { // keeps failing here
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
              business_locality: request.auth.credentials.business_locality,
              form_id: process.env.FORM_ID,
              promotion_id: randtoken.generate(12)
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

      db.promotions.remove({
        deal_id: deal_id,
        merchant_id: merchant_id
      }, {}, function () {
        reply('deal deleted')
      })
    },
    auth: 'session'
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
        if (result != null) {
          if (result[0].current_period_end < now || result[0].subscriber === 'no') {
            return reply.redirect('/payment')
          } else {
            db.promotions.find({
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