import dotenv from "dotenv";
dotenv.config();

export const mongoUri = process.env.MONGO_URI;
export const port = process.env.PORT;
export const jwtSecret = process.env.JWT_SECRET;
