const mongoose = require('mongoose');

// Conexión sin opciones obsoletas
mongoose.connect(process.env.DATA_BASE_URL);

mongoose.Promise = global.Promise;

module.exports = mongoose;
