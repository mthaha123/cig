"use strict"

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var insCodeSchema = new Schema({
    code: { type: String },
    name: { type: String }
});

module.exports = mongoose.model('InsCodeModel', insCodeSchema, "cig_inscode");
