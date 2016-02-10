// assets to be used by the 'hapi-assets' module based on process.env.NODE_ENV
module.exports = {
    development: {
        js: ['js/jquery.min.js', 'js/jquery.alerts.js', 'js/responsive-nav.js', 'js/scripts.js'],
        css: ['css/fonts.css', 'css/animate.css', 'css/normalize.css', 'css/responsive-nav.css', 'css/jquery.alerts.css', 'css/style.css']
    },
    production: {
        js: ['js/scripts.min.js'],
        css: ['css/app.min.css']
    }
};