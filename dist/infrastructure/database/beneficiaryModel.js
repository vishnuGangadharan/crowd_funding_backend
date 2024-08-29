"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const beneficiarySchema = new mongoose_1.Schema({
    fundraiser: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    fundraisingFor: { type: String, required: false },
    category: { type: String, required: true },
    relationWithBeneficiary: { type: String, required: false },
    name: { type: String, required: true },
    age: { type: Number, required: true },
    gender: { type: String, required: true },
    email: { type: String, required: true },
    isApproved: {
        type: String,
        enum: ['approved', 'pending', 'rejected'],
        default: 'pending',
        required: true
    },
    phone: { type: String },
    panNumber: { type: String, required: true },
    requestedAmount: { type: Boolean, default: false },
    userAadharNumber: { type: String, required: true },
    profilePic: { type: [String], required: true },
    blocked: { type: Boolean, default: false },
    supportingDocs: { type: [String], },
    amount: { type: Number, required: true },
    contributedAmount: { type: Number, default: 0 },
    startDate: { type: Date },
    targetDate: { type: Date, required: true },
    targetDateFinished: { type: Boolean, default: false },
    address: { type: String, required: true },
    heading: { type: String, required: true },
    bio: { type: String, required: true },
    fundRequestConfirmed: { type: Boolean, default: false },
    medicalDetails: {
        hospitalName: { type: String },
        hospitalPostalAddress: { type: String },
        hospitalState: { type: String },
        hospitalDistrict: { type: String },
        hospitalPin: { type: String }
    },
    educationDetails: {
        instituteName: { type: String },
        instituteDistrict: { type: String },
        institutePostalAddress: { type: String },
        instituteState: { type: String },
        institutePin: { type: String }
    }
}, { timestamps: true });
const beneficiaryModel = mongoose_1.default.model("beneficiary", beneficiarySchema);
exports.default = beneficiaryModel;
