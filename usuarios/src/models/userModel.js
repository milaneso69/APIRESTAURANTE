import { pool } from "../config/db.js";
import axios from "axios";

export class EmpleadoModel {
    static async create(empleadoData) {
        const { auth_user_id, nombre, apellido_p, apellido_m, telefono } = empleadoData;
        const result = await pool.query(
            'INSERT INTO empleado (auth_user_id, nombre, apellido_p, apellido_m, telefono) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [auth_user_id, nombre, apellido_p, apellido_m, telefono]
        );
        return result.rows[0];
    }

    static async findAll() {
        const result = await pool.query('SELECT * FROM empleado WHERE activo = TRUE');
        return result.rows;
    }

    static async findById(id) {
        const result = await pool.query('SELECT * FROM empleado WHERE empleado_id = $1 AND activo = TRUE', [id]);
        return result.rows[0];
    }

    static async update(id, updateData) {
        const allowedFields = ['nombre', 'apellido_p', 'apellido_m', 'telefono', 'activo'];
        const updates = [];
        const values = [];
        let paramIndex = 1;
        
        for (const [key, value] of Object.entries(updateData)) {
            if (allowedFields.includes(key) && value !== undefined) {
                updates.push(`${key} = $${paramIndex}`);
                values.push(value);
                paramIndex++;
            }
        }
        
        if (updates.length === 0) throw new Error('No valid fields');
        
        const query = `UPDATE empleado SET ${updates.join(', ')} WHERE empleado_id = $${paramIndex} RETURNING *`;
        values.push(id);
        const result = await pool.query(query, values);
        return result.rows[0];
    }

    static async delete(id) {
        const result = await pool.query('UPDATE empleado SET activo = FALSE WHERE empleado_id = $1 RETURNING *', [id]);
        return result.rows[0];
    }
}

export class ClienteModel {
    static async create(clienteData) {
        const { auth_user_id, nombre, telefono } = clienteData;
        const result = await pool.query(
            'INSERT INTO cliente (auth_user_id, nombre, telefono) VALUES ($1, $2, $3) RETURNING *',
            [auth_user_id || null, nombre, telefono]
        );
        return result.rows[0];
    }

    static async findAll() {
        const result = await pool.query('SELECT * FROM cliente');
        return result.rows;
    }

    static async findById(id) {
        const result = await pool.query('SELECT * FROM cliente WHERE cliente_id = $1', [id]);
        return result.rows[0];
    }

    static async update(id, updateData) {
        const allowedFields = ['nombre', 'telefono'];
        const updates = [];
        const values = [];
        let paramIndex = 1;
        
        for (const [key, value] of Object.entries(updateData)) {
            if (allowedFields.includes(key) && value !== undefined) {
                updates.push(`${key} = $${paramIndex}`);
                values.push(value);
                paramIndex++;
            }
        }
        
        if (updates.length === 0) throw new Error('No valid fields');
        
        const query = `UPDATE cliente SET ${updates.join(', ')} WHERE cliente_id = $${paramIndex} RETURNING *`;
        values.push(id);
        const result = await pool.query(query, values);
        return result.rows[0];
    }

    static async delete(id) {
        const result = await pool.query('DELETE FROM cliente WHERE cliente_id = $1 RETURNING *', [id]);
        return result.rows[0];
    }
}