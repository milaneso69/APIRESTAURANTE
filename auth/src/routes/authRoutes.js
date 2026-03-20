import express from "express";
import authController from "../controllers/authController.js";
import { validateRegistration, validateLogin } from "../middlewares/authValidation.js";
import { validateJwtToken, checkRole } from "../middlewares/authMiddleware.js";

const router = express.Router();

const validateTokenMiddleware = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const result = validateJwtToken(authHeader);
    
    if (result.status !== 200) {
        return res.status(result.status).json({ 
            message: result.message,
            user: null
        });
    }
    
    req.user = result.user;
    next();
};

/**
 * @swagger
 * tags:
 *   name: Autenticación
 *   description: Endpoints para gestión de credenciales y tokens
 */

/**
 * @swagger
 * /api/auths/get/auth:
 *   get:
 *     summary: Obtiene todos los usuarios de autenticación
 *     tags: [Autenticación]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de usuarios (sin contraseñas)
 */
router.get("/get/auth", validateTokenMiddleware, authController.getAllAuth);

/**
 * @swagger
 * /api/auths/get/auth/by/{id}:
 *   get:
 *     summary: Obtiene usuario de autenticación por ID
 *     tags: [Autenticación]
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
 *         description: Datos del usuario (email, rol)
 */
router.get("/get/auth/by/:id", validateTokenMiddleware, authController.getAuthById);

/**
 * @swagger
 * /api/auths/register/auth/user:
 *   post:
 *     summary: Ruta interna para registrar usuarios (clientes)
 *     tags: [Autenticación]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               rol_id:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Usuario registrado exitosamente
 */
router.post("/register/auth/user", authController.register);

/**
 * @swagger
 * /api/auths/login/user:
 *   post:
 *     summary: Inicia sesión
 *     tags: [Autenticación]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login exitoso, retorna el token JWT
 */
router.post("/login/user", authController.login);

/**
 * @swagger
 * /api/auths/register/admin:
 *   post:
 *     summary: Registro de usuarios por parte de un admin
 *     tags: [Autenticación]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               rol_id:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Usuario administrador/empleado registrado
 */
router.post("/register/admin", validateTokenMiddleware, checkRole([1]), authController.registerByAdmin);

/**
 * @swagger
 * /api/auths/verify-token:
 *   post:
 *     summary: Verifica la validez del token JWT
 *     tags: [Autenticación]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Token verificado
 */
router.post("/verify-token", authController.verifyToken);

/**
 * @swagger
 * /api/auths/update/user/{id}:
 *   put:
 *     summary: Actualiza cuenta de autenticación
 *     tags: [Autenticación]
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
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               rol_id:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Usuario actualizado
 */
router.put("/update/user/:id", validateTokenMiddleware, checkRole([1]), authController.updateAuth);

/**
 * @swagger
 * /api/auths/delete/user/{id}:
 *   delete:
 *     summary: Elimina usuario lógicamente
 *     tags: [Autenticación]
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
 *         description: Usuario eliminado correctamente
 */
router.delete("/delete/user/:id", validateTokenMiddleware, checkRole([1,2]), authController.deleteUser);

router.post('/initiate-password-reset', authController.initiatePasswordReset);
router.post('/reset-password', authController.resetPassword);

// Ruta de estado de salud
router.get("/health", (req, res) => {
    res.status(200).json({
        status: "OK",
        service: "auth-service",
        timestamp: new Date().toISOString(),
    });
});

export default router;
