import mongoose, { model, Schema } from "mongoose";
import { MONGO_URL } from "../config.js";
mongoose.connect(MONGO_URL);

const userSchema = new Schema({
    username : { type : String , required : true , unique : true , trim : true , lowercase : true , minLength : 3 , maxLength : 30 },
    password : {type : String , required : true , minLength : 6},
    firstName: {type : String , required : true , maxLength : 50 , trim : true},
    lastName : {type : String , required : true , maxLength : 50 , trim : true}
})
// User Model
export const UserModel = model('User' , userSchema);
