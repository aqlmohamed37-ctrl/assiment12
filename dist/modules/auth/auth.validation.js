"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.confirmEmail = exports.signup = exports.login = void 0;
const validation_middleware_1 = require("../../middleware/validation.middleware");
const zod_1 = require("zod");
exports.login = {
    body: zod_1.z.strictObject({
        email: validation_middleware_1.generalFields.email,
        password: validation_middleware_1.generalFields.password,
        confirmPassword: validation_middleware_1.generalFields.confirmPassword
    })
};
exports.signup = {
    body: exports.login.body.extend({
        email: validation_middleware_1.generalFields.email,
        otp: validation_middleware_1.generalFields.otp
    })
        .superRefine((data, ctx) => {
        console.log({ data, ctx });
        if (data.confirmPassword !== data.password) {
            ctx.addIssue({
                code: "custom",
                path: ["confirmEmail"],
                message: "password mismatch confirmPassword"
            });
        }
        if (data.username?.split(" ")?.length != 2) {
            ctx.addIssue({
                code: "custom",
                path: ["username"],
                message: "username must consist of 2 parts like ex:JONE DOE"
            });
        }
    })
};
exports.confirmEmail = {
    body: zod_1.z.strictObject({
        email: validation_middleware_1.generalFields.email,
        otp: validation_middleware_1.generalFields.otp
    })
};
