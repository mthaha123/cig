"use strict"

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var materialsSchema = new Schema({
    code: { type: String },
    order: { type: String},
    type: { type: String, default: "NA"},  //"NA":无分类    "CAL"    "ESD"   "待确认"
    description:{ type: String},
    supplier:{ type: String},
    num: {type: Number},
    user: {type: String},
    updateTime:{ type: Date },
    createTime: { type: Date},
    complete:{type: Boolean},
    log:{type: Object},
    isDelete: { type: Boolean, default: false},

},{timestamps:{
    updatedAt: "updateTime",
}});

module.exports = mongoose.model('materialsModel', materialsSchema, "cig_materials");