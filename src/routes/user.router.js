import {Router} from "express"
import {loginUser,
    logoutUser,
    refreshAccessToken,
    passwordChange,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvtar,
    updateUserImage} from "../controllers/user.controllers.js";
import {upload} from "../middlewares/multer.middlewares.js";
import {jwtVerify} from "../middlewares/auth.middlewares.js"


const router = Router();

router.route("/register").post(
    upload.fields([
        {
            name:"avtar",
            maxCount:1
        },
        {
            name:"coverImage",
            maxCount:1
        }
    ])
    ,registerUser);

router.route("/login").post(loginUser)
 

router.route("/logout").post(jwtVerify,logoutUser)

router.route("/refresh-token").post(refreshAccessToken)

router.route("/password-change").patch(passwordChange)

router.route("/update-account-detail").patch(jwtVerify,updateAccountDetails)
router.route("/update-user-avtar").patch(updateUserAvtar)
router.route("/update-user-image").patch(updateUserImage)


export default router