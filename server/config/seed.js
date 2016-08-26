/**
 * Populate DB with sample data on server start
 * to disable, edit config/environment/index.js, and set `seedDB: false`
 */

'use strict';
// Insert seed models below
var Activity = require('../api/activity/activity.model');
var Repo = require('../api/repo/repo.model');
var Thing = require('../api/thing/thing.model');
var User = require('../api/user/user.model');
var _ = require('lodash');

// Insert seed data below
var activitySeed = require('../api/activity/activity.seed.json');
var repoSeed = require('../api/repo/repo.seed.json');
var thingSeed = require('../api/thing/thing.seed.json');

// Insert seed inserts below
// Activity.find({}).remove(function() {
// 	Activity.create(activitySeed);
// });
// //
// {
//   "cohort" : "aus-red-pandas-2016",
//     repo: 'something'
//   "activity_type" : "started",
//
// }
// const ACT_TYPES = ['started','completed','blocked']
// const REPOS     =['baking-pies', 'authorization','authentication','django','python','sinatra', 'twitter','ruby','jquery','active-record'];;
    //

//
// User.find(function(err,data){
//   data.forEach(function(user){
//     REPOS.forEach(function(repo){
//       Activity.create({_user: user._id, cohort: user.cohort,repo: repo, activity_type: _.sample(ACT_TYPES)})
//     })
//   });
// });
// Repo.find({}).remove(function() {
// 	Repo.create(repoSeed);
// });

// Thing.find({}).remove(function() {
//   Thing.create(thingSeed);
// });
