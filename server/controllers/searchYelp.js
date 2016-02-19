'use strict'
require('dotenv').load()

const yelp = require('yelp').createClient({
  consumer_key: process.env.CONSUMER_KEY,
  consumer_secret: process.env.CONSUMER_SECRET,
  token: process.env.TOKEN,
  token_secret: process.env.TOKEN_SECRET
})

module.exports = {
  index: {
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
  }
}