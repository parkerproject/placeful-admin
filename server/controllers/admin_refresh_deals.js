'use strict'
require('dotenv').load()
const collections = ['merchants', 'promotions']
const db = require('mongojs').connect(process.env.DEALSBOX_MONGODB_URL, collections)
const req = require('request')
const _ = require('lodash')
const cloudinary = require('./cloudinary')
const typeform_url = 'https://api.typeform.com/v0/form/' + process.env.ADMIN_FORM_ID + '?key=' + process.env.TYPEFORM_API + '&completed=true'
const slug = require('slug')
const mersenne = require('mersenne')
const sendEmail = require('./send_email')
const geocoderProvider = 'google'
const httpAdapter = 'https'
const extra = {
  apiKey: process.env.GOOGLE_API_KEY,
  formatter: null
}
const geocoder = require('node-geocoder')(geocoderProvider, httpAdapter, extra)
const placeObject = require('./placeObject')
const randtoken = require('rand-token')
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
            promotion.merchant_id = 'placeful_' + randtoken.generate(10)
            promotion.merchant_locality = 'New York'
            promotion.phone = currentPromotion.answers.textfield_18506350
            promotion.merchant_address = currentPromotion.answers.textfield_18505811
            promotion.merchant_name = currentPromotion.answers.textfield_18505765
            promotion.quantity_redeemed = 0
            promotion.title = currentPromotion.answers.textfield_18505040
            promotion.description = currentPromotion.answers.textarea_18505041
            promotion.fine_print = currentPromotion.answers.textarea_18505042
            // promotion.large_image = currentPromotion.answers.fileupload_18505044
            promotion.start_date = new Date(currentPromotion.answers.date_18505045).toISOString()
            promotion.end_date = new Date(currentPromotion.answers.date_18505046).toISOString()
            promotion.slug = slug(currentPromotion.answers.textfield_18505040)
            promotion.ticket_id = mersenne.rand()
            promotion.likes = []
            promotion.start_time = currentPromotion.answers.dropdown_19137094
            promotion.end_time = currentPromotion.answers.dropdown_19137102
            promotion.endTimeString = endTimeString(currentPromotion.answers.dropdown_19137102)
            promotion.approved = true
            promotion.merchant_locality = currentPromotion.answers.dropdown_19907801
            // promotion.merchant_category = currentPromotion.answers.listimage_19441897_choice
            let props = Object.keys(currentPromotion.answers)
            let tags = []
            let days = []
            let categories = []
            props.forEach(function (tag) {
              if (_.startsWith(tag, 'list_18505043_choice') && currentPromotion.answers[tag] !== '') {
                tags.push(currentPromotion.answers[tag])
              }
            })
            promotion.tags = tags
            props.forEach(function (category) {
              if (_.startsWith(category, 'listimage_19441897_choice') && currentPromotion.answers[category] !== '') {
                categories.push(currentPromotion.answers[category])
              }
            })
            promotion.merchant_category = categories
            props.forEach(function (day) {
              if (_.startsWith(day, 'listimage_19137415') && currentPromotion.answers[day] !== '') {
                days.push(currentPromotion.answers[day].toLowerCase())
              }
            })
            promotion.days = days
            geocoder.geocode(currentPromotion.answers.textfield_18505811).then((res) => {
              let longitude = res[0].longitude
              let latitude = res[0].latitude
              promotion.loc = {
                type: 'Point',
                coordinates: [longitude, latitude]
              }
              promotion.followers = []
              cloudinary.uploader.upload(currentPromotion.answers.fileupload_18505044, function (result) {
                promotion.large_image = result.url
                let basePath = 'http://res.cloudinary.com/placeful/image/upload/'
                let lastPath = (result.url).split(basePath)[1]
                let icon = `${basePath}c_fill,h_50,w_50/${lastPath}`
                promotion.merchant_icon = icon

                db.promotions.save(promotion, function () {
                  promotion.email = promotion.merchant_id + '@placeful.co'
                  promotion.password = null
                  promotion.icon = icon
                  promotion.website = null
                  let merchantAccount = placeObject(promotion)
                  db.merchants.find({
                    business_name: merchantAccount.merchant_name
                  }).limit(1, (err, business) => {
                    if (err) console.log(err)
                    if (business.length === 0) {
                      db.merchants.save(merchantAccount)
                      let content = `A new promotion <a href="http://placefulapp.com/promotion/${promotion_id}/${promotion.slug}">${promotion.title}</a> has been created!
                        <p>if you like what you see, go ahead and approve in the admin</p>
                        Thanks,<br />
                        Placeful robot`
                      sendEmail(process.env.ADMIN_EMAIL, 'New promotion', content)
                      return reply.redirect('/manage_deals')
                    }else {
                      // update the promo merchant id with this merchant id
                      db.promotions.update({
                      deal_id: promotion.deal_id},
                        {$set: {merchant_id: business[0].business_id}},
                        function () {
                          let content = `A new promotion <a href="http://placefulapp.com/promotion/${promotion_id}/${promotion.slug}">${promotion.title}</a> has been created!
                            <p>if you like what you see, go ahead and approve in the admin</p>
                            Thanks,<br />
                            Placeful robot`
                          sendEmail(process.env.ADMIN_EMAIL, 'New promotion', content)
                          return reply.redirect('/manage_deals')
                        })
                    }
                  })
                })
              })
            }).catch(function (err) {
              console.log(err)
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
