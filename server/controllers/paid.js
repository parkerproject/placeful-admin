'use strict'
require('dotenv').load()
var collections = ['paid']
var db = require('mongojs').connect(process.env.DEALSBOX_MONGODB_URL, collections)

module.exports = {
    index: {
        handler: function (request, reply) {
            let data = request.payload
            db.paid.save(data, function () {
                reply('save')
            })
        }
    }
}