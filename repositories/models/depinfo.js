"use strict"

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var depSchema = new Schema({
    code: { type: String },
    name: { type: String },
    factory: { type: String },
    location: { type: String },
    keeper: { type: String },
    manager: { type: String },
    staff: { type: String },
    proxer: { type: String },
    seniorManager: { type: String },
    generalManager: { type: String }
});

module.exports = mongoose.model('Depmodel', depSchema, "cig_dep");
