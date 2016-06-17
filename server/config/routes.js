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
    config: controller.landing.index
  }, {
    method: 'GET',
    path: '/home',
    config: controller.merchant.index
  }, {
    method: ['GET', 'POST'],
    path: '/login',
    config: controller.login.index
  }, {
    method: 'GET',
    path: '/logout',
    config: controller.logout.index
  }, {
    method: ['GET', 'POST'],
    path: '/forgotpass',
    config: controller.forgot_password.index
  }, {
    method: ['GET', 'POST'],
    path: '/password_reset',
    config: controller.password_reset.index
  }, {
    method: 'GET',
    path: '/register',
    config: controller.merchant_register.index
  }, {
    method: 'POST',
    path: '/register',
    config: controller.merchant_register.register
  }, {
    method: 'GET',
    path: '/builder',
    config: controller.builder.index
  }, {
    method: 'GET',
    path: '/lab/yelp_phone',
    config: controller.searchYelp.index
  }, {
    method: 'POST',
    path: '/lab/payment',
    config: controller.payment.index
  }, {
    method: 'GET',
    path: '/manage_deals',
    config: controller.merchant_deal.deals
  }, {
    method: 'GET',
    path: '/profile',
    config: controller.profile.index
  }, {
    method: 'POST',
    path: '/profile',
    config: controller.edit_profile.index
  }, {
    method: 'GET',
    path: '/promotion/{promotion_id}',
    config: controller.refresh_deals.index
  }, {
    method: 'GET',
    path: '/admin/promotion/{promotion_id}',
    config: controller.admin_refresh_deals.index
  }, {
    method: 'POST',
    path: '/paid',
    config: controller.paid.index
  }, {
    method: 'GET',
    path: '/admin/placeful_promotions',
    config: controller.placeful_promotions.deals
  }, {
    method: 'GET',
    path: '/promotion/edit/{promotion_id}',
    config: controller.edit_promo.index
  }, {
    method: 'POST',
    path: '/promotion/edit',
    config: controller.edit_promo.update
  }, {
    method: 'GET',
    path: '/admin/placeful_merchants',
    config: controller.placeful_merchants.index
  }]
  return routeTable
}
