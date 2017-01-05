'use strict';

var githubWebhookSingleUser = {
    "ref": "refs/heads/MattyCodes",
    "commits": [
        {
            "message": ":started",
            "timestamp": "2016-10-25T20:31:26-05:00",
            "url": "https://github.com/aus-coyotes-2016/blog-1-anonymous-blog-challenge/commit/62487d913b5796708ef1ea06f51759f792faad87",
            "author": {
                "name": "Mattycodes",
                "email": "matt.nick.fagioli@gmail.com",
                "username": "MattyCodes"
            },
            "committer": {
                "name": "Mattycodes",
                "email": "matt.nick.fagioli@gmail.com",
                "username": "MattyCodes"
            },
        }
    ],
    "repository": {
        "id": 71592102,
        "name": "test-repo",
        "full_name": "aus-coyotes-2016/test-repo",
        "owner": {
            "name": "aus-coyotes-2016",
            "email": null
        },
    },
    "pusher": {
        "name": "MattyCodes",
        "email": "matt.nick.fagioli@gmail.com"
    },
    "organization": {
        "login": "aus-coyotes-2016",
        "id": 17208977,
    },
    "sender": {
        "login": "MattyCodes",
    }
};

var githubWebhookDoubleUser = {
    "ref": "refs/heads/MattyCodes",
    "commits": [
        {
            "message": ":started",
            "timestamp": "2016-10-25T20:31:26-05:00",
            "url": "https://github.com/aus-coyotes-2016/test-repo/commit/62487d913b5796708ef1ea06f51759f792faad87",
            "author": {
                "name": "Mattycodes",
                "email": "pair+MattyCodes.vernistage@devbootcamp.com",
                "username": "MattyCodes"
            },
            "committer": {
                "name": "Mattycodes",
                "email": "pair+MattyCodes.vernistag@gmail.com",
                "username": "MattyCodes"
            },
        }
    ],
    "repository": {
        "id": 71592102,
        "name": "test-repo",
        "full_name": "aus-coyotes-2016/test-repo",
        "owner": {
            "name": "aus-coyotes-2016",
            "email": null
        },
    },
    "pusher": {
        "name": "MattyCodes",
        "email": "matt.nick.fagioli@gmail.com"
    },
    "organization": {
        "login": "aus-coyotes-2016",
        "id": 17208977,
    },
    "sender": {
        "login": "MattyCodes",
    }
};


var should = require('should');
var app = require('../../app');
var request = require('supertest');
var Activity = require('./activity.model.js');
var User = require('../user/user.model.js');
var config = require('../../config/environment/test.js')
var Promise = require("bluebird");
var _ = require('lodash')
if (config.seedDB) {
    require('../../config/seed.js');
}

describe('GET /api/activities', function () {
    this.timeout(5000);
    it('should respond with JSON array', function (done) {
        request(app)
            .get('/api/activities')
            .expect(200)
            .expect('Content-Type', /json/)
            .end(function (err, res) {
                if (err) return done(err);
                res.body.should.be.instanceof(Array);
                done();
            });
    });

    it('should respond with JSON array of only user activities if given a user', function (done) {
        request(app).get('/api/activities').query('username=Booneteam')
            .expect(200)
            .expect('Content-Type', /json/)
            .end(function (err, res) {
                if (err) return done(err);
                var isQueriedUser = _.every(res.body, {'_user': {'github': {name: 'Booneteam'}}});
                isQueriedUser.should.be.true
                done();
            });
    });


    it('should respond with JSON array of only activities matching a query', function (done) {
        request(app)
            .get('/api/activities').query('activity_type=complete')
            .expect(200)
            .expect('Content-Type', /json/)
            .end(function (err, res) {
                if (err) return done(err);
                var isQueriedType = _.every(res.body, {'actiity_type': 'complete'});
                isQueriedType.should.be.true
                done();
            });
    });

    it('should respond with JSON array of only activities matching a query and a user', function (done) {
        request(app)
            .get('/api/activities').query('username=Booneteam').query('activity_type=complete')
            .expect(200)
            .expect('Content-Type', /json/)
            .end(function (err, res) {
                if (err) return done(err);
                var isQueriedUser = _.every(res.body, {'_user': {'github': {name: 'Booneteam'}}});
                var isQueriedType = _.every(res.body, {'actiity_type': 'complete'});
                isQueriedType.should.be.true
                isQueriedUser.should.be.true
                done();
            });
    });
});


