require('dotenv').load()
var collections = ['merchants']
var db = require('mongojs').connect(process.env.DEALSBOX_MONGODB_URL, collections)
var stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
var moment = require('moment')

module.exports = {
  index: {
    handler: function (request, reply) {
      var customer = {
        email: request.payload.token.email,
        source: request.payload.token.id,
        metadata: {
          business_id: request.auth.credentials.business_id
        },
        plan: 'merchant00'
      }

      if (request.auth.credentials.subscriber === 'no' && request.payload.token.couponCode) {
        customer.coupon = request.payload.token.couponCode.toUpperCase()
      }

      stripe.customers.create(customer, function (err, customer) {
        if (err) console.log(err)

        if (customer) {
          var current_period_end = moment.unix(customer.subscriptions.data[0].current_period_end)

          db.merchants.findAndModify({
            query: {
              business_id: request.auth.credentials.business_id
            },
            update: {
              $set: {
                subscriber: 'yes',
                current_period_end: current_period_end.format(),
                referral_code_redeemed: 1
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
        } else {
          reply({
            status: 'failed'
          })
        }

      })

    },
    auth: 'session'
  }
}