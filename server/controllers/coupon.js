require('dotenv').load()
var collections = ['coupons']
var db = require('mongojs').connect(process.env.DEALSBOX_MONGODB_URL, collections)

module.exports = {
    index: {
        handler: function (request, reply) {
            console.log(request.payload.text)
            db.coupons.find({
                code: new RegExp(request.payload.text, 'i')
            }).limit(1, function (err, result) {
                if (err) console.log(err)
                if (result.length !== 0) {
                    reply({
                        data: result,
                        status: 'success'
                    })
                } else {
                    reply('error')
                }
            })

        }
    }
}