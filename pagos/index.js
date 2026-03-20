import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pagoRoutes from './src/routes/pagoRoutes.js';
import swaggerDocs from './src/config/swagger.js';

// Cargar variables de entorno
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3004;

// Configurar CORS
app.use(cors());

// Middleware para parsing JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas
app.use('/api/pagos', pagoRoutes);

// Documentación Swagger
swaggerDocs(app);

// Ruta de salud
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    service: 'Pagos Service',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: 'Error interno del servidor'
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Pagos Service running on port ${PORT}`);
  console.log(`API Documentation: http://localhost:3004/api-docs`);
});

export default app;