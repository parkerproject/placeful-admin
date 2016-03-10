'use strict'

const swig = require('swig')

module.exports = (templatePath, data) => {
  let html = swig.compileFile(templatePath)
  return html(data)
}