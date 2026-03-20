import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import 'dotenv/config';

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'API de Órdenes - Restaurante',
            version: '1.0.0',
            
        },
        servers: [
            {
                url: process.env.API_URL || 'http://localhost:3005',
                description: 'Servidor de desarrollo local'
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT'
                }
            }
        }
    },
    apis: ['./src/routes/*.js'], // Esto capturará todas las rutas en el directorio routes
};

const swaggerSpec = swaggerJsdoc(options);

const swaggerDocs = (app) => {
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
    console.log(`Documentación Swagger disponible en: ${process.env.API_URL || 'http://localhost:3005'}/api-docs`);
};

export default swaggerDocs;