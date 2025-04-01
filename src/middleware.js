import { JWT_SECRET } from "../config.js";
import jwt from "jsonwebtoken";


export const authMiddleware = async(req,res,next) => {
         const header = req.headers.authorization;
         if(!header || !header.startsWith('Bearer'))
         {
            return res.status(403).json({
               message : "Incorrect token Format "
            })
         }
         const token = header.split(' ')[1];
         try{
            const decoded = jwt.verify(token , JWT_SECRET);
            if(decoded)
            {
               req.userId = decoded.userId;
               next();
            }
            else
            {
               res.status(403).json({
                   message : "You are not logged in"
               })
            }
         }catch(error){
            console.error("There was some error: " , error)
         }       
}