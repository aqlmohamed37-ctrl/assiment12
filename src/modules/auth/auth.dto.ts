// export interface IsignupBodyINputDto{
//     username:string;
//     email:string;
//     password:string;
// }

import * as validators from "./auth.validation"
import {z} from 'zod'

export type IsignupBodyINputDto = z.infer<typeof validators.signup.body>
export type IconfirmEmailBodyINputDto = z.infer<typeof validators.confirmEmail.body>