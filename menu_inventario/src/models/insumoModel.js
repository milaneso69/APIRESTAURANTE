import { pool } from "../config/db.js";

export class Promotion {
    // Crear una nueva promoción con precio total del combo
    static async create(promotionData) {
        const { name_promotion, description_promotion, total_combo_price, product_ids } = promotionData;

        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // Verificar que todos los productos existen
            for (const productId of product_ids) {
                const productCheck = await client.query(
                    'SELECT id, price_product FROM product WHERE id = $1 AND deleted_at IS NULL',
                    [productId]
                );

                if (productCheck.rows.length === 0) {
                    throw new Error(`Producto con ID ${productId} no encontrado`);
                }
            }

            // Calcular precio original total para validación
            const originalPriceQuery = `
                SELECT SUM(price_product) as total_original_price
                FROM product 
                WHERE id = ANY($1) AND deleted_at IS NULL
            `;
            const originalPriceResult = await client.query(originalPriceQuery, [product_ids]);
            const totalOriginalPrice = parseFloat(originalPriceResult.rows[0].total_original_price);

            // Validar que el precio del combo sea menor al precio original total
            if (total_combo_price >= totalOriginalPrice) {
                throw new Error(`El precio del combo ($${total_combo_price}) debe ser menor al precio original total ($${totalOriginalPrice})`);
            }

            // Crear la promoción
            const promotionQuery = `
                INSERT INTO promotions (name_promotion, description_promotion, total_combo_price)
                VALUES ($1, $2, $3)
                RETURNING *
            `;
            const promotionResult = await client.query(promotionQuery, [
                name_promotion, description_promotion, total_combo_price
            ]);

            const promotion = promotionResult.rows[0];

            // Asociar productos al combo
            for (const productId of product_ids) {
                await client.query(
                    'INSERT INTO promotion_products (promotion_id, product_id) VALUES ($1, $2)',
                    [promotion.id, productId]
                );
            }

            await client.query('COMMIT');
            return promotion;
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    // Obtener todas las promociones con información del combo
    static async findAll() {
        try {
            const query = `
                SELECT p.*, 
                       COUNT(pp.product_id) as product_count,
                       SUM(pr.price_product) as total_original_price,
                       (SUM(pr.price_product) - p.total_combo_price) as total_savings,
                       COALESCE(
                           json_agg(
                               json_build_object(
                                   'product_id', pr.id,
                                   'name_product', pr.name_product,
                                   'original_price', pr.price_product,
                                   'category_id', pr.category_id
                               )
                           ) FILTER (WHERE pr.id IS NOT NULL), 
                           '[]'
                       ) as products
                FROM promotions p
                LEFT JOIN promotion_products pp ON p.id = pp.promotion_id
                LEFT JOIN product pr ON pp.product_id = pr.id AND pr.deleted_at IS NULL
                WHERE p.deleted_at IS NULL
                GROUP BY p.id
                ORDER BY p.created_at DESC
            `;
            const result = await pool.query(query);
            return result.rows;
        } catch (error) {
            throw error;
        }
    }

    // Obtener promoción por ID
    static async findById(id) {
        try {
            const query = `
                SELECT p.*, 
                       COUNT(pp.product_id) as product_count,
                       SUM(pr.price_product) as total_original_price,
                       (SUM(pr.price_product) - p.total_combo_price) as total_savings,
                       COALESCE(
                           json_agg(
                               json_build_object(
                                   'product_id', pr.id,
                                   'name_product', pr.name_product,
                                   'original_price', pr.price_product,
                                   'category_id', pr.category_id
                               )
                           ) FILTER (WHERE pr.id IS NOT NULL), 
                           '[]'
                       ) as products
                FROM promotions p
                LEFT JOIN promotion_products pp ON p.id = pp.promotion_id
                LEFT JOIN product pr ON pp.product_id = pr.id AND pr.deleted_at IS NULL
                WHERE p.id = $1 AND p.deleted_at IS NULL
                GROUP BY p.id
            `;
            const result = await pool.query(query, [id]);
            return result.rows[0] || null;
        } catch (error) {
            throw error;
        }
    }

    // Actualizar promoción
    static async update(id, updateData) {
        const { name_promotion, description_promotion, is_active, total_combo_price, product_ids, image_promotion } = updateData;

        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // Actualizar la promoción
            const updateQuery = `
                UPDATE promotions 
                SET name_promotion = COALESCE($1, name_promotion),
                    description_promotion = COALESCE($2, description_promotion),
                    is_active = COALESCE($3, is_active),
                    total_combo_price = COALESCE($4, total_combo_price),
                    image_promotion = COALESCE($5, image_promotion),
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = $6 AND deleted_at IS NULL
                RETURNING *
            `;
            const result = await client.query(updateQuery, [
                name_promotion, description_promotion, is_active, total_combo_price, image_promotion, id
            ]);

            if (result.rows.length === 0) {
                throw new Error('Promoción no encontrada');
            }

            // Actualizar productos del combo si se proporcionaron
            if (product_ids !== undefined) {
                // Eliminar asociaciones existentes
                await client.query('DELETE FROM promotion_products WHERE promotion_id = $1', [id]);

                // Agregar nuevas asociaciones
                if (product_ids && product_ids.length > 0) {
                    for (const productId of product_ids) {
                        // Verificar que el producto existe
                        const productCheck = await client.query(
                            'SELECT id FROM product WHERE id = $1 AND deleted_at IS NULL',
                            [productId]
                        );

                        if (productCheck.rows.length === 0) {
                            throw new Error(`Producto con ID ${productId} no encontrado`);
                        }

                        await client.query(
                            'INSERT INTO promotion_products (promotion_id, product_id) VALUES ($1, $2)',
                            [id, productId]
                        );
                    }
                }
            }

            await client.query('COMMIT');
            return result.rows[0];
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    // Eliminar promoción (soft delete)
    static async delete(id) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // Primero eliminar las relaciones en promotion_products
            await client.query('DELETE FROM promotion_products WHERE promotion_id = $1', [id]);

            // Luego eliminar la promoción
            const query = `
                DELETE FROM promotions 
                WHERE id = $1
                RETURNING *
            `;
            const result = await client.query(query, [id]);

            await client.query('COMMIT');
            return result.rows[0] || null;
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    // Obtener promociones activas
    static async findActive() {
        try {
            const query = `
                SELECT p.*, 
                       COUNT(pp.product_id) as product_count,
                       SUM(pr.price_product) as total_original_price,
                       (SUM(pr.price_product) - p.total_combo_price) as total_savings,
                       COALESCE(
                           json_agg(
                               json_build_object(
                                   'product_id', pr.id,
                                   'name_product', pr.name_product,
                                   'original_price', pr.price_product,
                                   'category_id', pr.category_id
                               )
                           ) FILTER (WHERE pr.id IS NOT NULL), 
                           '[]'
                       ) as products
                FROM promotions p
                LEFT JOIN promotion_products pp ON p.id = pp.promotion_id
                LEFT JOIN product pr ON pp.product_id = pr.id AND pr.deleted_at IS NULL
                WHERE p.deleted_at IS NULL AND p.is_active = true
                GROUP BY p.id
                ORDER BY p.created_at DESC
            `;
            const result = await pool.query(query);
            return result.rows;
        } catch (error) {
            throw error;
        }
    }
}