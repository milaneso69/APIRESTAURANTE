import express from 'express';
import comandasController from '../controllers/comandasController.js';
import { validateToken, checkRole } from '../middlewares/authMiddleware.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Mesas
 *     description: Gestión de mesas
 *   - name: Reservaciones
 *     description: Gestión de reservaciones
 *   - name: Ordenes
 *     description: Gestión de órdenes
 */

/**
 * @swagger
 * /api/comandas/mesas:
 *   get:
 *     summary: Obtiene todas las mesas
 *     tags: [Mesas]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de mesas
 */
router.get('/mesas', validateToken, checkRole([1, 2, 3, 4, 6, 7]), comandasController.getMesas);

/**
 * @swagger
 * /api/comandas/mesas/{id}:
 *   get:
 *     summary: Obtiene una mesa por ID
 *     tags: [Mesas]
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
 *         description: Datos de la mesa
 *   put:
 *     summary: Actualiza el estado de una mesa
 *     tags: [Mesas]
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
 *               estado:
 *                 type: string
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estado de la mesa actualizado
 */
router.get('/mesas/:id', validateToken, checkRole([1, 2, 3, 4, 6, 7]), comandasController.getMesaById);
router.put('/mesas/:id', validateToken, checkRole([1, 3, 6]), comandasController.updateMesaEstado);

/**
 * @swagger
 * /api/comandas/reservaciones:
 *   post:
 *     summary: Crea una nueva reservación
 *     tags: [Reservaciones]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               cliente_id:
 *                 type: integer
 *               mesa_id:
 *                 type: integer
 *               fecha_hora:
 *                 type: string
 *               personas:
 *                 type: integer
 *               notas:
 *                 type: string
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Reservación creada
 *   get:
 *     summary: Obtiene todas las reservaciones
 *     tags: [Reservaciones]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de reservaciones
 */
router.post('/reservaciones', validateToken, checkRole([1, 6, 7]), comandasController.createReservacion);
router.get('/reservaciones', validateToken, checkRole([1, 6]), comandasController.getReservaciones);

/**
 * @swagger
 * /api/comandas/reservaciones/{id}:
 *   get:
 *     summary: Obtiene una reservación por ID
 *     tags: [Reservaciones]
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
 *         description: Datos de la reservación
 *   put:
 *     summary: Actualiza una reservación
 *     tags: [Reservaciones]
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
 *               cliente_id:
 *                 type: integer
 *               mesa_id:
 *                 type: integer
 *               fecha_hora:
 *                 type: string
 *               personas:
 *                 type: integer
 *               estado:
 *                 type: string
 *               notas:
 *                 type: string
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Reservación actualizada
 *   delete:
 *     summary: Cancela una reservación
 *     tags: [Reservaciones]
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
 *         description: Reservación cancelada
 */
router.get('/reservaciones/:id', validateToken, checkRole([1, 6]), comandasController.getReservacionById);
router.put('/reservaciones/:id', validateToken, checkRole([1, 6]), comandasController.updateReservacion);
router.delete('/reservaciones/:id', validateToken, checkRole([1, 2]), comandasController.deleteReservacion);

/**
 * @swagger
 * /api/comandas/ordenes:
 *   post:
 *     summary: Crea una nueva orden
 *     tags: [Ordenes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               mesa_id:
 *                 type: integer
 *               mesero_id:
 *                 type: integer
 *               cliente_id:
 *                 type: integer
 *               reservacion_id:
 *                 type: integer
 *               observaciones:
 *                 type: string
 *               detalles:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     platillo_id:
 *                       type: integer
 *                     cantidad:
 *                       type: integer
 *                     precio_unit:
 *                       type: number
 *                     notas:
 *                       type: string
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Orden creada
 *   get:
 *     summary: Obtiene todas las órdenes
 *     tags: [Ordenes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de órdenes
 */
router.post('/ordenes', validateToken, checkRole([1, 3]), comandasController.createOrden);
router.get('/ordenes', validateToken, checkRole([1, 3, 4, 8]), comandasController.getOrdenes);

/**
 * @swagger
 * /api/comandas/ordenes/{id}:
 *   get:
 *     summary: Obtiene una orden por ID
 *     tags: [Ordenes]
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
 *         description: Datos de la orden
 *   put:
 *     summary: Actualiza una orden
 *     tags: [Ordenes]
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
 *               estado:
 *                 type: string
 *               observaciones:
 *                 type: string
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Orden actualizada
 *   delete:
 *     summary: Cancela una orden
 *     tags: [Ordenes]
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
 *         description: Orden cancelada
 */
router.get('/ordenes/:id', validateToken, checkRole([1, 3, 4, 8]), comandasController.getOrdenById);
router.put('/ordenes/:id', validateToken, checkRole([1, 3]), comandasController.updateOrden);
router.delete('/ordenes/:id', validateToken, checkRole([1, 2]), comandasController.deleteOrden);

router.get("/health", (req, res) => {
    res.status(200).json({ status: "OK", service: "comandas-service" });
});

export default router;