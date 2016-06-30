module.exports = {
  index: {
    handler: function (request, reply) {
      reply({hello: 'You are not supposed to be here, my friend:)'})
    }
  }
}
