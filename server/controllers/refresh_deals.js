'use strict'
require('dotenv').load()
const collections = ['merchants', 'promotions']
const db = require('mongojs').connect(process.env.DEALSBOX_MONGODB_URL, collections)
const req = require('request')
const _ = require('lodash')
const randtoken = require('rand-token')
const uploader = require('./s3')
const typeform_url = 'https://api.typeform.com/v0/form/' + process.env.FORM_ID + '?key=' + process.env.TYPEFORM_API + '&completed=true'

module.exports = {
  index: {
    handler: function (request, reply) {
      let promotion_id = request.params.promotion_id

      let promotion = {
        deal_id: promotion_id
      }

      req(typeform_url, function (error, response, body) {
        if (!error && response.statusCode == 200) {
          let results = JSON.parse(body).responses

          if (results.length !== 0) {
            let currentPromotion = _.filter(results, function (result) {
              return result.hidden.promotion_id == promotion_id
            })

            currentPromotion = currentPromotion[0]

            promotion.merchant_id = currentPromotion.hidden.business_id
            promotion.merchant_locality = currentPromotion.hidden.merchant_locality
            promotion.phone = currentPromotion.hidden.phone
            promotion.merchant_address = currentPromotion.hidden.merchant_address
            promotion.merchant_name = currentPromotion.hidden.business_name
            promotion.quantity_redeemed = 0
            promotion.loc = {
              type: 'Point',
              coordinates: [Number(currentPromotion.hidden.business_lng), Number(currentPromotion.hidden.business_lat)]
            }
            promotion.title = currentPromotion.answers.textfield_17217315
            promotion.description = currentPromotion.answers.textfield_17217371
            promotion.fine_print = currentPromotion.answers.textfield_17217434
            promotion.price = currentPromotion.answers.number_17218066
            promotion.category = currentPromotion.answers.dropdown_17301469
            promotion.tags = currentPromotion.answers.textarea_17218431
            promotion.large_image = currentPromotion.answers.fileupload_17219382
            promotion.start_date = currentPromotion.answers.date_17219396
            promotion.end_date = currentPromotion.answers.date_17219403

            db.promotions.save(promotion, function (err, result) {
              if (err) console.log(err)
              uploader(promotion.large_image, promotion_id)
              return reply.redirect('/manage_deals')
            })
          } else {
            return reply.redirect('/manage_deals')
          }
        }
      })
    },
    auth: 'session'
  }

}