describe('GET /api/activities/furthest', function () {
    it('should respond with JSON array', function (done) {
        request(app)
            .get('/api/activities/furthest')
            .expect(200)
            .expect('Content-Type', /json/)
            .end(function (err, res) {
                if (err) return done(err);
                res.body.should.be.instanceof(Array);
                done();
            });
    });

    it('should respond with uniq elements and only the furthest completed', function (done) {

        var activities = [{
            cohort: 'Fake-Cohort-2016',
            repo: 'fakeChallengeRepo',
            activity_type: 'complete',
            description: 'desc',
        }, {
            cohort: 'Fake-Cohort-2016',
            repo: 'fakeChallengeRepo',
            activity_type: 'started',
            description: 'desc',
        }, {
            cohort: 'Fake-Cohort-2016',
            repo: 'fakeChallengeRepo2',
            activity_type: 'started',
            description: 'desc',
        }, {
            cohort: 'Fake-Cohort-2016',
            repo: 'fakeChallengeRepo2',
            activity_type: 'blocked',
            description: 'desc',
        }, {
            cohort: 'Fake-Cohort-2016',
            repo: 'fakeChallengeRepo3',
            activity_type: 'complete',
            description: 'desc',
        }, {
            cohort: 'Fake-Cohort-2016',
            repo: 'fakeChallengeRepo3',
            activity_type: 'started',
            description: 'desc',
        }];

        var newActivities = [];
        var promise = new Promise(function (resolve) {
            User.findOne({'github.name': 'Booneteam'}).then(function (data) {
                for (var i = 0; i < activities.length; i++) {
                    activities[i]['_user'] = data._id;
                    Activity.create(activities[i]).then(function (data2) {
                        resolve(data2)
                    });
                }
            });
        });
        newActivities.push(promise);

        Promise.all(newActivities).then(function (data) {
            request(app)
                .get('/api/activities/furthest')
                .expect(200)
                .expect('Content-Type', /json/)
                .end(function (err, res) {
                    if (err) return done(err);
                    var repo1 = _.filter(res.body, {'cohort': 'Fake-Cohort-2016', repo: 'fakeChallengeRepo'});
                    var repo2 = _.filter(res.body, {'cohort': 'Fake-Cohort-2016', repo: 'fakeChallengeRepo2'});
                    var repo3 = _.filter(res.body, {'cohort': 'Fake-Cohort-2016', repo: 'fakeChallengeRepo3'});
                    repo1.length.should.be.equal(1)
                    repo2.length.should.be.equal(1)
                    repo3.length.should.be.equal(1)
                    repo1[0].activity_type.should.be.equal('complete');
                    repo2[0].activity_type.should.be.equal('blocked');
                    repo3[0].activity_type.should.be.equal('complete');
                    done();
                });
        });

        // started   = 0
        // blocked   = 1
        // completed = 2

    })
});

describe('POST /api/activities', function () {

    it('should respond with JSON array', function (done) {
        request(app)
            .post('/api/activities').send(githubWebhookSingleUser)
            .expect(200)
            .end(function (err, res) {
                if (err) return done(err);
                Activity.find({repo: 'test-repo'}).then(function (posts) {
                    // if(err) {return err};
                    console.log(posts.length);
                    posts.length.should.be.equal(1);
                    posts[0].timestamp.should.be.equal('2016-10-25T20:31:26-05:00')
                    done();
                });
            });
    });


    it('should respond with JSON array', function (done) {
        request(app)
            .post('/api/activities').send(githubWebhookDoubleUser)
            .expect(200)
            .end(function (err, res) {
                if (err) return done(err);
                Activity.find({repo: 'blog-1-anonymous-blog-challenge'})
                    .exec(function (err, posts) {
                        // console.log(posts)
                    });
                done();
            });
    });
});
