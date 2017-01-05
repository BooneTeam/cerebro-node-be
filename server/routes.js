/**
 * Main application routes
 */

'use strict';

var path = require('path');
var cors = require('cors');

module.exports = function(app) {
  // Insert routes below
  // var corsOptions = {
  //   origin: 'http://cerebro-dbc.herokuapp.com',
  //   optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
  // };
  //
  // if(process.env.NODE_ENV == 'development'){
  //   corsOptions['origin'] = ['http://cerebro-dbc.herokuapp.com', 'http://localhost:8080']
  // }

  var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');

    // intercept OPTIONS method
    if ('OPTIONS' == req.method) {
      res.send(200);
    }
    else {
      next();
    }
  };
  app.use(allowCrossDomain);

  app.use('/api/activities', require('./api/activity'));
  app.use('/api/users', require('./api/user'));

  app.use('/auth', require('./auth'));


};
