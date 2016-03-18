'use strict'
require('dotenv').load()
const geocoderProvider = 'google'
const httpAdapter = 'https'
  // optionnal
const extra = {
  apiKey: process.env.GOOGLE_API_KEY, // for Mapquest, OpenCage, Google Premier
  formatter: null // 'gpx', 'string', ...
}

const geocoder = require('node-geocoder')(geocoderProvider, httpAdapter, extra)

module.exports = (address) => {
  geocoder.geocode(address)
    .then((res) => {
      let longitude = res[0].longitude
      let latitude = res[0].latitude
      return {
        longitude: longitude,
        latitude: latitude
      }
    })
    .catch(function (err) {
      console.log(err)
    })
}