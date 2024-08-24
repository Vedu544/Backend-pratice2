import dotenv from 'dotenv'
import connectDB from './db/db.js'
import {app} from './app.js'

dotenv.config({
    path : '/env'
})

connectDB()
.then(()=>{
    app.listen(process.env.PORT || 4000,()=>{
        console.log(`listening on port ${process.env.PORT} `)
    })
}).catch((err)=>{
    console.log("mongodb connection error",err)

})

export default connectDB