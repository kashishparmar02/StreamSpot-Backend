import { Router } from "express";
import { loginUser, registerUser,logoutUser, refreshAccessToken } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";


const router=Router()


router.route("/register").post(
    //upload middleware , fields for mulitple files, here 2 avatar and cover so 2 objects
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name:"coverImage",
            maxCount: 1
        }
    ]),
    registerUser
)


router.route("/login").post(loginUser)

//secured routes

router.route("/logout").post(verifyJWT,logoutUser) //inserted middleware before logout
router.route("/refresh-token").post(
    refreshAccessToken
)
export default router