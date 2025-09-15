import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import { PORT } from './config/dotenv.js';
import { connectDB } from './config/bd.js';

const app = express();

app.use(cors());

// Middleware para parsear JSON
app.use(express.json());

app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});

connectDB();
