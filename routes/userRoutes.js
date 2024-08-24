import { Router } from "express";
import { verifyJWT } from '../middleware/auth.middleware.js'
import {registerUser,
    LoginUser,
    Logout,
    getCurrentUser,
    updateAccountDeatails} from '../controllers/user.controllers.js'

const router = Router()

router.route('/register').post(registerUser)
router.route('/login').post(LoginUser)
router.route('/logout').post(verifyJWT ,Logout)
router.route('/getCurrentUser').post(verifyJWT, getCurrentUser)
router.route('/updateAccountDeatails').post(verifyJWT , updateAccountDeatails)


export default router;