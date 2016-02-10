require('dotenv').load();
var collections = ['early_access', 'bloggers'];
var db = require("mongojs").connect(process.env.DEALSBOX_MONGODB_URL, collections);
var swig = require('swig');
var rp = require('request-promise');
var Kaiseki = require('kaiseki');
var kaiseki = new Kaiseki(process.env.PARSE_APP_ID, process.env.PARSE_REST_API_KEY);
var _ = require('underscore');
var mandrill = require('node-mandrill')(process.env.MANDRILL);

function saveEmail(data, reply) {
  db.early_access.save({
    email: data.email,
    referral: data.hash
  }, function (err, success) {
    console.log(success);
    if (err) reply('<span class="error">oops! looks like the server failed. Try again</span>');
    if (success) reply(1);
  });

}

function sendEmails(email, subject, content) {
  mandrill('/messages/send', {
    message: {
      to: [{
        email: email
            }],
      from_email: 'hello@dealsbox.co',
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
}



module.exports = {
  storeEmail: {
    handler: function (request, reply) {
      var user = request.params.email;
      var email = user.split('/')[0];
      var hash = user.split('/')[1];

      db.early_access.findOne({
        email: email
      }, function (err, result) {
        if (err) console.log(err);
        if (result) {
          reply('You have already submitted your email.');
        } else {
          saveEmail({
            email: email,
            hash: hash
          }, reply);
        }
      });


    },
    app: {
      name: 'storeEmail'
    }
  },

  welcomeEmail: {
    handler: function (request, reply) {
      var email = request.payload.email;
      var name = request.payload.name;
      var user_id = request.payload.id;
      var subject = 'Welcome to DEALSBOX';

      swig.renderFile(appRoot + '/server/views/welcome_email.html', {
          name: name,
          email: email
        },
        function (err, content) {
          if (err) {
            throw err;
          }
          sendEmails(email, subject, content);
          reply('Email sent');
        });


    },
    app: {
      name: 'welcomeEmail'
    }
  }

  //   guestEmail: {
  //     handler: function(request, reply) {

  //       db.bloggers.find(function(err, docs) {
  //         var subject = 'Guest post request';
  //         var email, name;

  //         for (var i = 0, len = docs.length; i < len; i++) {
  //           email = docs[i]['EMAIL ADD'];
  //           name = docs[i]['FIRST NAME'];

  //           (function(userEmail, userName) {

  //             swig.renderFile(__base + 'server/views/guest_post.html', {
  //                 name: userName
  //               },
  //               function(err, content) {
  //                 if (err) {
  //                   throw err;
  //                 }

  //                 sendEmails(userEmail, subject, content);

  //               });

  //           }(email, name));


  //         }

  //         reply(docs);

  //       });




  //     },
  //     app: {
  //       name: 'guestEmail'
  //     }
  //   }

};