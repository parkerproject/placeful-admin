'use strict'
require('dotenv').load()
const collections = ['merchants', 'promotions']
const db = require('mongojs').connect(process.env.DEALSBOX_MONGODB_URL, collections)
const _ = require('lodash')

module.exports = {
  index: {
    handler: function (request, reply) {
      if (!request.auth.isAuthenticated) {
        return reply.redirect('/login')
      }

      let queryObj = { merchant_id: /^placeful.*/ } // {merchant_id: request.auth.credentials.business_id }

      db.promotions.find(queryObj, function (err, result) {
        if (err) console.log(err)
        reply.view('merchant/dashboard', {
          business_name: request.auth.credentials.business_name,
          business: request.auth.credentials,
          promos: result.length,
          role: request.auth.credentials.role
        })
      })
    },
    auth: 'session'
  }
}
