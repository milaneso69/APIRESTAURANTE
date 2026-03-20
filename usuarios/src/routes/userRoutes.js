import express from 'express';
import userController from '../controllers/userController.js';

import { validateToken, checkRole } from '../middlewares/authMiddleware.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Empleados
 *   description: Gestión de empleados
 */

/**
 * @swagger
 * /api/users/empleado:
 *   post:
 *     summary: Crea un nuevo empleado
 *     tags: [Empleados]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *               apellido_p:
 *                 type: string
 *               apellido_m:
 *                 type: string
 *               telefono:
 *                 type: string
 *               auth_users:
 *                 type: object
 *                 properties:
 *                   email:
 *                     type: string
 *                   password:
 *                     type: string
 *                   rol_id:
 *                     type: integer
 *     responses:
 *       201:
 *         description: Empleado creado exitosamente
 *   get:
 *     summary: Obtiene todos los empleados
 *     tags: [Empleados]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de empleados
 */
router.post('/empleado', validateToken, checkRole([1]), userController.createEmpleado);
router.get('/empleado', validateToken, checkRole([1, 2]), userController.getEmpleados);

/**
 * @swagger
 * /api/users/empleado/{id}:
 *   get:
 *     summary: Obtiene un empleado por ID
 *     tags: [Empleados]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Datos del empleado
 *   put:
 *     summary: Actualiza un empleado
 *     tags: [Empleados]
 *     security:
 *       - bearerAuth: []
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
 *               apellido_p:
 *                 type: string
 *               apellido_m:
 *                 type: string
 *               telefono:
 *                 type: string
 *               activo:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Empleado actualizado
 *   delete:
 *     summary: Da de baja (soft delete) a un empleado
 *     tags: [Empleados]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Empleado dado de baja
 */
router.get('/empleado/:id', validateToken, checkRole([1, 2]), userController.getEmpleadoById);
router.put('/empleado/:id', validateToken, checkRole([1, 2]), userController.updateEmpleado);
router.delete('/empleado/:id', validateToken, checkRole([1, 2]), userController.deleteEmpleado);

/**
 * @swagger
 * tags:
 *   name: Clientes
 *   description: Gestión de clientes
 */

/**
 * @swagger
 * /api/users/cliente:
 *   post:
 *     summary: Crea un nuevo cliente (registro público)
 *     tags: [Clientes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *               telefono:
 *                 type: string
 *               auth_users:
 *                 type: object
 *                 properties:
 *                   email:
 *                     type: string
 *                   password:
 *                     type: string
 *     responses:
 *       201:
 *         description: Cliente creado exitosamente
 *   get:
 *     summary: Obtiene todos los clientes
 *     tags: [Clientes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de clientes
 */
router.post('/cliente', userController.createCliente); // Registro público
router.get('/cliente', validateToken, checkRole([1, 2, 3, 6, 7]), userController.getClientes);

/**
 * @swagger
 * /api/users/cliente/{id}:
 *   get:
 *     summary: Obtiene un cliente por ID
 *     tags: [Clientes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Datos del cliente
 *   put:
 *     summary: Actualiza un cliente
 *     tags: [Clientes]
 *     security:
 *       - bearerAuth: []
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
 *               telefono:
 *                 type: string
 *     responses:
 *       200:
 *         description: Cliente actualizado
 *   delete:
 *     summary: Elimina un cliente
 *     tags: [Clientes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Cliente eliminado
 */
router.get('/cliente/:id', validateToken, checkRole([1, 2, 3, 6, 7]), userController.getClienteById);
router.put('/cliente/:id', validateToken, checkRole([1]), userController.updateCliente);
router.delete('/cliente/:id', validateToken, checkRole([1]), userController.deleteCliente);

router.get("/health", (req, res) => {
    res.status(200).json({ status: "OK", service: "usuarios-service" });
});

export default router;