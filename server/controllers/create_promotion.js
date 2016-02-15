const got = require('got')

let data = {
  'title': 'My new Typeform',
  'tags': ['first-forms'],
  'webhook_submit_url': 'http://example.com/webhook',
  'fields': [
    {
      'type': 'short_text',
      'question': 'How is the weather down in Barcelona today?'
    }
  ]
}

got.post('https://api.typeform.io/v0.4/forms', {
  headers: {
    'X-API-TOKEN': 'b6b1ab26d0e09d2f76fa0b35573f0a5d'
  },
  body: data
}).then((response) => {
  console.log(response.body)
})