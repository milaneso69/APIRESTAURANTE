import { pool } from "../config/db.js";

export class MesaModel {
    static async findAll() {
        const result = await pool.query('SELECT * FROM mesa ORDER BY numero ASC');
        return result.rows;
    }
    static async updateEstado(mesa_id, estado) {
        const result = await pool.query('UPDATE mesa SET estado=$1 WHERE mesa_id=$2 RETURNING *', [estado, mesa_id]);
        return result.rows[0];
    }
    static async findById(id) {
        const result = await pool.query('SELECT * FROM mesa WHERE mesa_id = $1', [id]);
        return result.rows[0];
    }
}

export class ReservacionModel {
    static async create(data) {
        const { cliente_id, mesa_id, fecha_hora, personas, notas } = data;
        const result = await pool.query(
            'INSERT INTO reservacion (cliente_id, mesa_id, fecha_hora, personas, notas) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [cliente_id, mesa_id, fecha_hora, personas, notas]
        );
        return result.rows[0];
    }
    static async findAll() {
        const result = await pool.query('SELECT * FROM reservacion ORDER BY fecha_hora ASC');
        return result.rows;
    }
    static async findById(id) {
        const result = await pool.query('SELECT * FROM reservacion WHERE reservacion_id = $1', [id]);
        return result.rows[0];
    }
    static async update(id, data) {
        const { cliente_id, mesa_id, fecha_hora, personas, estado, notas } = data;
        const result = await pool.query(
            'UPDATE reservacion SET cliente_id=COALESCE($1, cliente_id), mesa_id=COALESCE($2, mesa_id), fecha_hora=COALESCE($3, fecha_hora), personas=COALESCE($4, personas), estado=COALESCE($5, estado), notas=COALESCE($6, notas) WHERE reservacion_id=$7 RETURNING *',
            [cliente_id, mesa_id, fecha_hora, personas, estado, notas, id]
        );
        return result.rows[0];
    }
    static async delete(id) {
        const result = await pool.query("UPDATE reservacion SET estado='CANCELADA' WHERE reservacion_id=$1 RETURNING *", [id]);
        return result.rows[0];
    }
}

export class OrdenModel {
    static async create(data) {
        const { mesa_id, mesero_id, cliente_id, reservacion_id, observaciones, detalles } = data;
        
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            const resultOrd = await client.query(
                'INSERT INTO orden (mesa_id, mesero_id, cliente_id, reservacion_id, observaciones) VALUES ($1, $2, $3, $4, $5) RETURNING *',
                [mesa_id, mesero_id, cliente_id, reservacion_id, observaciones]
            );
            const orden = resultOrd.rows[0];

            for (let det of detalles) {
                await client.query(
                    'INSERT INTO orden_detalle (orden_id, platillo_id, cantidad, precio_unit, notas) VALUES ($1, $2, $3, $4, $5)',
                    [orden.orden_id, det.platillo_id, det.cantidad, det.precio_unit, det.notas]
                );
            }
            
            // Actualizar mesa a Ocupada
            await client.query("UPDATE mesa SET estado='OCUPADA' WHERE mesa_id=$1", [mesa_id]);
            await client.query('COMMIT');
            return orden;
        } catch (e) {
            await client.query('ROLLBACK');
            throw e;
        } finally {
            client.release();
        }
    }

    static async getOrdenes() {
        const result = await pool.query('SELECT * FROM orden');
        return result.rows;
    }

    static async findById(id) {
        const result = await pool.query('SELECT * FROM orden WHERE orden_id = $1', [id]);
        return result.rows[0];
    }
    static async update(id, data) {
        const { estado, observaciones } = data;
        const result = await pool.query(
            'UPDATE orden SET estado=COALESCE($1, estado), observaciones=COALESCE($2, observaciones) WHERE orden_id=$3 RETURNING *',
            [estado, observaciones, id]
        );
        return result.rows[0];
    }
    static async delete(id) {
        const result = await pool.query("UPDATE orden SET estado='CANCELADA' WHERE orden_id=$1 RETURNING *", [id]);
        return result.rows[0];
    }
}
