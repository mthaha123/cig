"use strict"

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var matCodeSchema = new Schema({
    code: { type: String },
    type: { type: String, default: "NA"},  //"NA":无分类    "cam"    "ESD"
    description:{ type: String},
    supplier:{ type: String},
    updateTime:{ type: Date },
    createTime:{ type: Date },
},{timestamps:{
    updatedAt: "updateTime",
}});

module.exports = mongoose.model('matCodeModel', matCodeSchema, "cig_matCode");