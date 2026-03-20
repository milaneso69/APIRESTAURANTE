import swaggerJsDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import dotenv from 'dotenv';

dotenv.config();

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'API de Productos - Restaurante',
            version: '1.0.0',
            
        },
        servers: [
            {
                url: process.env.API_URL || "http://localhost:3003",
                description: "Servidor de desarrollo"
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT'
                }
            },
            schemas: {
                Product: {
                    type: 'object',
                    required: ['name_product', 'price_product', 'category_id'],
                    properties: {
                        id: {
                            type: 'integer',
                            description: 'ID único del producto'
                        },
                        name_product: {
                            type: 'string',
                            description: 'Nombre del producto'
                        },
                        price_product: {
                            type: 'number',
                            description: 'Precio del producto'
                        },
                        stock: {
                            type: 'integer',
                            description: 'Cantidad disponible del producto'
                        },
                        description_product: {
                            type: 'string',
                            description: 'Descripción del producto'
                        },
                        image_product: {
                            type: 'string',
                            description: 'URL o base64 de la imagen del producto'
                        },
                        category_id: {
                            type: 'integer',
                            description: 'ID de la categoría a la que pertenece el producto'
                        },
                        created_at: {
                            type: 'string',
                            format: 'date-time',
                            description: 'Fecha de creación del registro'
                        },
                        updated_at: {
                            type: 'string',
                            format: 'date-time',
                            description: 'Fecha de última actualización'
                        },
                        deleted_at: {
                            type: 'string',
                            format: 'date-time',
                            description: 'Fecha de eliminación (soft delete)'
                        }
                    }
                }
            }
        }
    },
    apis: ['./src/routes/*.js'],
};

const swaggerSpec = swaggerJsDoc(options);

export default function swaggerDocs(app) {
    app.use(
        "/api-docs",
        swaggerUi.serve,
        swaggerUi.setup(swaggerSpec)
    );
    console.log(`Documentación Swagger disponible en: ${process.env.API_URL || 'http://localhost:3003'}/api-docs`);
}