import {ApiError} from '../db/utils/apiError.js'
import {asyncHandler} from '../db/utils/asyncHandler.js'
import {User } from '../models/userModel.js'
import jwt from 'jsonwebtoken';


export const verifyJWT = asyncHandler(async(req,res,next)=>{
    try {
        // get the token by cookies
        const token = req.cookies?.accesstoken || req.header("thorization").replace("Bearer" , "")

        if(!token){
            throw new ApiError(401, "Invalid token")
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        const user = await User.findById(decodedToken?._id).select("-password , -refreshtoken")

        if(!user){
            throw new ApiError(401, "unauthorized request")
        }

        req.user = user
        next()
    } catch (error) {
        throw new ApiError(401,"Invalid token or expired token")
    }
})