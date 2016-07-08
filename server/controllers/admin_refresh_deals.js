// 'use strict'
// require('dotenv').load()
// const collections = ['merchants', 'promotions', 'specials', 'test_promotions', 'test_merchants']
// const db = require('mongojs').connect(process.env.DEALSBOX_MONGODB_URL, collections)
// const slug = require('slug')
// const mersenne = require('mersenne')
// const geocoderProvider = 'google'
// const httpAdapter = 'https'
// const _ = require('lodash')
// const extra = {
//   apiKey: process.env.GOOGLE_API_KEY,
//   formatter: null
// }
// const geocoder = require('node-geocoder')(geocoderProvider, httpAdapter, extra)
// const placeObject = require('./placeObject')
// const randtoken = require('rand-token')
// const endTimeString = require('./end_time')
//
// function save (promotion) {
//   db.promotions.save(promotion, function () {
//     promotion.email = promotion.merchant_id + '@placeful.co'
//     promotion.password = null
//     promotion.website = null
//     let merchantAccount = placeObject(promotion)
//     db.merchants.find({
//       business_name: merchantAccount.merchant_name
//     }).limit(1, (err, business) => {
//       if (err) console.log(err)
//       if (business.length === 0) {
//         db.merchants.save(merchantAccount)
//       }
//     })
//   })
// }
//
// module.exports = {
//   index: {
//     handler: function (request, reply) {
//       db.specials.find({}, (err, results) => {
//         if (err) console.log(err)
//         results.forEach((result) => {
//           let tags = result.tags.trim()
//           let tagsArr = tags.split(',')
//           let newTags = tagsArr.map((tag) => {
//             let clean = tag.trim()
//             return clean
//           })
//           result.deal_id = randtoken.generate(10)
//           result.merchant_id = 'placeful_' + randtoken.generate(10)
//           result.quantity_redeemed = 0
//           result.start_date = new Date('2016-07-02').toISOString()
//           result.end_date = new Date('2016-12-23').toISOString()
//           result.slug = slug(result.title)
//           result.ticket_id = mersenne.rand()
//           result.likes = []
//           result.endTimeString = endTimeString(result.end_time)
//           result.approved = false
//           result.followers = []
//           result.loc = null
//           result.merchant_icon = null
//           result.tags = newTags
//           //  result.merchant_category = ['Happy Hour']
//           result.days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
//           save(result)
//         })
//         reply('loop completed')
//       })
//     }
//   },
//   auth: 'session'
// }
