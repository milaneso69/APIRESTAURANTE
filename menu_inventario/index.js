import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import platilloRoutes from './src/routes/platilloRoutes.js';
import swaggerDocs from './src/config/swagger.js';

// Cargar variables de entorno
dotenv.config();

// Inicializar Express
const app = express();
const PORT = process.env.PORT || 3003;

// Middleware
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true // Habilitar credenciales para peticiones CORS
}));

// Middleware para parsear JSON (con límite para imágenes)
app.use(express.json());
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Configuración de Swagger
swaggerDocs(app);

// Rutas de la API
app.use('/api/menu', platilloRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
    res.send('API de Productos - Restaurante');
});

// Iniciar servidor
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servicio de Productos ejecutándose en el puerto ${PORT}`);
});

export default app;