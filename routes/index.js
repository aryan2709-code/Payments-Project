// Creating an express router
import express from "express";
import { userRouter } from "./user";
export const router = express.Router();

router.use("/user" , userRouter);
