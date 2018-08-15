"use strict"

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var materialsSchema = new Schema({
    code: { type: String },
    order: { type: String},
    type: { type: String, default: "NA"},  //"NA":无分类    "cam"    "ESD"
    description:{ type: String},
    supplier:{ type: String},
    num: {type: Number},
    user: {type: String},
    updateTime:{ type: Date },
    createTime: { type: Date},
    complete:{type: Boolean},
    log:{type: Object},

},{timestamps:{
    updatedAt: "updateTime",
}});

module.exports = mongoose.model('materialsModel', materialsSchema, "cig_materials");