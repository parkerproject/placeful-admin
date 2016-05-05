/* global appRoot */
'use strict'
require('dotenv').load()
const collections = ['merchants']
const db = require('mongojs').connect(process.env.DEALSBOX_MONGODB_URL, collections)
const bcrypt = require('bcrypt-nodejs')
const randtoken = require('rand-token')
const template = require('./template')
const sendEmail = require('./send_email')
const geocoderProvider = 'google'
const httpAdapter = 'https'
const extra = {
  apiKey: process.env.GOOGLE_API_KEY,
  formatter: null
}
const geocoder = require('node-geocoder')(geocoderProvider, httpAdapter, extra)

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

function saveDB (businessObject, business_email, business_name, reply) {
  db.merchants.save(businessObject, function () {
    let html = template(appRoot + '/server/views/welcome_email.html', {})
    sendEmail(business_email, 'Welcome to Placeful', html)
    let content = `<p>A new merchant, <strong>${business_name}</strong> has joined!</p>
            Thanks,<br />
            Placeful robot`
    sendEmail(process.env.ADMIN_EMAIL, 'A new merchant', content)
    return reply.redirect('/thankyou')
  })
}

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
            business_icon: (request.payload.business_icon) ? request.payload.business_icon : 'https://maps.gstatic.com/mapfiles/place_api/icons/generic_business-71.png',
            business_locality: request.payload.business_locality,
            followers: [],
            subscriber: 'no',
            password: hash,
            business_id: randtoken.generate(20),
            agreement: request.payload.agreement,
            website: request.payload.website,
            tags: '',
            approved: false,
            referral_name: request.payload.referral
          }
          if (request.payload.business_lat && request.payload.business_lng) {
            businessObject.loc = {
              type: 'Point',
              coordinates: [Number(request.payload.business_lng), Number(request.payload.business_lat)]
            }
            saveDB(businessObject, request.payload.business_email, business_name, reply)
          } else {
            geocoder.geocode(request.payload.business_address).then((res) => {
              let longitude = res[0].longitude
              let latitude = res[0].latitude
              businessObject.loc = {
                type: 'Point',
                coordinates: [Number(longitude), Number(latitude)]
              }
              saveDB(businessObject, request.payload.business_email, business_name, reply)
            })
          }
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
    //  }
    //  })
    }
  }
}
