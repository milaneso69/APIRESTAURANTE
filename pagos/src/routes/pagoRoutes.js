import express from 'express';
import pagoController from '../controllers/pagoController.js';
import { validateToken, checkRole } from '../middlewares/authMiddleware.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Pagos
 *   description: Gestión de pagos
 */

/**
 * @swagger
 * /api/pagos/pago:
 *   post:
 *     summary: Crea un nuevo pago
 *     tags: [Pagos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               orden_id:
 *                 type: integer
 *               metodo:
 *                 type: string
 *               monto:
 *                 type: number
 *               referencia:
 *                 type: string
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Pago registrado
 *   get:
 *     summary: Obtiene todos los pagos
 *     tags: [Pagos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de pagos
 */
router.post('/pago', validateToken, checkRole([1, 5]), pagoController.createPago);
router.get('/pago', validateToken, checkRole([1, 2, 3, 5]), pagoController.getPagos);

/**
 * @swagger
 * /api/pagos/pago/{id}:
 *   get:
 *     summary: Obtiene un pago por ID
 *     tags: [Pagos]
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
 *         description: Datos del pago
 *   put:
 *     summary: Actualiza un pago
 *     tags: [Pagos]
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
 *               metodo:
 *                 type: string
 *               monto:
 *                 type: number
 *               referencia:
 *                 type: string
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Pago actualizado
 *   delete:
 *     summary: Elimina un pago
 *     tags: [Pagos]
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
 *         description: Pago eliminado
 */
router.get('/pago/:id', validateToken, checkRole([1, 2, 3, 5]), pagoController.getPagoById);
router.put('/pago/:id', validateToken, checkRole([1]), pagoController.updatePago);
router.delete('/pago/:id', validateToken, checkRole([1]), pagoController.deletePago);

router.get("/health", (req, res) => {
    res.status(200).json({ status: "OK", service: "pagos-service" });
});

export default router;
