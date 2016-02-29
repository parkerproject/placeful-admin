require('dotenv').load()
var swig = require('swig')
var collections = ['merchants']
var db = require('mongojs').connect(process.env.DEALSBOX_MONGODB_URL, collections)
var bcrypt = require('bcrypt-nodejs')
var randtoken = require('rand-token')

module.exports = {
    index: {
        handler: function (request, reply) {
            if (request.method === 'post') {
                var hash = bcrypt.hashSync(request.payload.password)

                db.merchants.findAndModify({
                    query: {
                        business_id: request.payload.token
                    },
                    update: {
                        $set: {
                            password: hash
                        }
                    },
                    new: true
                }, function (err, doc, lastErrorObject) {
                    reply(
                        '<span style="font-size: 2em;width: 50%;margin: 10% auto 0 auto;text-align: center;display: block;border: 1px solid #cf4127;padding:10px 0;">Password updated. <a href="/login">Login</a></span>'
                    )
                })

            }

            if (request.method === 'get') {
                return reply.view('merchant/password_reset', {
                    _class: 'login-page',
                    token: request.query.token
                })
            }

        }
    }

}