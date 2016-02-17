/**
 * Dependencies.
 */
var requireDirectory = require('require-directory')

module.exports = function (server) {
  // Bootstrap your controllers so you dont have to load them individually. This loads them all into the controller name space. https://github.com/troygoode/node-require-directory
  var controller = requireDirectory(module, '../controllers')

  // Array of routes for Hapi
  var routeTable = [{
    method: 'GET',
    path: '/thankyou',
    config: controller.base.fbconfirm
  }, {
    method: 'GET',
    path: '/{path*}',
    config: controller.base.missing
  }, {
    method: 'GET',
    path: '/partials/{path*}',
    config: controller.assets.partials
  }, {
    method: 'GET',
    path: '/images/{path*}',
    config: controller.assets.images
  }, {
    method: 'GET',
    path: '/deal_images/{path*}',
    config: controller.assets.deal_images
  }, {
    method: 'GET',
    path: '/css/{path*}',
    config: controller.assets.css
  }, {
    method: 'GET',
    path: '/fonts/{path*}',
    config: controller.assets.fonts
  }, {
    method: 'GET',
    path: '/js/{path*}',
    config: controller.assets.js
  }, {
    method: 'GET',
    path: '/assets/{path*}',
    config: controller.assets.assets
  }, {
    method: 'GET',
    path: '/bower_components/{path*}',
    config: controller.assets.bower
  }, {
    method: 'GET',
    path: '/merchant/{path*}',
    config: controller.assets.merchant
  }, {
    method: 'POST',
    path: '/process_email/{email*2}',
    config: controller.email.storeEmail
  }, {
    method: 'POST',
    path: '/welcome_email',
    config: controller.email.welcomeEmail
  }, {
    method: 'GET',
    path: '/',
    config: controller.merchant.landing
  }, {
    method: 'GET',
    path: '/home',
    config: controller.dashboard.index
  }, {
    method: 'GET',
    path: '/payment',
    config: controller.merchant.index
  }, {
    method: ['GET', 'POST'],
    path: '/login',
    config: controller.merchant.login
  }, {
    method: 'GET',
    path: '/logout',
    config: controller.merchant.logout
  }, {
    method: ['GET', 'POST'],
    path: '/forgotpass',
    config: controller.merchant.forgot_pass
  }, {
    method: ['GET', 'POST'],
    path: '/password_reset',
    config: controller.merchant.password_reset
  }, {
    method: 'GET',
    path: '/register',
    config: controller.merchant.register
  }, {
    method: 'POST',
    path: '/register_post',
    config: controller.merchant.register_post
  }, {
    method: 'GET',
    path: '/builder',
    config: controller.merchant_deal.index
  }, {
    method: 'POST',
    path: '/deal/delete_deal',
    config: controller.merchant_deal.delete_deal
  }, {
    method: 'GET',
    path: '/lab/yelp_phone',
    config: controller.merchant_deal.searchYelpPhone
  }, {
    method: 'POST',
    path: '/lab/payment',
    config: controller.payment.index
  }, {
    method: 'GET',
    path: '/manage_deals',
    config: controller.merchant_deal.deals
  }, {
    method: ['GET', 'POST'],
    path: '/profile',
    config: controller.merchant.profile
  }, {
    method: 'POST',
    path: '/coupon/validate',
    config: controller.coupon.index
  }, {
    method: 'GET',
    path: '/promotion/{promotion_id}',
    config: controller.refresh_deals.index
  }]
  return routeTable
}