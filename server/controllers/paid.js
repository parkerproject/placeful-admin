'use strict'
require('dotenv').load()
var collections = ['merchants']
var db = require('mongojs').connect(process.env.DEALSBOX_MONGODB_URL, collections)

module.exports = {
    index: {
        handler: function (request, reply) {
            let data = request.payload
            let email = data.data.receipt_email
            let created_date = data.data.created
            created_date = new Date(created_date * 1000)
            created_date = created_date.toISOString()

            db.merchants.findAndModify({
                query: {
                    business_email: email,
                    stripe_id: data.data.customer
                },
                update: {
                    $set: {
                        current_period_end: created_date
                    }
                },
                new: false
            }, function (err, doc, lastErrorObject) {
                if (err) console.log(err)
                console.log(created_date, email)
                reply('updated')
            })

        }
    }
}