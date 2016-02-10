require('dotenv').load();
var swig = require('swig');
var collections = ['merchants'];
var db = require("mongojs").connect(process.env.DEALSBOX_MONGODB_URL, collections);
var randtoken = require('rand-token');
var mandrill = require('node-mandrill')(process.env.MANDRILL);
var _request = require('request');
var Kaiseki = require('kaiseki');
var kaiseki = new Kaiseki(process.env.PARSE_APP_ID, process.env.PARSE_REST_API_KEY);

var sendEmail = function (email, subject, content) {
  mandrill('/messages/send', {
    message: {
      to: [{
        email: email
      }],
      from_email: 'noreply@dealsbox.co',
      from_name: 'DEALSBOX',
      subject: subject,
      html: content
    }
  }, function (error, response) {
    //uh oh, there was an error
    if (error) console.log(JSON.stringify(error));
    //everything's good, lets see what mandrill said
    else console.log(response);
  });
};

module.exports = {
  index: {
    handler: function (request, reply) {
      return reply.redirect('/manage_deals');
    },
    auth: 'session'
  }

};