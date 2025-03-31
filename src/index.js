import express from "express";
import { router } from "../routes/index.js";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/v1" , router);
const PORT = 3000;
app.listen(PORT , () => {
    console.log(`Server is Running on http://localhost:${PORT}`);
}).on("error" , (err) => {
    console.error("Server Failed To Start: ", err.message )
})



