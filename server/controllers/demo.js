'use strict'
require('dotenv').load()
const collections = ['promotions']
const db = require('mongojs').connect(process.env.DEALSBOX_MONGODB_URL, collections)
const schedule = require('node-schedule')
const sendEmail = require('./send_email')

function end () {
  let content = 'Demo data deleted'
  sendEmail(process.env.DEV_EMAIL, 'Demo data refreshed', content)
}
// let j = schedule.scheduleJob('0 10 * * *', function () {
//   db.promotions.remove({
//     merchant_id: 'pcCxqeV5C5O6OtpEqMhw'
//   }, () => {
//     end()
//   })
// })
