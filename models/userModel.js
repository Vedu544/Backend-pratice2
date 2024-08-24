import mongoose ,{Schema} from 'mongoose'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'

const userSchema = new Schema(
    {
        username:{
            type : String,
            required : [true,"please enter a username"],
            unique : true,
            trim : true,
            index :  true  
        },
        email:{
            type:String,
            required : [true,"please enter email address"],
            unique : true,
            lowercase : true,
            trim : true,
            index :  true  
        },
        password: { 
           type : String,
           required : [true,"require a password"],

        },
        refreshToken : {
            type : String
        }
    },
    {
        timestamps: true
    }
)

userSchema.pre('save',async function(next){
    if(!this.isModified('password')) return next()
    this.password = await bcrypt.hash(this.password ,10 )
    next()
})

userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(this.password,password)
}

userSchema.methods.genrateAccessToken = function(){
    return jwt.sign(
        {
            _id : this._id,
            username : this_username,
            password : this.password,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
         expiresIn :    process.env.ACCESS_TOKEN_EXPIRY 
        }
    )
}

userSchema.methods.genrateRefreshToken = function(){
    return jwt.sign(
        {
            _id : this._id
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn : process.env.REFRESH_TOKEN_EXPIRY
        }
    )
    
}
export const User = mongoose.model('AUTHUSERS',userSchema)