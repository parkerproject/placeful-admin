'use strict'
require('dotenv').load()
const sendgrid = require('sendgrid')(process.env.SENDGRID_KEY)

module.exports = function (email, subject, content) {
  sendgrid.send({
    to: email,
    from: 'concierge@placeful.co',
    fromname: 'Concierge from Placeful',
    subject: subject,
    html: content
  }, function (err, json) {
    if (err) console.log(err)
    console.log(json)
  })
}