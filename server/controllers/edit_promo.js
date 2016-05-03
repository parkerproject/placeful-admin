'use strict'
require('dotenv').load()
const collections = ['promotions']
const db = require('mongojs').connect(process.env.DEALSBOX_MONGODB_URL, collections)
module.exports = {
  index: {
    handler: function (request, reply) {
      if (!request.auth.isAuthenticated) {
        return reply.redirect('/login')
      }
      let id = request.params.promotion_id
      db.promotions.find({deal_id: id}, function (err, deal) {
        if (err) console.log(err)
        reply.view('merchant/edit_promotion', { deal: deal[0]})
      })

    },
    auth: 'session'
  },

  update: {
    handler: function (request, reply) {
      let data = {
        description: request.payload.description,
        fine_print: request.payload.fine_print,
        title: request.payload.title
      }

      db.promotions.update({deal_id: request.payload.deal_id, merchant_id: request.auth.credentials.business_id}, {$set: data}, function () {
        return reply.redirect('/manage_deals')
      })
    },
    auth: 'session'
  }
}
