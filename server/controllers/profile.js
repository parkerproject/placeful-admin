'use strict'
require('dotenv').load()
var collections = ['merchants']
var db = require('mongojs').connect(process.env.DEALSBOX_MONGODB_URL, collections)

module.exports = {
  index: {
    handler: function (request, reply) {
      if (request.method === 'get') {
        db.merchants.find({
          business_id: request.auth.credentials.business_id
        }).limit(1, function (err, result) {
          var merchant = result[0]
          reply.view('merchant/profile', {merchant: merchant})
        })
      }

      if (request.method === 'post') {
        let data = {
          description: request.payload.description,
          business_name: request.payload.business_name
        }

        db.merchants.update({business_id: request.payload.business_id}, {$set: data}, function () {
          return reply.redirect('/manage_deals')
        })
      }
    },
    auth: 'session'
  }

}
