'use strict';
var _ = require('lodash');

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var ActivitySchema = new Schema({

    _user: {type: Schema.Types.ObjectId, ref: 'User'},
    cohort: String,
    repo: String,
    activity_type: String,
    activity_comment: String,
    activity_meta: {},
    repo_description: String,
    phase: Number,
    week: Number,
    day: Number
});

ActivitySchema.methods.statusNumbers = function () {
    if (this.activity_type == 'completed') {
        return 3
    } else if (this.activity_type == "blocked") {
        return 2
    } else if (this.activity_type == "started") {
        return 1
    } else if (this.activity_type == "unknown") {
        return 0
    }
};

ActivitySchema.statics.buildFromWebHook = function buildFromWebHook(repoData, cb) {

    var type;
    if (repoData.commits) {
        var latestCommit = repoData.commits[0];
        if (!latestCommit) {
            cb(200);
            return
        }
        switch (true) {
            case _.includes(latestCommit.message, ':complete'):
                type = 'complete';
                break;
            case _.includes(latestCommit.message, ':started'):
                type = 'started';
                break;
            case _.includes(latestCommit.message, ':blocked'):
                type = 'blocked';
                break;
            default:
                // Change this to jsut return 200. Dont save if not any of the above
                type = 'unknown';
                break;
        }
        //
        // if (type == 'unknown') {
        //    return cb(200);
        // }
        SetActivityData({type: type, repoData: repoData}, cb);
    } else {
        cb(200);
    }
};

function SetActivityData(activityData, cb) {
    // So dirty, use async instead of -1 bs, splitting
    // and expecting all these fields prolly should fail
    // gracefully instead of avnwefnaspoifnweiunvadv
    var repoData = activityData.repoData;
    var User = mongoose.model('User');
    var authorEmail = repoData["commits"][0]["author"]["email"];
    var userNames = authorEmail.split('+')[1].split('@')[0].split('.');
    var totalUsers = userNames.length;
    for (var i = 0; i <= userNames.length - 1; i++) {
        User.find({'github.name': userNames[i]}, function (err, data) {

            if (err) {
                return err;
            }
            if (data.length <= 0) {

                var User = mongoose.model('User');

                var user = new User(
                    {
                        // email: repoData.pusher.email,
                        github: {name: userNames[i]},
                        cohort: repoData.organization.login
                    }
                );
                user.save(userAttributes, function (err, data) {
                    if (err) {
                        console.log(err);
                        return err;
                    }
                    CreateActivity(activityData, function (err, data) {
                        console.log(data)
                    }, data);
                })
            } else {
                CreateActivity(activityData, function (err, data) {
                    console.log(data)
                }, data);
            }

            totalUsers -= 1;
            if (totalUsers == 0) {
                cb(200, {})
            }

        });
    }
}

function CreateActivity(activityData, cb, data) {
    var repoData = activityData.repoData;
    var type = activityData.type;
    var newActivity = {};
    var desSplit = repoData.repository.description;
    newActivity._user = data[0];
    newActivity.cohort = data[0].cohort;
    newActivity.repo = repoData.repository.name;
    newActivity.descripition = repoData.repository.description;
    if (desSplit) {
        var split = desSplit.split('-');
        newActivity.phase = split[0];
        newActivity.week = split[1];
        newActivity.day = split[2];
    }
    newActivity.activity_meta = repoData.commits;
    newActivity.activity_type = type;
    mongoose.model('Activity').create(newActivity, function (err, activity) {
        if (err) {
            return handleError(res, err);
        }
        cb(false, activity);
    });
}

module.exports = mongoose.model('Activity', ActivitySchema);
