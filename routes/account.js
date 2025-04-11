import express from "express";
import { authMiddleware } from "../src/middleware.js";
import { accountModel } from "../src/db.js";
import mongoose from "mongoose";
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

// Most important bit of this class 
// how to write transactions in mongoDB
accountRouter.post("/transfer", authMiddleware, async (req, res) => {
    const session = await mongoose.startSession(); // Start session
    session.startTransaction();

    try {
        const amount = req.body.amount;
        const to = req.body.to;

        if (amount <= 0) {
            return res.status(400).json({ message: "Invalid amount. Must be greater than zero." });
        }
        if (req.userId === to) {
            return res.status(401).json({ message: "You cannot transfer money to yourself." });
        }

        const account = await accountModel.findOne({ userId: req.userId }).session(session);
        if (!account || account.balance < amount) {
            await session.abortTransaction();
            session.endSession();
            return res.status(402).json({ message: "Insufficient Balance" });
        }

        const toAccount = await accountModel.findOne({ userId: to }).session(session);
        if (!toAccount) {
            await session.abortTransaction();
            session.endSession();
            return res.status(403).json({ message: "Invalid account, no such account exists" });
        }


        await accountModel.updateOne({ userId: req.userId }, { $inc: { balance: -amount } }).session(session);
        await accountModel.updateOne({ userId: to }, { $inc: { balance: amount } }).session(session);

        //Commit the transaction
        await session.commitTransaction();
        session.endSession(); // Always end the session

        res.json({ message: "Transfer Successful" });

    } catch (error) {
        await session.abortTransaction();
        session.endSession(); // Ensure session cleanup
        return res.status(404).json({ message: "Transaction Failed", error: error.message });
    }
});



