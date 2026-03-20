import { pool } from '../config/db.js';
import bcrypt from 'bcryptjs';
import EmailService from '../utils/emailService.js';

export default class authModel {
    static async getAuthById(id) {
        const query = 'SELECT id, email, rol_id FROM auth_users WHERE id = $1 AND deleted_at IS NULL';
        const result = await pool.query(query, [id]);
        return result.rows[0];
    }

    static async getAllAuth() {
        const query = 'SELECT id, email, rol_id FROM auth_users WHERE deleted_at IS NULL';
        const result = await pool.query(query);
        return result.rows;
    }

    static async updateAuth(id, updateData) {
        const { email, password, rol_id } = updateData;
        const updates = [];
        const values = [];
        let paramIndex = 1;

        if (email !== undefined) {
            updates.push(`email = $${paramIndex}`);
            values.push(email);
            paramIndex++;
        }
        if (password !== undefined) {
            const hashedPassword = await bcrypt.hash(password, 10);
            updates.push(`password = $${paramIndex}`);
            values.push(hashedPassword);
            paramIndex++;
        }
        if (rol_id !== undefined) {
            updates.push(`rol_id = $${paramIndex}`);
            values.push(rol_id);
            paramIndex++;
        }

        if (updates.length === 0) throw new Error('No valid fields');

        updates.push(`updated_at = CURRENT_TIMESTAMP`);

        const query = `UPDATE auth_users SET ${updates.join(', ')} WHERE id = $${paramIndex} AND deleted_at IS NULL RETURNING id, email, rol_id`;
        values.push(id);
        const result = await pool.query(query, values);
        return result.rows[0];
    }

    static async getDataLogin({ email, password }) {
        try {
            console.log('Intentando login con:', { email });
            const query = 'SELECT * FROM auth_users WHERE email = $1 AND deleted_at IS NULL';
            const params = [email || ''];

            const result = await pool.query(query, params);
            console.log('Resultado de la consulta:', result.rows);

            const user = result.rows[0];

            if (user) {
                let isMatch;
                if (user.password.startsWith('$2') || user.password.startsWith('$2a$') || user.password.startsWith('$2b$')) {
                    isMatch = await bcrypt.compare(password, user.password);
                } else {
                    isMatch = password === user.password;
                    if (isMatch) {
                        const hashedPassword = await bcrypt.hash(password, 10);
                        await pool.query(
                            'UPDATE auth_users SET password = $1 WHERE id = $2',
                            [hashedPassword, user.id]
                        );
                    }
                }

                if (isMatch) {
                    const { password: _, ...userWithoutPassword } = user;
                    return userWithoutPassword;
                }
            }
            return null;
        } catch (error) {
            console.error('Error en la autenticación:', error);
            throw new Error('Error en la autenticación');
        }
    }

    static async register(password, email, rol_id = 7) {
        try {
            const checkQuery = 'SELECT id, email FROM auth_users WHERE email = $1 AND deleted_at IS NULL';
            const checkResult = await pool.query(checkQuery, [email]);

            if (checkResult.rows.length > 0) {
                console.log(`Conflicto detectado: email ya existe para usuario ID ${checkResult.rows[0].id}`);
                throw new Error(`El email ya existe`);
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            const query = `
                INSERT INTO auth_users (password, email, rol_id)
                VALUES ($1, $2, $3)
                RETURNING id, email, rol_id
            `;

            const result = await pool.query(query, [hashedPassword, email, rol_id]);
            console.log(`Usuario de autenticación creado exitosamente: ID ${result.rows[0].id}`);
            return result.rows[0];
        } catch (error) {
            console.error('Error en el registro:', error);
            throw error;
        }
    }

    static async deleteUser(id) {
        try {
            const checkQuery = 'SELECT id FROM auth_users WHERE id = $1 AND deleted_at IS NULL';
            const checkResult = await pool.query(checkQuery, [id]);
            
            if (checkResult.rows.length === 0) {
                return false; 
            }

            // Soft delete
            const deleteQuery = 'UPDATE auth_users SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING id';
            const result = await pool.query(deleteQuery, [id]);
            
            console.log(`Usuario de autenticación ${id} eliminado correctamente (soft-delete)`);
            return result.rows.length > 0;
        } catch (error) {
            console.error('Error eliminando usuario de autenticación:', error);
            throw error;
        }
    }

    static async initiatePasswordReset(email) {
        // Implementation omitida o ajustada según sea necesario
        throw new Error('Funcionalidad no implementada en este refactor rápido, usa reset/emailService original');
    }

    static async resetPassword(email, code, newPassword) {
        // Implementation omitida o ajustada según sea necesario
        throw new Error('Funcionalidad no implementada en este refactor rápido');
    }
}