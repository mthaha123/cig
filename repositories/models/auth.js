"use strict"

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var authSchema = new Schema({
    name: { type: String },
    type: { type: String },
});

module.exports = mongoose.model('AuthModel', authSchema, "cig_auth");
