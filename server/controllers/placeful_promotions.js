'use strict'
require('dotenv').load()
const collections = ['merchants', 'promotions']
const db = require('mongojs').connect(process.env.DEALSBOX_MONGODB_URL, collections)

module.exports = {
  deals: {
    handler: function (request, reply) {
      let queryObj = {
        merchant_id: new RegExp('placeful_', 'i')
      }

      if (!request.auth.credentials.role) {
        queryObj.merchant_id = request.auth.credentials.business_id
      }
      db.merchants.find({
        business_id: request.auth.credentials.business_id
      }).limit(1, function (err, result) {
        if (err) console.log(err)
        var now = new Date()
        now = now.toISOString()
        if (result != null && result.length !== 0) {
          if (result[0].subscriber === 'no') {
            return reply.redirect('/payment')
          } else {
            db.promotions.find(queryObj).sort({
              start_date: 1,
              approved: false
            }, function (err, deals) {
              if (err) console.log(err)

              reply.view('merchant/manage_deals', {
                deals: deals,
                business_name: request.auth.credentials.business_name,
                business_email: request.auth.credentials.business_email,
                role: request.auth.credentials.role,
                text: 'created by Placeful'
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
