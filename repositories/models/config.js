"use strict"

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userInfoSchema = new Schema({
    key: { type: String },
    value: { type: Object }
});

module.exports = mongoose.model('ConfigModel', userInfoSchema, "cig_config");
