import express from "express";
import { authMiddleware } from "../src/middleware.js";
import { accountModel } from "../src/db.js";
export const accountRouter = express.Router();

accountRouter.get("/balance" , authMiddleware , async(req,res) => {
    const userId = req.userId;
    const account = await accountModel.findOne({
        userId : userId
    })

     if(!account)
     {
        return res.status(401).json({
            message : "Unauthenticated access"
        })
     }
     return res.json({
        balance : account.balance
     })
})


