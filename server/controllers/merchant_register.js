/* global appRoot */
'use strict'
require('dotenv').load()
const collections = ['merchants']
const db = require('mongojs').connect(process.env.DEALSBOX_MONGODB_URL, collections)
const bcrypt = require('bcrypt-nodejs')
const randtoken = require('rand-token')
const template = require('./template')
const sendEmail = require('./send_email')
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)

const alreadyRegistered = `
<html>
<body>
<div style="border: 1px solid gray;padding:10px;width:400px;margin:5% auto;font-family:sans-serif;">
 <h3 style="text-align:center;">It looks like you are already a member.</h3>
  <p style="text-align:center;margin-top:10%;">
    <a href="https://merchant.placeful.co/login">Access your account</a>
  </p>
</div>
</body>
</html>
`

const successHTML = `
<html>
<body>
<div style="border: 1px solid gray;padding:10px;width:400px;margin:5% auto;font-family:sans-serif">
 <h3 style="text-align:center;">Thank you for choosing Placeful as a means to promote your business!</h3>
  <p style="text-align:center;margin-top:10%;">
    <a href="https://merchant.placeful.co/login">Login and get started with creating your first promotion</a>
  </p>
</div>
</body>
</html>
`

module.exports = {
  index: {
    handler: function (request, reply) {
      reply.view('merchant/register', {
        _class: 'login-page'
      })
    },
    app: {
      name: 'register'
    }
  },
  register: {
    handler: function (request, reply) {
      let password = request.payload.password
      let hash = bcrypt.hashSync(password)

      let customer = {
        email: request.payload.business_email,
        source: request.payload.stripeToken,
        metadata: {
          business_name: request.payload.business_place
        },
        plan: 'merchant00'
      }
      if (request.payload.coupon) {
        customer.coupon = request.payload.coupon.toUpperCase()
      }
      stripe.customers.create(customer, (err, customer) => {
        if (err) {
          let error_message = `
          <html>
          <body>
            <p style="text-align:center;margin-top:10%;">
            ${err.message}<br />
            <a href="https://merchant.placeful.co/register">Back to Registration</a>
            </p>
          </body>
          </html>
          `
          reply(error_message)
        }
        if (customer) {
          db.merchants.find({
            business_email: request.payload.business_email
          }).limit(1, (err, results) => {
            if (err) console.log(err)
            if (results.length === 0) {
              let business_name = (request.payload.business_place !== '') ? request.payload.business_place : request.payload.business_name
              let businessObject = {
                business_name: business_name,
                business_email: request.payload.business_email,
                business_phone: request.payload.business_phone,
                business_map: request.payload.business_map,
                business_address: request.payload.business_address,
                business_icon: request.payload.business_icon,
                business_locality: request.payload.business_locality,
                followers: [],
                subscriber: 'yes',
                password: hash,
                business_id: randtoken.generate(20),
                agreement: request.payload.agreement,
                website: request.payload.website,
                tags: '',
                approved: false,
                stripe_id: customer.id,
                referral_code: (request.payload.coupon) ? request.payload.coupon : '',
                referral_name: request.payload.referral
              }
              if (request.payload.business_lat && request.payload.business_lng) {
                businessObject.loc = {
                  type: 'Point',
                  coordinates: [Number(request.payload.business_lng), Number(request.payload.business_lat)]
                }
              }

              db.merchants.save(businessObject, function () {
                let html = template(appRoot + '/server/views/welcome_email.html', {})
                sendEmail(request.payload.business_email, 'Welcome to Placeful', html)
                let content = `<p>A new merchant, <strong>${businessObject.business_name}</strong> has joined!</p>
                    Thanks,<br />
                    Placeful robot`
                sendEmail(process.env.ADMIN_EMAIL, 'A new merchant', content)
                reply(successHTML)
              })
            } else {
              let dups = `<p>It looks like <strong>${request.payload.business_place}</strong> has paid twice!</p>
              <p> Get in touch and probably issue a refund or cancel duplicate subscription in stripe.</p>
              <p>Merchant email: ${request.payload.business_email}</p>
                  Thanks,<br />
                  Placeful robot`
              sendEmail(process.env.ADMIN_EMAIL, 'Duplicate merchant', dups)
              reply(alreadyRegistered)
            }
          })
        }
      })
    }
  }
}
