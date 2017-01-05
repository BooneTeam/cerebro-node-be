/**
 * Populate DB with sample data on server start
 * to disable, edit config/environment/index.js, and set `seedDB: false`
 */

'use strict';
// Insert seed models below]
var Activity = require('../api/activity/activity.model');
var User = require('../api/user/user.model');
var _ = require('lodash');

// Insert seed data below
var activitySeed = require('../api/activity/activity.seed.json');

const COHORTS = ['aus-red-pandas-2016', 'aus-squirrels-2016', 'aus-lizards-2016'];
const ACT_TYPES = ['started', 'completed', 'blocked']
const REPOS = [{challenge: 'baking-pies', description: '1-1-2'}, {
    challenge: 'authorization',
    description: '1-1-1'
}, {challenge: 'authentication', description: '1-1-1'}, {
    challenge: 'django',
    description: '1-1-1'
}, {challenge: 'python', description: '1-1-2'}, {challenge: 'sinatra', description: '1-2-1'}, {
    challenge: 'twitter',
    description: '1-2-1'
}, {challenge: 'ruby', description: '1-1-1'}, {challenge: 'jquery', description: '3-2-3'}, {
    challenge: 'active-record',
    description: '2-1-1'
}];
;

// Insert seed inserts below
Activity.find({}).remove(function () {
    // Activity.create(activitySeed);
});

User.find({}).remove(function () {
    User.create({github: {name: 'Booneteam'}, cohort: 'aus-grubworms-2016'}, function (err, data) {
        UsersAndActivities(data.github.name)
    });
    User.create({github: {name: 'Booneteam1'}, cohort: 'aus-millipedes-2016'}, function (err, data) {
        UsersAndActivities(data.github.name)
    });
    User.create({github: {name: 'Booneteam2'}, cohort: 'aus-muskrats-2016'}, function (err, data) {
        UsersAndActivities(data.github.name)
    });
    User.create({github: {name: 'Booneteam3'}, cohort: 'aus-goldfish-2016'}, function (err, data) {
        UsersAndActivities(data.github.name)
    });
});

function UsersAndActivities(username) {
    User.find({'github.name': username}, function (err, data) {
        data.forEach(function (user) {
            var cohort = _.sample(COHORTS);
            //COHORT ASSIGMENT IS DUMB HERE.
            REPOS.forEach(function (repo) {
                var phase, week, day;
                var desSplit = repo.description;
                if (desSplit) {
                    var split = desSplit.split('-');
                    phase = split[0];
                    week = split[1];
                    day = split[2];
                }

                Activity.create({
                    _user: user._id,
                    cohort: cohort,
                    repo: repo.challenge,
                    activity_type: _.sample(ACT_TYPES),
                    description: repo.description,
                    phase: phase,
                    week: week,
                    day: day,
                })
            })
        });
    });
}

console.log('SSEEEEEEDING');