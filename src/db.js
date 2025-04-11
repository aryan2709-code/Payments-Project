import mongoose, { model, Schema } from "mongoose";
import { MONGO_URL } from "../config.js";
import { number } from "zod";
mongoose.connect(MONGO_URL);

const userSchema = new Schema({
    username : { type : String , required : true , unique : true , trim : true , lowercase : true , minLength : 3 , maxLength : 30 },
    password : {type : String , required : true , minLength : 6},
    firstName: {type : String , required : true , maxLength : 50 , trim : true},
    lastName : {type : String , required : true , maxLength : 50 , trim : true},
    pin : {type : String , required : true}
})
// User Model
export const UserModel = model('User' , userSchema);

// We need to create another schema named as account schema 
const accountSchema = new Schema({
    userId : {type : mongoose.Schema.Types.ObjectId , ref : 'User' , required: true},
    balance : {type : Number , required : true}
})

export const accountModel = model('Account' , accountSchema);