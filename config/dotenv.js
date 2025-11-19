import dotenv from 'dotenv'
dotenv.config()

export const {
  PORT,
  MONGODB_URI,
  RABBIT_URL,
  AUTH_SERVICE_URL,
  ORDERS_SERVICE_URL,
} = process.env
