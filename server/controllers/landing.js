module.exports = {
    index: {
        handler: function (request, reply) {
            reply.view('merchant/merchant_landing', {})

        }
    }
}