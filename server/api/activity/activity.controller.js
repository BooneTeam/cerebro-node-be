'use strict';

var _ = require('lodash');
var Activity = require('./activity.model');

// Get list of activity
exports.index = function (req, res) {
    if (!_.isEmpty(req.query)) {
        return queryActivities(req.query, function (activities) {
            return res.status(200).json(activities)
        })
    } else {
        Activity.find().populate('_user').exec(function (err, activitys) {
            if (err) {
                return handleError(res, err);
            }
            return res.status(200).json(activitys);
        });
    }
};

exports.cohortsWithActions = function(req,res){
    if (!_.isEmpty(req.query)) {
        return queryActivities(req.query, function (activities) {
            var uniqCohorts =  _.uniqBy(activities,'cohort' );
            var cohorts = _.map(uniqCohorts, 'cohort');
            return res.status(200).json(cohorts)
        })
    } else {
        Activity.find().exec(function (err, activities) {
            if (err) {
                return handleError(res, err);
            }
            var uniqCohorts =  _.uniqBy(activities,'cohort' );
            var cohorts = _.map(uniqCohorts, 'cohort');
            return res.status(200).json(cohorts);
        });
    }
};

var queryActivities = function (queryParams, cb) {
    Activity.find(queryParams).populate('_user').exec(function (err, activities) {
        var group = _.groupBy(activities, function (act) {
            return act._doc._user.github.name
        });
        var furthestActivities= getFurthestActionsCompleted(group)

        if (err) {
            return handleError(res, err);
        }
        cb(furthestActivities)
    });
};

exports.furthestAction = function (req, res) {
    Activity.find().populate('_user').exec(function (err, activitys) {
        var group = _.groupBy(activitys, function (act) {
            return act._doc._user.github.name
        });

        var furthestActivities = getFurthestActionsCompleted(group);

        if (err) {
            return handleError(res, err);
        }
        return res.status(200).json(furthestActivities);
    });
};

var getFurthestActionsCompleted = function (group) {
return  _.flatten(
        _.map(group,
            function (groupNow) {
                return _.map(
                    _.groupBy(groupNow,
                        function (act) {
                            return act.repo
                        }),
                    function (value) {
                        return value
                    }).map(
                    function (arr) {
                        return arr.sort(
                            function (a, b) {
                                return b.statusNumbers() - a.statusNumbers()
                            })[0]
                    })
            }));
};

// Get a single activity
exports.show = function (req, res) {
    Activity.findById(req.params.id, function (err, activity) {
        if (err) {
            return handleError(res, err);
        }
        if (!activity) {
            return res.status(404).send('Not Found');
        }
        return res.json(activity);
    });
};

// Creates a new activity in the DB.
exports.create = function (req, res) {
    Activity.buildFromWebHook(req.body, function (err, activity) {
        if (err) {
            return handleError(res, err);
        }
        console.log(err);
        return res.status(201).json(activity)
        // Activity.create(activity, function (err, activity) {
        //     if (err) {
        //         return handleError(res, err);
        //     }
        //     return res.status(201).json(activity);
        // });
    });
};

// Updates an existing activity in the DB.
exports.update = function (req, res) {
    if (req.body._id) {
        delete req.body._id;
    }
    Activity.findById(req.params.id, function (err, activity) {
        if (err) {
            return handleError(res, err);
        }
        if (!activity) {
            return res.status(404).send('Not Found');
        }
        var updated = _.merge(activity, req.body);
        updated.save(function (err) {
            if (err) {
                return handleError(res, err);
            }
            return res.status(200).json(activity);
        });
    });
};

// Deletes a activity from the DB.
exports.destroy = function (req, res) {
    Activity.findById(req.params.id, function (err, activity) {
        if (err) {
            return handleError(res, err);
        }
        if (!activity) {
            return res.status(404).send('Not Found');
        }
        activity.remove(function (err) {
            if (err) {
                return handleError(res, err);
            }
            return res.status(204).send('No Content');
        });
    });
};

function handleError(res, err) {
    return res.status(500).send(err);
}
