import { generalFields } from '../../middleware/validation.middleware';
import {z} from "zod"

export const login ={
    body: z.strictObject ({
        email: generalFields.email,
        password:generalFields.password,
        confirmPassword:generalFields.confirmPassword
    })
}



export const signup ={
    body: login.body.extend ({
        email: generalFields.email,
        otp:generalFields.otp
    })
    .superRefine((data , ctx) => {
        console.log({data ,ctx});

        if (data.confirmPassword !== data.password){
    ctx.addIssue({
        code:"custom",
        path: ["confirmEmail"],
        message: "password mismatch confirmPassword"

    })
}
 
if (data.username?.split(" ")?.length!=2){
    ctx.addIssue({
        code:"custom",
        path: ["username"],
        message: "username must consist of 2 parts like ex:JONE DOE"

    })
}

    })
}

export const confirmEmail ={
    body: z.strictObject ({
        email: generalFields.email,
        otp:generalFields.otp
    })
  
}
