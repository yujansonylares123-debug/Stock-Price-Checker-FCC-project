'use strict';
require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const mongoose = require('mongoose');

const fccTestingRoutes = require('./routes/fcctesting.js');
const apiRoutes = require('./routes/api.js');
const runner = require('./test-runner');

const app = express();

// Seguridad básica
app.use(helmet());

// Content Security Policy: SOLO permitir scripts y CSS desde este servidor
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],   // scripts solo desde tu servidor
      styleSrc: ["'self'"],    // CSS solo desde tu servidor
      imgSrc: ["'self'"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"]
      // 👈 nada de upgradeInsecureRequests aquí
    }
  })
);

// Para que req.ip funcione bien detrás de proxies (Replit, FCC, etc.)
app.set('trust proxy', true);

// Static files
app.use('/public', express.static(process.cwd() + '/public'));

// CORS para fCC testing
app.use(cors({ origin: '*' }));

// Body parsers
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Página principal
app.route('/').get(function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Rutas de testing de FCC
fccTestingRoutes(app);

// Rutas de API
apiRoutes(app);

// 404 Not Found middleware
app.use(function (req, res) {
  res.status(404).type('text').send('Not Found');
});

// =============================
// Conexión a Mongo y arranque
// =============================

const PORT = process.env.PORT || 3000;
const DB = process.env.DB || process.env.MONGO_URI;

let listener;

mongoose
  .connect(DB) // 👈 Sin opciones extra
  .then(() => {
    console.log('✅ Conectado a MongoDB');

    listener = app.listen(PORT, function () {
      console.log('Your app is listening on port ' + listener.address().port);

      if (process.env.NODE_ENV === 'test') {
        console.log('Running Tests...');
        setTimeout(function () {
          try {
            runner.run();
          } catch (e) {
            console.log('Tests are not valid:');
            console.error(e);
          }
        }, 3500);
      }
    });
  })
  .catch((err) => {
    console.error('❌ Mongo connection error:', err.message);
  });

module.exports = app;
