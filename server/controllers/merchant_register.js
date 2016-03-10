'use strict'
require('dotenv').load()
const collections = ['merchants']
const db = require('mongojs').connect(process.env.DEALSBOX_MONGODB_URL, collections)
const bcrypt = require('bcrypt-nodejs')
const randtoken = require('rand-token')
const _request = require('request')
const _ = require('lodash')
const template = require('./template')
const sendEmail = require('./send_email')

module.exports = {
  index: {
    handler: function (request, reply) {
      reply.view('merchant/register', {
        _class: 'login-page'
      })
    },
    app: {
      name: 'register'
    }
  },

  register_post: {
    handler: function (request, reply) {
      let password = request.payload.password
      let hash = bcrypt.hashSync(password)

      db.merchants.find({
        business_email: request.payload.business_email
      }).limit(1, function (err, results) {
        if (results.length === 0) {
          var data = {
            secret: process.env.Recaptcha_SECRET,
            response: request.payload['g-recaptcha-response']
          }
          _request.post({
            url: 'https://www.google.com/recaptcha/api/siteverify',
            formData: data
          }, function (err, httpResponse, body) {
            if (err) console.log(err)
            let business_name = (request.payload.business_place !== '') ? request.payload.business_place : request.payload.business_name

            let hashtags = (request.payload.business_hashtags).toLowerCase()
            let businessObject = {
              business_name: business_name,
              business_email: request.payload.business_email,
              business_phone: request.payload.business_phone,
              business_map: request.payload.business_map,
              business_address: request.payload.business_address,
              business_icon: request.payload.business_icon,
              business_locality: request.payload.business_locality,
              followers: [],
              subscriber: 'no',
              password: hash,
              referral_code: '',
              referral_code_redeemed: 0,
              business_id: randtoken.generate(20),
              agreement: request.payload.agreement,
              website: request.payload.website,
              tags: _.words(hashtags),
              approved: false

            }

            if (request.payload.business_lat && request.payload.business_lng) {
              businessObject.loc = {
                type: 'Point',
                coordinates: [Number(request.payload.business_lng), Number(request.payload.business_lat)]
              }
            }

            if (JSON.parse(body).success) {
              db.merchants.save(businessObject, function () {
                let html = template(appRoot + '/server/views/welcome_email.html', {})
                sendEmail(request.payload.business_email, 'Welcome to Placeful', html)
                reply('success')
              })
            } else {
              reply('You failed the reCAPTCHA question, try again')
            }
          })
        } else {
          reply('Already registered, Login to access account')
        }
      })

    }

  }

}