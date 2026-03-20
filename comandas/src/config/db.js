import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

// Configurar dotenv al inicio
dotenv.config();

// Verificar las variables de entorno
const requiredEnvVars = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
        console.error(`Error: Variable de entorno ${envVar} no está definida`);
    }
}

const pool = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 5432
});

console.log('Configuración de conexión a la base de datos:', {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 5432
});

export { pool };
