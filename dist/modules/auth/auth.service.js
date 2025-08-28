"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const user_model_1 = require("../../DB/model/user.model");
const user_repository_1 = require("../../DB/repository/user.repository");
const error_response_1 = require("../../utils/response/error.response");
const hash_security_1 = require("../../utils/security/hash.security");
const email_event_1 = require("../../utils/event/email.event");
const otp_1 = require("../../utils/otp");
class AuthenticationService {
    userModel = new user_repository_1.UserRepository(user_model_1.UserModel);
    constructor() { }
    signup = async (req, res) => {
        let { username, email, password } = req.body;
        console.log({ username, email, password });
        const CheckUserExist = await this.userModel.findOne({
            filter: { email },
            select: "email",
            options: {
                lean: false
            }
        });
        console.log({ CheckUserExist });
        if (CheckUserExist) {
            throw new error_response_1.ConflictException(" Email exist ");
        }
        const otp = (0, otp_1.generateNumperOtp)();
        const user = await this.userModel.createUser({
            data: [{ username,
                    email,
                    password: await (0, hash_security_1.generateHash)(password),
                    confirmEmailOtp: await (0, hash_security_1.generateHash)(String(otp)) }],
        });
        email_event_1.emailEvent.emit("confirmEmail", {
            to: email, otp
        });
        return res.status(201).json({ message: " Done ", data: { user } });
    };
    confirmEmail = async (req, res) => {
        const { email, otp } = req.body;
        const user = await this.userModel.findOne({
            filter: {
                email,
                confirmEmailOtp: { $exists: true },
                confirmedAt: { $exists: false }
            }
        });
        if (!user) {
            throw new error_response_1.NotFoundException("Invalid Account ");
        }
        if (!await (0, hash_security_1.compareeHash)(otp, user.confirmEmailOtp)) {
            throw new error_response_1.ConflictException("innalid confirm");
        }
        await this.userModel.updateOne({
            filter: { email },
            update: {
                confirmedAt: new Date(),
                $unset: { confirmEmailOtp: 1 }
            }
        });
        return res.json({ message: " Done " });
    };
    login = (req, res) => {
        return res.json({ message: " Done ", data: req.body });
    };
}
exports.default = new AuthenticationService();
