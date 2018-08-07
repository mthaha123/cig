"use strict"

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var supplierSchema = new Schema({
    name: { type: String },
    state: { type: Boolean }
});

module.exports = mongoose.model('supplierModel', supplierSchema, "cig_supplier");