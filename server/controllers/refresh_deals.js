'use strict'
require('dotenv').load()
const collections = ['merchants', 'promotions']
const db = require('mongojs').connect(process.env.DEALSBOX_MONGODB_URL, collections)
const req = require('request')
const _ = require('lodash')
const uploader = require('./amazon')
const typeform_url = 'https://api.typeform.com/v0/form/' + process.env.FORM_ID + '?key=' + process.env.TYPEFORM_API + '&completed=true'
const slug = require('slug')
const mersenne = require('mersenne')
const sendEmail = require('./send_email')
const endTimeString = require('./end_time')
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
            promotion.endTimeString = endTimeString(currentPromotion.answers.dropdown_19051023)
            promotion.approved = false
            // promotion.merchant_category = currentPromotion.answers.listimage_19441799_choice
            promotion.merchant_locality = currentPromotion.answers.dropdown_19905148
            promotion.loc = {
              type: 'Point',
              coordinates: [Number(currentPromotion.hidden.business_lng), Number(currentPromotion.hidden.business_lat)]
            }
            let props = Object.keys(currentPromotion.answers)
            let tags = []
            let days = []
            let categories = []
            props.forEach(function (tag) {
              if (_.startsWith(tag, 'list_17501907_choice') && currentPromotion.answers[tag] !== '') {
                tags.push(currentPromotion.answers[tag])
              }
            })
            promotion.tags = tags
            props.forEach(function (category) {
              if (_.startsWith(category, 'listimage_19441799_choice') && currentPromotion.answers[category] !== '') {
                categories.push(currentPromotion.answers[category])
              }
            })
            promotion.merchant_category = categories

            props.forEach(function (day) {
              if (_.startsWith(day, 'listimage_19133547') && currentPromotion.answers[day] !== '') {
                days.push(currentPromotion.answers[day].toLowerCase())
              }
            })
            promotion.days = days

            db.merchants.find({business_id: currentPromotion.hidden.business_id}, function (err, business) {
              promotion.followers = business[0].followers
              promotion.merchant_icon = business[0].business_icon

              db.promotions.save(promotion, function () {
                uploader(promotion.large_image, promotion_id)
                let content = `A new promotion <a href="http://placefulapp.com/promotion/${promotion_id}/${promotion.slug}">${promotion.title}</a> has been created!
                <p>if you like what you see, go ahead and approve in the admin</p>
                Thanks,<br />
                Placeful robot`
                sendEmail(process.env.ADMIN_EMAIL, 'New promotion', content)
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
