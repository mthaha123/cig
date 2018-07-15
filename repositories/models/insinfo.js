"use strict"

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var insInfoSchema = new Schema({
    code: { type: String },
    name: { type: String },
    insCode: { type: String },
    depCode: { type: String },
    assertNo: { type: String },
    No: { type: String },
    specification: { type: String },
    modelNo: { type: String },
    startDate: { type: Date },
    factoryLabel: { type: String },
    testType: { type: String },
    period: { type: Number },
    periodUnit: { type: String },
    status: { type: String },
    nextStatus: { type: String },
    toConfirm: { type: String },
    endDate: { type: Date },
    isInit: { type: Boolean },
    keeper: { type: String },
    description: {
        type: String
    },
    extendFields: {
        type: Object
    },
});

module.exports = mongoose.model('InsInfoModel', insInfoSchema, "cig_insInfo");