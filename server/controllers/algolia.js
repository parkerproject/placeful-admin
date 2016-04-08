'use strict'
require('dotenv').load()
const collections = ['promotions']
const db = require('mongojs').connect(process.env.DEALSBOX_MONGODB_URL, collections)
const algoliasearch = require('algoliasearch')
const client = algoliasearch(process.env.ALGOLIA_APPLICATION_ID, process.env.ALGOLIA_API_KEY)
const index = client.initIndex('promotions')
const async = require('async')
const _ = require('lodash')
const schedule = require('node-schedule')
const sendEmail = require('./send_email')

function end(err) {
  if (err) {
    sendEmail(process.env.DEV_EMAIL, 'error: refreshing search data', err)
  }
  let content = 'Mongodb<>Algolia import done'
  sendEmail(process.env.DEV_EMAIL, 'Search database refreshed', content)
}
let j = schedule.scheduleJob('0 15 * * *', function () {
  db.promotions.find({}, (err, results) => {
    if (err) console.log(err)
    results = results.map((result) => {
      result.objectID = result.deal_id
      result._geoloc = {
        'lat': result.loc.coordinates[1],
        'lng': result.loc.coordinates[0]
      }
      delete result.loc
      return result
    })
    let chunkedResults = _.chunk(results, 5000)
    async.each(chunkedResults, index.saveObjects.bind(index), end)
  })
})
