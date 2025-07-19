const path = require('path')

const functions = require(path.join(__dirname,'functions.js'))
require(path.join(__dirname,'api.js'))

functions.check_dkim_keys()