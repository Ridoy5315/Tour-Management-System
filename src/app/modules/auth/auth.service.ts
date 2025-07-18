/* eslint-disable @typescript-eslint/no-non-null-assertion */
import bcryptjs from 'bcryptjs';
import httpStatus from 'http-status-codes';
import AppError from "../../errorHelpers/AppError";
import { IsActive } from "../user/user.interface"
import { User } from "../user/user.model";
import { createNewAccessTokenWithRefreshToken } from '../../utils/userTokens';
import { verifyToken } from '../../utils/jwt';
import { envVars } from '../../config/env';
import { JwtPayload } from 'jsonwebtoken';

// const credentialsLogin = async (payload: Partial<IUser>) => {

//      const {email, password} = payload;

//      const isUserExist = await User.findOne({email});

//      if(!isUserExist){
//           throw new AppError(httpStatus.BAD_REQUEST, "Email does not Exist")
//      }

//      const isPasswordMatched = await bcryptjs.compare(password as string, isUserExist.password as string)

//      if(!isPasswordMatched){
//           throw new AppError(httpStatus.BAD_REQUEST, "Incorrect Password")
//      }

//      const userTokens = createUserToken(isUserExist)

//      // delete isUserExist.password;
//      // eslint-disable-next-line @typescript-eslint/no-unused-vars
//      const {password: pass, ...rest} = isUserExist.toObject()

//      return {
//           accessToken : userTokens.accessToken,
//           refreshToken : userTokens.refreshToken,
//           user: rest
//      }
// }


const getNewAccessToken = async (refreshToken : string) => {
     const verifiedRefreshToken = verifyToken(refreshToken, envVars.JWT_REFRESH_SECRET) as JwtPayload


    const isUserExist = await User.findOne({ email: verifiedRefreshToken.email })

    if (!isUserExist) {
        throw new AppError(httpStatus.BAD_REQUEST, "User does not exist")
    }
    if (isUserExist.isActive === IsActive.BLOCKED || isUserExist.isActive === IsActive.INACTIVE) {
        throw new AppError(httpStatus.BAD_REQUEST, `User is ${isUserExist.isActive}`)
    }
    if (isUserExist.isDeleted) {
        throw new AppError(httpStatus.BAD_REQUEST, "User is deleted")
    }

     const newAccessToken = await createNewAccessTokenWithRefreshToken(isUserExist)

    return {
        accessToken: newAccessToken
    }
}
const resetPassword = async (oldPassword: string, newPassword: string, decodedToken: JwtPayload) => {

     const user = await User.findById(decodedToken.userId)

     const isOldPasswordMatch = await bcryptjs.compare(oldPassword, user!.password as string)

     if(!isOldPasswordMatch){
          throw new AppError(httpStatus.UNAUTHORIZED, "Old Password does not match");
     }

     user!.password = await bcryptjs.hash(newPassword, Number(envVars.BCRYPT_SALT_ROUND))

     user!.save()

}

export const AuthServices= {
     getNewAccessToken,
     resetPassword
}