const mongoose = require('mongoose');

mongoose.connect(process.env.DATA_BASE_URL);

mongoose.Promise = global.Promise;

module.exports = mongoose;
