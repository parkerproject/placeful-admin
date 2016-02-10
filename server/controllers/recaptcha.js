require('dotenv').load();
var _request = require('request');

module.exports = {
  index: {
    handler: function (request, reply) {

      var data = {
        remoteip: request.connection.remoteAddress,
        secret: process.env.Recaptcha_SECRET,
        response: req.payload['g-recaptcha-response']
      };

      request.post({
        url: 'http://service.com/upload',
        form: {
          key: 'value'
        }
      }, function (err, httpResponse, body) { /* ... */ });





    }
  }
};