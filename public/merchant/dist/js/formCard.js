/* global Card */

var card = new Card({
  form: 'form', // *required*
  container: '.card-wrapper', // *required*

  // formSelectors: {
  //   numberInput: 'input#number', // optional — default input[name="number"]
  //   expiryInput: 'input#expiry', // optional — default input[name="expiry"]
  //   cvcInput: 'input#cvc', // optional — default input[name="cvc"]
  //   nameInput: 'input#name' // optional - defaults input[name="name"]
  // },

  width: 350, // optional — default 350px
  formatting: true, // optional - default true

  // Strings for translation - optional
  messages: {
    validDate: 'valid\ndate', // optional - default 'valid\nthru'
    monthYear: 'mm/yyyy' // optional - default 'month/year'
  },

  // Default placeholders for rendered fields - optional
  placeholders: {
    number: '•••• •••• •••• ••••',
    name: 'Full Name',
    expiry: '••/••',
    cvc: '•••'
  },

  // if true, will log helpful messages for setting up Card
  debug: true // optional - default false
})
