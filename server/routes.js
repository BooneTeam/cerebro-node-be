/**
 * Main application routes
 */

'use strict';

var path = require('path');
var cors = require('cors');

module.exports = function(app) {
  // Insert routes below
  var corsOptions = {
    origin: 'http://cerebro-dbc.herokuapp.com/',
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
  };

  if(process.env.NODE_ENV == 'development'){
    corsOptions['origin'] = ['http://cerebro-dbc.herokuapp.com', 'http://localhost:8080']
  }

  app.use(cors(corsOptions));
  app.use('/api/activities', require('./api/activity'));
  app.use('/api/repos', require('./api/repo'));
  app.use('/api/things', require('./api/thing'));
  app.use('/api/users', require('./api/user'));

  app.use('/auth', require('./auth'));


};
