require('dotenv').load()
const collections = ['merchants']
const db = require('mongojs').connect(process.env.DEALSBOX_MONGODB_URL, collections)
const bcrypt = require('bcrypt-nodejs')

var replyFn = function (reply, message) {
    return reply.view('merchant/login', {
        _class: 'login-page',
        message: message
    })

}

var login = function (request, reply) {
    if (request.auth.isAuthenticated) {
        return reply.redirect('/manage_deals')
    }

    var message = ''
    var account = null

    if (request.method === 'post') {
        if (!request.payload.username || !request.payload.password) {
            message = 'Missing username or password'

        } else {
            db.merchants.find({
                business_email: request.payload.username
            }).limit(1, function (err, user) {
                if (err) console.log(err)
                account = user[0]

                if (user.length === 0 || !bcrypt.compareSync(request.payload.password, account.password)) {
                    message = 'Invalid username or password'
                    replyFn(reply, message)
                } else {
                    request.auth.session.set(account)
                    return reply.redirect('/manage_deals')
                }
            })
        }
    }

    if (request.method === 'get' || message) {
        replyFn(reply, message)
    }

}

module.exports = {
    index: {
        handler: login,
        auth: {
            mode: 'try',
            strategy: 'session'
        },
        plugins: {
            'hapi-auth-cookie': {
                redirectTo: false
            }
        }
    }

}