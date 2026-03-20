import { pool } from "../config/db.js";

export class PagoModel {
    static async create(pagoData) {
        const { orden_id, metodo, monto, referencia } = pagoData;
        const result = await pool.query(
            'INSERT INTO pago (orden_id, metodo, monto, referencia) VALUES ($1, $2, $3, $4) RETURNING *',
            [orden_id, metodo, monto, referencia]
        );
        return result.rows[0];
    }

    static async findAll() {
        const result = await pool.query('SELECT * FROM pago ORDER BY fecha_pago DESC');
        return result.rows;
    }

    static async update(id, updateData) {
        const allowedFields = ['metodo', 'monto', 'referencia'];
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
        
        const query = `UPDATE pago SET ${updates.join(', ')} WHERE pago_id = $${paramIndex} RETURNING *`;
        values.push(id);
        const result = await pool.query(query, values);
        return result.rows[0];
    }

    static async delete(id) {
        const result = await pool.query('DELETE FROM pago WHERE pago_id = $1 RETURNING *', [id]);
        return result.rows[0];
    }
}
