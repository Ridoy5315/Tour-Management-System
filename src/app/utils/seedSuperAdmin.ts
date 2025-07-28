import { IAuthProvider, IUser } from "./../modules/user/user.interface";
import { envVars } from "../config/env";
import { User } from "../modules/user/user.model";
import { Role } from "../modules/user/user.interface";
import bcryptjs from "bcryptjs";

export const seedSuperAdmin = async () => {
  try {
    const isSuperAdminExist = await User.findOne({
      email: envVars.SUPER_ADMIN_EMAIL,
    });

    if (isSuperAdminExist) {
      console.log("Super Admin Already Exists!");
      return;
    }

    const hashedPassword = await bcryptjs.hash(
      envVars.SUPER_ADMIN_PASSWORD,
      Number(envVars.BCRYPT_SALT_ROUND)
    );

    const authProvider: IAuthProvider = {
      provider: "credentials",
      providerId: envVars.SUPER_ADMIN_EMAIL,
    };

    const payload: IUser = {
      name: "Super Admin",
      role: Role.SUPER_ADMIN,
      email: envVars.SUPER_ADMIN_EMAIL,
      password: hashedPassword,
      isVerified: true,
      auths: [authProvider],
    };

    const createAdmin = User.create(payload);
    console.log("Super Admin created successfully")
    console.log(createAdmin)

//     sendResponse(res, {
//       success: true,
//       statusCode: httpStatus.CREATED,
//       message: "Super Admin Created Successfully",
//       data: createAdmin,
//     });
  } catch (error) {
    console.log(error);
  }
};
