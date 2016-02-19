'use strict'
require('dotenv').load()
const collections = ['merchants', 'promotions']
const db = require('mongojs').connect(process.env.DEALSBOX_MONGODB_URL, collections)
const fs = require('fs')
const path = require('path')
const uploadToAmazon = require('./amazon')

module.exports = {
  index: {
    handler: function (request, reply) {
      let deal_id = request.payload.deal_id
      let merchant_id = request.payload.merchant_id

      let params = {
        s3Params: {
          Bucket: 'zeus00',
          Delete: {
            Objects: [{
              Key: deal_id,
            }]
          }
        }
      }

      s3_client.deleteObjects(params.s3Params, function (err, data) {
        if (err) console.log(err)
        console.log('deleted deal from amazon')
      })

      db.promotions.remove({
        deal_id: deal_id,
        merchant_id: merchant_id
      }, {}, function () {
        reply('deal deleted')
      })
    },
    auth: 'session'
  }
}