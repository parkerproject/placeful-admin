var Hapi = require('hapi')
var Inert = require('inert')
var Vision = require('vision')
var path = require('path')
var Hapi_auth = require('hapi-auth-cookie')
var HapiSwagger = require('hapi-swagger')
var swaggerOptions = {
  apiVersion: '1.0.0'
}
var server = new Hapi.Server()
server.connection({
  host: '0.0.0.0',
  port: 1225
})
// Require the routes and pass the server object.
var routes = require('./server/config/routes')(server)

global.appRoot = path.resolve(__dirname)

// Export the server to be required elsewhere.
module.exports = server

// Bootstrap Hapi Server Plugins, passes the server object to the plugins
// require('./server/config/plugins')(server)

server.register([Inert, Vision, Hapi_auth, {
  register: HapiSwagger,
  options: swaggerOptions
}], function (err) {
  if (err) console.log(err)
  server.views({
    path: './server/views',
    engines: {
      html: require('swig')
    }
  })

  server.auth.strategy('session', 'cookie', {
    password: 'dancingtomorrow',
    cookie: 'sid-dealsbox',
    redirectTo: '/login',
    isSecure: false,
    ttl: 15 * 60 * 60 * 1000
  })
  server.route(routes)

  server.on('internalError', function (request, err) {
    console.log(err.data.stack)
  // console.log('Error response (500) sent for request: ' + request.id + ' because: ' + (err.trace || err.stack || err))
  })

  server.start(function () {
    console.log('Server started at: ' + server.info.uri)
  })
})
