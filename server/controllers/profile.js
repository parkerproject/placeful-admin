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
      db.merchants.find({
        business_id: request.auth.credentials.business_id
      }).limit(1, function (err, result) {
        if (err) console.log(err)
        var merchant = result[0]
        reply.view('merchant/profile', {
          merchant: merchant,
          tags: (_.isArray(merchant.tags)) ? merchant.tags.join(',') : '',
          placeholder_img: merchant.business_icon == null ? 'http://placehold.it/350x350' : merchant.business_icon,
          upload_text: merchant.business_icon == null ? 'Upload profile photo(100px by 100px)' : 'Change profile photo(100px by 100px)'
        })
      })
    },
    auth: 'session'
  }

}
