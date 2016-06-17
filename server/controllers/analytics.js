'use strict'
const Amplitude = require('amplitude')
const amplitude = new Amplitude(process.env.AMPLITUDE_API_KEY, { user_id: process.env.AMPLITUDE_SECRET_KEY })
