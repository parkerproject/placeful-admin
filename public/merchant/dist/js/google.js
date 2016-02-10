google.maps.event.addDomListener(window, 'load', function () {
  var places = new google.maps.places.Autocomplete(document.getElementById('txtPlaces'));
  google.maps.event.addListener(places, 'place_changed', function () {
    var place = places.getPlace();
    var addressArr = place.address_components;
    businessFound = "true";
    var address = place.formatted_address;
    var latitude = place.geometry.location.lat();
    var longitude = place.geometry.location.lng();
    // var mesg = "Address: " + address;
    // mesg += "\nLatitude: " + latitude;
    // mesg += "\nLongitude: " + longitude;
    //alert(mesg);
    var locality = addressArr.filter(function (el) {
      return el.types[0] === 'locality';
    });


    $('input[name=business_address]').val(address);
    $('input[name=business_place]').val(place.name);
    $('input[name=business_lat]').val(latitude);
    $('input[name=business_lng]').val(longitude);
    $('input[name=business_phone]').val(place.formatted_phone_number);
    $('input[name=business_map]').val(place.url);
    $('input[name=business_icon]').val(place.icon);
    $('input[name=business_locality]').val(locality[0].long_name);
  });
});