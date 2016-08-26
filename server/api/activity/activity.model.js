var _ = require('lodash');

'use strict';


var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var ActivitySchema = new Schema({

    _user: { type: Schema.Types.ObjectId, ref: 'User' },
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

ActivitySchema.methods.statusNumbers = function() {
        console.log(this);
        if(this.activity_type == 'completed'){
            return 3
        } else if(this.activity_type == "blocked"){
            return 2
        } else if(this.activity_type == "started"){
            return 1
        } else if(this.activity_type == "unknown"){
            return 0
        }
};

ActivitySchema.statics.buildFromWebHook = function buildFromWebHook(repoData, cb) {

    var type;
    if(repoData.commits) {
        var latestCommit = repoData.commits[0];
        if(!latestCommit){
            cb(200);
            return
        }
        switch (true) {
            case _.include(latestCommit.message, ':complete'):
                type = 'complete';
                break;
            case _.include(latestCommit.message, ':started'):
                type = 'started';
                break;
            case _.include(latestCommit.message, ':blocked'):
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
    var repoData = activityData.repoData;
    var type = activityData.type;
    var newActivity = {};
    var User = mongoose.model('User');

    User.find({'github.name': repoData.pusher.name}, function (err, data) {
        if (err) {
            return err;
        }
        if (data.length <= 0) {
            var userAttributes = {email: repoData.pusher.email,github: {name: repoData.pusher.name},cohort: repoData.organization.login}
            User.create(userAttributes,function (err, data) {
                if(err){
                    console.log(err);
                    return err;
                }
                SetActivityData(activityData, cb);
            })
        } else {
            var desSplit = repoData.repository.description;
            newActivity._user = data[0];
            newActivity.cohort = data[0].cohort;
            newActivity.repo = repoData.repository.name;
            newActivity.descripition = repoData.repository.description;
            if(desSplit){
                var split = desSplit.split('-');
                newActivity.phase = split[0];
                newActivity.week = split[1];
                newActivity.day = split[2];
            }
            newActivity.activity_meta = repoData.commits;
            newActivity.activity_type = type;
            cb(false, newActivity);
        }
    });
}

module.exports = mongoose.model('Activity', ActivitySchema);
