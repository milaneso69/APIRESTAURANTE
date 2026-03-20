import { pool } from "../config/db.js";

export class PlatilloModel {
    static async create(platilloData) {
        const { categoria_id, nombre, descripcion, precio, disponible } = platilloData;
        const result = await pool.query(
            'INSERT INTO platillo (categoria_id, nombre, descripcion, precio, disponible) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [categoria_id, nombre, descripcion, precio, disponible !== undefined ? disponible : true]
        );
        return result.rows[0];
    }

    static async findAll() {
        const result = await pool.query(`
            SELECT p.*, c.nombre as nombre_categoria 
            FROM platillo p 
            JOIN categoria_menu c ON p.categoria_id = c.categoria_id
        `);
        return result.rows;
    }

    static async findById(id) {
        const result = await pool.query('SELECT * FROM platillo WHERE platillo_id = $1', [id]);
        return result.rows[0];
    }

    static async update(id, updateData) {
        const allowedFields = ['categoria_id', 'nombre', 'descripcion', 'precio', 'disponible'];
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
        
        const query = `UPDATE platillo SET ${updates.join(', ')} WHERE platillo_id = $${paramIndex} RETURNING *`;
        values.push(id);
        const result = await pool.query(query, values);
        return result.rows[0];
    }

    static async delete(id) {
        const result = await pool.query('UPDATE platillo SET disponible = FALSE WHERE platillo_id = $1 RETURNING *', [id]);
        return result.rows[0];
    }
}

export class CategoriaMenuModel {
    static async findAll() {
        const result = await pool.query('SELECT * FROM categoria_menu');
        return result.rows;
    }
    
    static async create(nombre) {
        const result = await pool.query('INSERT INTO categoria_menu (nombre) VALUES ($1) RETURNING *', [nombre]);
        return result.rows[0];
    }

    static async findById(id) {
        const result = await pool.query('SELECT * FROM categoria_menu WHERE categoria_id = $1', [id]);
        return result.rows[0];
    }

    static async update(id, nombre) {
        const result = await pool.query('UPDATE categoria_menu SET nombre = $1 WHERE categoria_id = $2 RETURNING *', [nombre, id]);
        return result.rows[0];
    }

    static async delete(id) {
        const result = await pool.query('DELETE FROM categoria_menu WHERE categoria_id = $1 RETURNING *', [id]);
        return result.rows[0];
    }
}