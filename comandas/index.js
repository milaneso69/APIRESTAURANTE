import dotenv from 'dotenv';
dotenv.config();
import cors from 'cors';
import express from 'express';
import bodyParser from 'body-parser';
import comandasRoutes from './src/routes/comandasRoutes.js';
import swaggerDocs from './src/config/swagger.js';

const app = express();

app.use(cors(
    {
        origin: '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: true //Habilitar credenciales (cookies, encabezados de autorización) para peticiones CORS
    }
));

swaggerDocs(app);
app.use(bodyParser.json());
app.use('/api/comandas', comandasRoutes);

const PORT = process.env.PORT || 3005;
app.listen(PORT, '0.0.0', () => {
    console.log(`Order Service is running on port ${PORT}`);
});

export default app;