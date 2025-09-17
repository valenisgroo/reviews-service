import dotenv from 'dotenv'
dotenv.config()

export const { PORT, MONGODB_URI, RABBIT_URL } = process.env
