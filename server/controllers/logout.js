require('dotenv').load()

module.exports = {
    index: {
        handler: function (request, reply) {
            request.auth.session.clear()
            return reply.redirect('/login')
        }
    }

}