/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var Activity = require('./activity.model');

exports.register = function(socket) {
  Activity.schema.post('save', function (doc) {
    onSave(socket, doc);
  });
  Activity.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });
}

function onSave(socket, doc, cb) {
  socket.emit('activity:save', doc);
}

function onRemove(socket, doc, cb) {
  socket.emit('activity:remove', doc);
}