"use strict"

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var emailSchema = new Schema({
    name: { type: String },
    title: { type: String },
    content: { type: String },
});

module.exports = mongoose.model('EmailModel', emailSchema, "cig_email");
