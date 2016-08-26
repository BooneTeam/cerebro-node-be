'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var RepoSchema = new Schema({
  name: String,
  url: String,
  organization_id: Schema.Types.ObjectId
});

module.exports = mongoose.model('Repo', RepoSchema);
