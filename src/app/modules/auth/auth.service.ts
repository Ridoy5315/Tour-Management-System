/* eslint-disable @typescript-eslint/no-non-null-assertion */
import bcryptjs from 'bcryptjs';
import httpStatus from 'http-status-codes';
import AppError from "../../errorHelpers/AppError";
import { IAuthProvider, IsActive } from "../user/user.interface"
import { User } from "../user/user.model";
import { createNewAccessTokenWithRefreshToken } from '../../utils/userTokens';
import { verifyToken } from '../../utils/jwt';
import { envVars } from '../../config/env';
import { JwtPayload } from 'jsonwebtoken';



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

     return {}


}

const setPassword = async (userId: string, plainPassword: string) => {
    const user = await User.findById(userId);

    if(!user){
        throw new AppError(httpStatus.BAD_REQUEST, "User not found")
    }

    if(user.password && user.auths.some(providerObject => providerObject.provider === 'google')){
        throw new AppError(httpStatus.BAD_REQUEST, "You have already set you password. Now you can change the password from your profile password update")
    }

    const hashedPassword = await bcryptjs.hash(plainPassword, Number(envVars.BCRYPT_SALT_ROUND))

    const credentialProvider: IAuthProvider = {
        provider: "credentials",
        providerId: user.email
    }

    const auths: IAuthProvider[] = [...user.auths, credentialProvider]

    user.password = hashedPassword

    user.auths = auths

    await user.save()

}

const changePassword = async (oldPassword: string, newPassword: string, decodedToken: JwtPayload) => {

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
     changePassword,
     resetPassword,
     setPassword
}