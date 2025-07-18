import bcryptjs from 'bcryptjs';
import { Strategy as LocalStrategy } from 'passport-local';
import { Role } from '../modules/user/user.interface';
import { User } from './../modules/user/user.model';
import { envVars } from './env';
import passport, { Profile } from "passport";
import { Strategy as GoogleStrategy, VerifyCallback } from "passport-google-oauth20";

passport.use( new LocalStrategy({
     usernameField: "email",
     passwordField: "password"
}, async(email: string, password: string, done) => {
     try {
          const isUserExist = await User.findOne({email})

          // if(!isUserExist){
          //      return done(null, false, {message: "User does not exist"})
          // }
          if(!isUserExist){
               return done( "User does not exist")
          }

          const isGoogleAuthenticated = isUserExist.auths.some( providerObjects => providerObjects.provider === "google")

          // if(isGoogleAuthenticated){
          //      return done(null, false, {message: "You have authenticated through Google."})
          // }
          if(isGoogleAuthenticated && !isUserExist.password){
               return done("You have authenticated through Google.")
          }

          const isPasswordMatched = await bcryptjs.compare(password as string, isUserExist?.password as string)

          if(!isPasswordMatched){
               return done(null, false, {message: "Password does not matched"})
          }

          return done(null, isUserExist)
          
     } catch (error) {
          done(error)
     }
}))


passport.use(
     new GoogleStrategy(
          {
               clientID: envVars.GOOGLE_CLIENT_ID,
               clientSecret: envVars.GOOGLE_CLIENT_SECRET,
               callbackURL: envVars.GOOGLE_CALLBACK_URL
          }, async (accessToken: string, refreshToken: string, profile: Profile, done: VerifyCallback) => {
               try {
                    const email = profile.emails?.[0].value;
                    if(!email){
                         return done(null, false, {message: "No email fund"})
                    }
                    let user = await User.findOne({email})

                    if(!user){
                         user = await User.create({
                              email,
                              name: profile.displayName,
                              picture: profile.photos?.[0].value,
                              role: Role.USER,
                              isVerified: true,
                              auths: [
                                   {
                                        provider: "google",
                                        providerId: profile.id
                                   }
                              ]
                         })
                    }

                    return done(null, user)
               } catch (error) {
                    console.log("Google Strategy Error", error);
                    return done(error)
               }
          }
     )
)

// eslint-disable-next-line @typescript-eslint/no-explicit-any
passport.serializeUser((user: any, done: (err: any, id?: unknown) => void) => {
     done(null, user._id)
})

// eslint-disable-next-line @typescript-eslint/no-explicit-any
passport.deserializeUser(async (id: string, done: any) => {
     try {
          const user = await User.findById(id);
          done(null, user)
     } catch (error) {
          done(error)
     }
})