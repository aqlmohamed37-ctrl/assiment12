import type { Request , Response } from "express"
import type { IconfirmEmailBodyINputDto, IsignupBodyINputDto } from "./auth.dto";
import { UserModel } from "../../DB/model/user.model";
import { UserRepository } from "../../DB/repository/user.repository";
import { ConflictException, NotFoundException } from "../../utils/response/error.response";
import { compareeHash, generateHash } from "../../utils/security/hash.security";
import { emailEvent } from "../../utils/event/email.event";
import { generateNumperOtp } from "../../utils/otp";


class AuthenticationService{
 
    private userModel = new UserRepository(UserModel)
    constructor  () {}

    signup = async (req:Request , res:Response) : Promise<Response> => {

 let {username, email , password}:IsignupBodyINputDto = req.body  
 console.log({username,email , password});


   const CheckUserExist = await this.userModel.findOne({
    filter : {email},
    select : "email",
   options :{
    lean:false
   }
})
  console.log({CheckUserExist});
  if (CheckUserExist){
    throw new ConflictException(" Email exist ")
  }

  const otp = generateNumperOtp()

 const user = await this.userModel.createUser({
    data : [{ username,
    email,
    password : await generateHash(password) ,
    confirmEmailOtp :await generateHash(String(otp) )}] ,

});

emailEvent.emit("confirmEmail" ,{
  to : email ,   otp })
 return res.status(201).json({message : " Done ", data : {user}})
}



   confirmEmail = async( req:Request, res:Response):Promise <Response> => {
    const {email , otp } : IconfirmEmailBodyINputDto=req.body

    const user = await this.userModel.findOne({
        filter:{
         email ,
         confirmEmailOtp:{$exists:true},
         confirmedAt:{$exists:false}   
        }
    })
   if (!user) {
    throw new NotFoundException ("Invalid Account ")
   }
   if (!await compareeHash(otp ,user.confirmEmailOtp as string)) {
    throw new ConflictException ("innalid confirm")
   }
      await this.userModel.updateOne({
        filter: {email},
        update:{
            confirmedAt : new Date(),
            $unset:{confirmEmailOtp: 1}
        }
      })

    return res.json({message : " Done "})
}



   login = ( req:Request, res:Response) : Response => {
    return res.json({message : " Done ", data : req.body})
}


}

export default new AuthenticationService()