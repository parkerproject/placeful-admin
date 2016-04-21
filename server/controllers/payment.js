'use strict'
require('dotenv').load()
const collections = ['merchants']
const db = require('mongojs').connect(process.env.DEALSBOX_MONGODB_URL, collections)
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)

module.exports = {
  index: {
    handler: function (request, reply) {
      var customer = {
        email: request.payload.token.email,
        source: request.payload.token.id,
        metadata: {
          business_name: request.auth.credentials.business_name
        },
        plan: 'merchant00'
      }
      if (request.auth.credentials.subscriber === 'no' && request.payload.token.couponCode) {
        customer.coupon = request.payload.token.couponCode.toUpperCase()
      }

      stripe.customers.create(customer, function (err, customer) {
        if (err) {
          reply({
            status: 'failed'
          })
        }
        if (customer) {
          db.merchants.findAndModify({
            query: {
              business_id: request.auth.credentials.business_id
            },
            update: {
              $set: {
                subscriber: 'yes',
                referral_code: (request.payload.token.couponCode) ? request.payload.token.couponCode : '',
                stripe_id: customer.id
              }
            },
            new: true
          }, function (err, doc, lastErrorObject) {
            if (err) {
              reply({
                status: 'failed'
              })
            } else {
              reply({
                status: 'success'
              })
            }
          })
        }
      })
    },
    auth: 'session'
  }
}
