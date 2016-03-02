'use strict'
require('dotenv').load()
const collections = ['promotions']
const db = require('mongojs').connect(process.env.DEALSBOX_MONGODB_URL, collections)
const algoliasearch = require('algoliasearch')
const client = algoliasearch(process.env.ALGOLIA_APPLICATION_ID, process.env.ALGOLIA_API_KEY)
const index = client.initIndex('promotions')
const async = require('async')
const _ = require('lodash')

// function end(err) {
//     if (err) {
//         console.log(err)
//     }
//     console.log('Mongodb<>Algolia import done')
// }
//
// db.promotions.find({}, (err, results) => {
//
//     results = results.map((result) => {
//         result.objectID = result.deal_id
//         return result
//     })
//
//     let chunkedResults = _.chunk(results, 5000)
//
//     async.each(chunkedResults, index.saveObjects.bind(index), end)
// })