import mongoose, { model, Schema } from "mongoose";
mongoose.connect("Put Your MongoDB URL here");

const userSchema = new Schema({
    username : { type : String , required : true , unique : true , trim : true , lowercase : true , minLength : 3 , maxLength : 30 },
    password : {type : String , required : true , minLength : 6},
    firstName: {type : String , required : true , maxLength : 50 , trim : true},
    lastName : {type : String , required : true , maxLength : 50 , trim : true}
})
// User Model
export const UserModel = model('User' , userSchema);
