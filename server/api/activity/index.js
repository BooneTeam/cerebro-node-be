'use strict';

var express = require('express');
var controller = require('./activity.controller');

var router = express.Router();

router.get('/', controller.index);
router.get('/furthest', controller.furthestAction);
router.get('/cohorts', controller.cohortsWithActions);
router.get('/:id', controller.show);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.patch('/:id', controller.update);
router.delete('/:id', controller.destroy);


module.exports = router;
