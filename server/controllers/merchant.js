require('dotenv').load()
var collections = ['merchants']
var db = require('mongojs').connect(process.env.DEALSBOX_MONGODB_URL, collections)

module.exports = {
    index: {
        handler: function (request, reply) {
            db.merchants.find({
                business_id: request.auth.credentials.business_id
            }).limit(1, function (err, result) {
                if (err) console.log(err)

                if (result[0].subscriber === 'no') {
                    reply.view('merchant/index', {
                        business_name: request.auth.credentials.business_name,
                        business_email: request.auth.credentials.business_email,
                        business_id: request.auth.credentials.business_id,
                    })
                } else {
                    return reply.redirect('/builder')
                }

            })

        },
        auth: 'session'
    }

}