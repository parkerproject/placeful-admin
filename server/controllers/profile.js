require('dotenv').load()
var collections = ['merchants']
var db = require('mongojs').connect(process.env.DEALSBOX_MONGODB_URL, collections)

module.exports = {
    index: {
        handler: function (request, reply) {
            if (request.method === 'get') {
                db.merchants.find({
                    business_id: request.auth.credentials.business_id
                }).limit(1, function (err, result) {
                    var merchant = result[0]
                    reply.view('merchant/profile', {
                        business_name: merchant.business_name,
                        business_id: merchant.business_id,
                        business_email: merchant.business_email,
                        yelp_URL: merchant.yelp_URL,
                        current_period_end: merchant.current_period_end
                    })
                })
            }

            if (request.method === 'post') {
                var merchant = {}
                if (request.payload.yelp_URL) merchant.yelp_URL = request.payload.yelp_URL
                if (request.payload.business_email) merchant.business_email = request.payload.business_email
                db.merchants.findAndModify({
                    query: {
                        business_id: request.payload.business_id
                    },
                    update: {
                        $set: merchant
                    },
                    new: true
                }, function (err, doc, lastErrorObject) {
                    reply('profile updated')
                })
            }

        },
        auth: 'session'
    }

}