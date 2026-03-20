import express from 'express';
import platilloController from '../controllers/platilloController.js';
import { validateToken, checkRole } from '../middlewares/authMiddleware.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Platillos
 *     description: Gestión de platillos del menú
 *   - name: Categorias
 *     description: Gestión de categorías del menú
 */

/**
 * @swagger
 * /api/menu/platillo:
 *   post:
 *     summary: Crea un nuevo platillo
 *     tags: [Platillos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               categoria_id:
 *                 type: integer
 *               nombre:
 *                 type: string
 *               descripcion:
 *                 type: string
 *               precio:
 *                 type: number
 *               disponible:
 *                 type: boolean
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Platillo creado
 *   get:
 *     summary: Obtiene todos los platillos
 *     tags: [Platillos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de platillos
 */
router.post('/platillo', validateToken, checkRole([1]), platilloController.createPlatillo);
router.get('/platillo', validateToken, checkRole([1, 2, 3, 4, 7]), platilloController.getPlatillos);

/**
 * @swagger
 * /api/menu/platillo/{id}:
 *   get:
 *     summary: Obtiene un platillo por ID
 *     tags: [Platillos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Datos del platillo
 *   put:
 *     summary: Actualiza un platillo
 *     tags: [Platillos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               categoria_id:
 *                 type: integer
 *               nombre:
 *                 type: string
 *               descripcion:
 *                 type: string
 *               precio:
 *                 type: number
 *               disponible:
 *                 type: boolean
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Platillo actualizado
 *   delete:
 *     summary: Elimina un platillo (soft delete)
 *     tags: [Platillos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Platillo eliminado
 */
router.get('/platillo/:id', validateToken, checkRole([1, 2, 3, 4, 7]), platilloController.getPlatilloById);
router.put('/platillo/:id', validateToken, checkRole([1, 2]), platilloController.updatePlatillo);
router.delete('/platillo/:id', validateToken, checkRole([1]), platilloController.deletePlatillo);

/**
 * @swagger
 * /api/menu/categoria:
 *   post:
 *     summary: Crea una nueva categoría
 *     tags: [Categorias]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Categoría creada
 *   get:
 *     summary: Obtiene todas las categorías
 *     tags: [Categorias]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de categorías
 */
router.post('/categoria', validateToken, checkRole([1]), platilloController.createCategoria);
router.get('/categoria', validateToken, checkRole([1, 2, 3, 7]), platilloController.getCategorias);

/**
 * @swagger
 * /api/menu/categoria/{id}:
 *   get:
 *     summary: Obtiene una categoría por ID
 *     tags: [Categorias]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Datos de la categoría
 *   put:
 *     summary: Actualiza una categoría
 *     tags: [Categorias]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Categoría actualizada
 *   delete:
 *     summary: Elimina una categoría
 *     tags: [Categorias]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Categoría eliminada
 */
router.get('/categoria/:id', validateToken, checkRole([1, 2, 3, 7]), platilloController.getCategoriaById);
router.put('/categoria/:id', validateToken, checkRole([1]), platilloController.updateCategoria);
router.delete('/categoria/:id', validateToken, checkRole([1]), platilloController.deleteCategoria);

router.get("/health", (req, res) => {
    res.status(200).json({ status: "OK", service: "menu-inventario-service" });
});

export default router;