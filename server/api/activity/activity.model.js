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
            case _.includes(latestCommit.message, ':completed'):
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
    var authorEmail = repoData["commits"][0]["author"]["email"];
    var userNames = authorEmail.split('+')[1].split('@')[0].split('.');
    var totalUsers = userNames.length;
    for (var i = 0; i < userNames.length; i++) {
        findOrCreate(userNames[i], CreateActivity,activityData)
        totalUsers -= 1;
        if (totalUsers == 0) {
            cb(200, {})
        }
    }
}

function findOrCreate(userName, createActivityFn,activityData){
    var repoData = activityData.repoData;
    var User = mongoose.model('User');
    User.find({'github.name': userName}, function (err, data) {
        if (err) {
            return err;
        }
        if (data.length <= 0) {
            var User = mongoose.model('User');
            var user = new User(
                {
                    // email: repoData.pusher.email,
                    github: {name: userName},
                    cohort: repoData.organization.login
                }
            );
            user.save(user, function (err, userData) {
                if (err) {
                    console.log(err);
                    return err;
                }
                createActivityFn(activityData, function (err, dta) {
                    console.log(dta)
                }, userData);
            })
        } else {
            createActivityFn(activityData, function (err, dta) {
                console.log(dta)
            }, data);
        }

    });
}



function CreateActivity(activityData, cb, data) {
    var repoData = activityData.repoData;
    var type = activityData.type;
    var newActivity = {};
    var desSplit = repoData.repository.description;
    if(data[0]){
        newActivity._user = data[0]._id;
        newActivity.cohort = data[0].cohort;
    } else if(data) {
        newActivity._user = data._id;
        newActivity.cohort = data.cohort;
    }

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
            console.log(err)
            return err
        }
        cb(false, activity);
    });
}

module.exports = mongoose.model('Activity', ActivitySchema);
