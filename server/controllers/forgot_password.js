require('dotenv').load()
var swig = require('swig')
var collections = ['merchants']
var db = require('mongojs').connect(process.env.DEALSBOX_MONGODB_URL, collections)
var sendEmail = require('./send_email')

module.exports = {
    index: {
        handler: function (request, reply) {
            if (request.method === 'get') {
                return reply.view('merchant/forgot_pass', {
                    _class: 'login-page'
                })
            }

            if (request.method === 'post') {
                var email = request.payload.email
                var subject = 'Placeful: Password reset'
                var link
                var business_id
                db.merchants.find({
                    business_email: email
                }).limit(1, function (err, result) {
                    if (err) console.log(err)
                    if (result.length === 1) {
                        swig.renderFile(appRoot + '/server/views/merchant/password_reset _template.html', {
                                name: result[0].business_name,
                                reset_link: 'https://merchant.placeful.co/password_reset?token=' + result[0].business_id
                            },
                            function (err, content) {
                                if (err) {
                                    throw err
                                }
                                sendEmail(email, subject, content)
                                reply(
                                    '<span style="font-size: 2em;margin: 10% auto 0 auto;text-align: center;display: block;border: 1px solid #cf4127;padding:10px 0;">Check your email to reset password.</span>'
                                )
                            })
                    }

                    if (result.length === 0) {
                        reply(
                            '<span style="font-size: 2em;margin: 10% auto 0 auto;text-align: center;display: block;border: 1px solid #cf4127;padding:10px 0;">Your email is not in our system.</span>'
                        )
                    }
                })
            }
        }
    }
}