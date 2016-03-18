'use strict'
require('dotenv').load()
const collections = ['merchants', 'promotions']
const db = require('mongojs').connect(process.env.DEALSBOX_MONGODB_URL, collections)
const req = require('request')
const _ = require('lodash')
const randtoken = require('rand-token')
const uploader = require('./amazon')
const typeform_url = 'https://api.typeform.com/v0/form/' + process.env.FORM_ID + '?key=' + process.env.TYPEFORM_API + '&completed=true'
const slug = require('slug')
const mersenne = require('mersenne')
const sendEmail = require('./send_email')

module.exports = {
  index: {
    handler: function (request, reply) {
      let promotion_id = request.params.promotion_id

      let promotion = {
        deal_id: promotion_id
      }

      req(typeform_url, function (error, response, body) {
        if (!error && response.statusCode === 200) {
          let results = JSON.parse(body).responses

          if (results.length !== 0) {
            let currentPromotion = _.filter(results, function (result) {
              return result.hidden.promotion_id === promotion_id
            })

            currentPromotion = currentPromotion[0]

            promotion.merchant_id = currentPromotion.hidden.business_id
            promotion.merchant_locality = currentPromotion.hidden.merchant_locality
            promotion.phone = currentPromotion.hidden.phone
            promotion.merchant_address = currentPromotion.hidden.merchant_address
            promotion.merchant_name = currentPromotion.hidden.business_name
            promotion.quantity_redeemed = 0
            promotion.title = currentPromotion.answers.textfield_17217315
            promotion.description = currentPromotion.answers.textarea_17509767
            promotion.fine_print = currentPromotion.answers.textarea_17509616
            promotion.large_image = currentPromotion.answers.fileupload_17219382
            promotion.start_date = new Date(currentPromotion.answers.date_17219396).toISOString()
            promotion.end_date = new Date(currentPromotion.answers.date_17219403).toISOString()
            promotion.slug = slug(currentPromotion.answers.textfield_17217315)
            promotion.ticket_id = mersenne.rand()
            promotion.likes = []
            promotion.start_time = currentPromotion.answers.dropdown_19050955
            promotion.end_time = currentPromotion.answers.dropdown_19051023
            promotion.approved = false
            promotion.loc = {
              type: 'Point',
              coordinates: [Number(currentPromotion.hidden.business_lng), Number(currentPromotion.hidden.business_lat)]
            }

            let props = Object.keys(currentPromotion.answers)
            let tags = []
            let days = []

            props.forEach(function (tag) {
              if (_.startsWith(tag, 'list_17501907_choice') && currentPromotion.answers[tag] !== '') {
                tags.push(currentPromotion.answers[tag])
              }
            })

            promotion.tags = tags

            props.forEach(function (day) {
              if (_.startsWith(day, 'listimage_19133547') && currentPromotion.answers[day] !== '') {
                days.push(currentPromotion.answers[day])
              }
            })

            promotion.days = days

            db.promotions.save(promotion, function () {
              uploader(promotion.large_image, promotion_id)

              let content = `A new promotion <a href="http://placeful.co/promotion/${promotion_id}/${promotion.slug}">${promotion.title}</a> has been created!
              <p>if you like what you see, go ahead and approve in the admin</p>
              Thanks,<br />
              Placeful robot`

              sendEmail(process.env.ADMIN_EMAIL, 'New promotion', content)

              db.merchants.update({
                business_id: promotion.merchant_id
              }, {
                $set: {
                  business_icon: `https://s3-us-west-2.amazonaws.com/zeus00/${promotion_id}`
                }
              }, function () {
                return reply.redirect('/manage_deals')
              })
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