'use strict'
require('dotenv').load()
const collections = ['merchants', 'promotions']
const db = require('mongojs').connect(process.env.DEALSBOX_MONGODB_URL, collections)
const randtoken = require('rand-token')

module.exports = {
    index: {
        handler: function (request, reply) {
            if (!request.auth.isAuthenticated) {
                return reply.redirect('/login')
            }

            db.merchants.find({
                business_id: request.auth.credentials.business_id
            }).limit(1, function (err, result) {
                if (result != null) { // keeps failing here
                    if (result[0].subscriber === 'no') {
                        return reply.redirect('/payment')
                    } else {
                        reply.view('merchant/add_deal', {
                            _class: 'login-page',
                            business_email: request.auth.credentials.business_email,
                            yelp_URL: request.auth.credentials.yelp_URL,
                            business_name: request.auth.credentials.business_name,
                            business_id: request.auth.credentials.business_id,
                            business_map: request.auth.credentials.business_map,
                            business_lat: request.auth.credentials.business_lat,
                            business_lng: request.auth.credentials.business_lng,
                            business_phone: request.auth.credentials.business_phone,
                            business_address: request.auth.credentials.business_address,
                            business_icon: request.auth.credentials.business_icon,
                            business_locality: request.auth.credentials.business_locality,
                            form_id: process.env.FORM_ID,
                            promotion_id: randtoken.generate(12)
                        })
                    }

                } else {
                    request.auth.session.clear()
                    return reply.redirect('/login')
                }

            })

        },
        auth: 'session'
    }
}