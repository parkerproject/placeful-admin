require('dotenv').load()

module.exports = {
  index: {
    handler: function (request, reply) {
      if (!request.auth.isAuthenticated) {
        return reply.redirect('/login')
      }
      reply.view('merchant/index', {
        business_name: request.auth.credentials.business_name,
        business_email: request.auth.credentials.business_email,
        business_id: request.auth.credentials.business_id,
        role: request.auth.credentials.role
      })
    },
    auth: 'session'
  }
}
