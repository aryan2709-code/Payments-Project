import express from "express";
import {z} from "zod"; 
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { UserModel } from "../src/db.js";
export const userRouter = express.Router();

// Validation Schema , as we need to validate the data coming from the user
const usernameSchema = z.string().min(3 , "The Username Should be between 3 and 30 letters").max(30);
const passwordSchema = z.string()
.min(6 , "The Password must at least contain 6 characters");
const lastnameSchema = z.string()
.max(50 , "LastName Should contain 50 characters at most ");
const firstnameSchema = z.string()
.max(50 , "The First name must contain 50 characters at max.");

// Wrap the above four schemas in a single final zod schema
const SignUpSchema = z.object({
    username :  usernameSchema,
    password :  passwordSchema,
    firstName : firstnameSchema,
    lastName :  lastnameSchema 
});

// Write a function to hash the password . If the user entry is valid , then we need to enter the hashed password into the database , not the original password.
async function hashPassword(originalPassword) {
   let s = originalPassword;
   const saltRounds = 10;
   return await bcrypt.hash(s , saltRounds);

}

// Writing a signUp Handler to handle all the signup requests
const signUpHandler = async(req , res) => {
    try{
        const validData = SignUpSchema.parse(req.body);
        // If we don't want to use a try catch block , then we can simply use safeParse here and handle the result object returned by the safeParse function

        // Check if the user already exists
        const existingUser = await UserModel.findOne({
            username : validData.username
        })

        if(existingUser)
        {
            return res.status(411).json({
                message : "User Already exists with this username"
            })
        }

        // If this user is a new user , first create the hashed password and then make an entry to the database
        const hashedPass = await hashPassword(validData.password);

        // Save to database 
        await UserModel.create({
            username : validData.username,
            password : hashedPass,
            firstName : validData.firstName,
            lastName : validData.lastName
        })

        return res.status(200).json({
            message : "User Signed Up Successfully"
        })

    }catch(error){
        // We need to efficiently catch errors here
        if(error instanceof z.ZodError)
        {
            return res.status(411).json({
                message : "Error In Inputs",
                errors : error.errors
            })
        }
        console.error("Server Error:" , error);
        return res.status(500).json({
            message : "Server Error"
        })
    }
}

userRouter.post("/signup" , signUpHandler);