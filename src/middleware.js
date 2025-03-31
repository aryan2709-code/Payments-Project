import { JWT_SECRET } from "../config";
import jwt from "jsonwebtoken";


export const authMiddleware = async(req,res,next) => {
         const header = req.headers.authorization;
         try{
            const decoded = jwt.verify(header , JWT_SECRET);
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