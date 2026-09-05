require('dotenv/config')
const express = require('express');
const bodyParser = require('body-parser')
const path = require('path')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const app = express();

app.set('trust proxy', 1);

// Lista de origens permitidas
const allowedOrigins = [
  'http://localhost:5173',
  'https://allfinanz.web.app',
  'https://allfinanz.vercel.app',
  ...(process.env.FRONTEND_URLS || '')
    .split(',')
    .map(origin => origin.trim())
    .filter(Boolean),
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions))
app.options('*', cors(corsOptions))

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cookieParser())

app.use("/files", express.static(path.resolve(__dirname, "tmp", "uploads")));

require('./app/controllers/index')(app)

app.listen(process.env.PORT, () => console.log('Servidor Activo OK'));
module.exports = app;
