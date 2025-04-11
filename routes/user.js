import express from "express";
import {z} from "zod"; 
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { accountModel, UserModel } from "../src/db.js";
import { JWT_SECRET } from "../config.js";
import { authMiddleware } from "../src/middleware.js";
export const userRouter = express.Router();

// Validation Schema , as we need to validate the data coming from the user
const usernameSchema = z.string().min(3 , "Length of username should be between 3 and 30 letters").max(30);
const passwordSchema = z.string()
.min(6 , "The Password must at least contain 6 characters");
const lastnameSchema = z.string()
.max(50 , "LastName Should not contain more than 50 characters.");
const firstnameSchema = z.string()
.max(50 , "First name must not have more than 50 characters.");

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
            return res.status(403).json({
                message : "User Already exists with this username"
            })
        }

        // If this user is a new user , first create the hashed password and then make an entry to the database
        const hashedPass = await hashPassword(validData.password);

        // Save to database 
       const user = await UserModel.create({
            username : validData.username,
            password : hashedPass,
            firstName : validData.firstName,
            lastName : validData.lastName
        })

        //We need to assign the user a random balance between 1 and 10000
        const userId = user._id;
        await accountModel.create({
            userId : userId,
            balance : 1 + Math.random() * 10000

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
const signinSchema = z.object({
    username : usernameSchema,
    password : passwordSchema
})
const signinHandler = async(req,res) => {
 try{
    // First of all validate the data
    const userData = signinSchema.parse(req.body);
    
    //Check the entry in the db 
    const user = await UserModel.findOne({
        username : userData.username
    })

    if(!user) // if no such user exists
    {
      return res.status(403).json({
        message : "No such user exists"
      })
    }

    const isMatch = await bcrypt.compare(userData.password , user.password);
    if(!isMatch)
    {
        return res.status(403).json({
            message : "Incorrect Password Entered"
        })
    }
    const userId = user._id;

    // If the password matches , then we have to return the user a jwt token that can be used in all the authenticated end points in the future
    const token = jwt.sign({
        userId : userId
    } , JWT_SECRET);

    res.json({
        token : token
    })

 }catch(error){
    if(error instanceof z.ZodError)
    {
       return res.status(411).json({
            message : "There is Some Error in the user Input",
            error : error.errors
        })
    }
    console.error("There was some error: ", error)
    return res.status(500).json({
        message : "Some error occured in the server"
    })
 }

}

userRouter.post("/signin" , signinHandler);
const updateSchema = z.object({
    password : z.string().min(6 , "The password must be at least 6 characters long").optional(),
    firstName : z.string().max(50 ,"The maximimum length allowed for firstName is 50 characters only").optional(),
    lastName :   z.string().max(50 ,"The maximimum length allowed for lastName is 50 characters only").optional()
})
const updateHandler = async(req,res) => {
    try{
        const updateData = updateSchema.parse(req.body);
        const userId = req.userId;

        if(updateData.password)
        {
            //i.e if the password exists , we need to hash it before insertig it into the database
            const hashedPassword = await hashPassword(updateData.password);
            //modify the password field of updateData
            updateData.password = hashedPassword;
        }

        await UserModel.updateOne({
            _id : userId
        }, updateData);

        res.json({
            message : "Information updated successfully"
        })

    }catch(error){
        if(error instanceof z.ZodError)
        {
            return res.status(411).json({
                message : "Error while updating Information",
                error : error.errors
            })
        }
        console.error("There was some error : ",error)
        return res.status(500).json({
            message : "There was some problem"
        })
    }
}


userRouter.put("/update" , authMiddleware, updateHandler);

// Writing a route to get all the users enrolled in the application based on a query parameter
userRouter.get("/bulk" , authMiddleware,  async(req,res) => {
    const filter = req.query.filter || "";

    const users = await UserModel.find({
        $or : [{
            firstName : {
                "$regex" : filter,
                $options : 'i'
            }
        },{
            lastName : {
                "$regex" : filter,
                $options : 'i'
            }
        }]
    })

    res.json({
        user : users.map(user => ({
            username : user.username,
            firstName : user.firstName,
            lastName : user.lastName,
            _id : user._id
        }))
    })
})

