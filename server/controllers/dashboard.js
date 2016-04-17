module.exports = {
  index: {
    handler: function (request, reply) {
      reply.view('merchant/analytics', {})
    }
  }
}
