var _request = require('request');
var Firebase = require('firebase');
var myRootRef = new Firebase('https://torid-torch-3616.firebaseio.com/deals/categories');


function getCategories(url, callback) {

    _request(url, function(error, response, body) {
        if (!error && response.statusCode == 200) {
            callback(body) // Print the google web page.
        }
    })
}

function complete() {
    console.log('insert completed');
}

var filteredOutSlug = ['adult', 'gay'];
var slugs = [];

var url = 'http://api.sqoot.com/v2/categories?api_key=psaygy';
getCategories(url, function(data) {

    var dataObj = JSON.parse(data).categories;


    for (var i = 0, len = dataObj.length; i < len; i++) {
        var slug = dataObj[i].category.slug;
        if (filteredOutSlug.indexOf(slug) == -1) {
            slugs.push(slug);
        }

    }


    myRootRef.set(slugs, complete);

});