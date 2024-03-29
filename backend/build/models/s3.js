"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getIcon = exports.uploadIcon = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const errorMessages_1 = require("../const/errorMessages");
const s3 = new client_s3_1.S3();
const uploadIcon = (file, auth0id, evaluatorName) => __awaiter(void 0, void 0, void 0, function* () {
    const iconBuffer = Buffer.from(file.buffer);
    const fileName = `${new Date().getTime()}.${file.mimetype.split('/')[1]}`;
    const key = auth0id ? `user/${auth0id}/${fileName}` : `evaluator/${evaluatorName}/${fileName}`;
    try {
        yield s3.putObject({
            Body: iconBuffer,
            Bucket: process.env.CYCLIC_BUCKET_NAME || '',
            Key: key,
        });
        return key;
    }
    catch (e) {
        console.error('uploadIcon error: ', e);
        throw new Error(errorMessages_1.errorMessages.icon.create);
    }
});
exports.uploadIcon = uploadIcon;
const getIcon = (key) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const icon = yield s3.getObject({
            Bucket: process.env.CYCLIC_BUCKET_NAME || '',
            Key: key,
        });
        return icon;
    }
    catch (e) {
        console.error('getIcon error: ', e);
        throw new Error(errorMessages_1.errorMessages.icon.get);
    }
});
exports.getIcon = getIcon;
