import mongoose from 'mongoose';
import { MONGODB_URI } from './dotenv.js';

export const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Conectado correctamente a la base de datos');
  } catch (error) {
    console.error('Error en la conexión a la base de datos:', error);
  }
};
