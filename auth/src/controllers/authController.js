import authModel from '../models/authModel.js';
import { generateAccessToken } from '../middlewares/authMiddleware.js';
import { validateJwtToken } from '../middlewares/authMiddleware.js';

export default class authController {
    static async getAuthById(req, res) {
        const { id } = req.params;
        try {
           const user = await authModel.getAuthById(id);
           if (!user) {
            return res.status(404).json({ message: 'User not found' });
           } 
           res.json(user);
        }catch (error) {
            console.error('Error fetching user:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    static async getAllAuth(req, res) {
        try {
            const users = await authModel.getAllAuth();
            res.json(users);
        } catch (error) {
            console.error('Error fetching users:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    static async updateAuth(req, res) {
        try {
            const { id } = req.params;
            const updatedUser = await authModel.updateAuth(id, req.body);
            if (!updatedUser) return res.status(404).json({ message: 'User not found' });
            res.json({ message: 'User updated', user: updatedUser });
        } catch (error) {
            console.error('Error updating user:', error);
            res.status(500).json({ message: 'Internal server error', details: error.message });
        }
    }

    static async register(req, res) {
        try {
            const { password, email, rol_id } = req.body;

            if (!password || !email) {
               return res
               .status(400)
               .json({
                error: 'Missing required fields',
               }); 
            }
            const user = await authModel.register(password, email, rol_id || 7);
            res.status(201).json({ message: 'User registered successfully', user });
        } catch (error) {
            console.error('Error registering user:', error);
            res.status(500).json({ message: 'Internal server error', details: error.message });
        }
    }

    static async login(req, res) {
       try {
          const { email, password } = req.body; 

          if (!email || !password) {
            return res
            .status(400)
            .json({
                error: 'Missing required fields',
            });
          }

          let loginData = { email, password };

          const user = await authModel.getDataLogin(loginData);
          console.log(user);
          if (!user) {
              return res
              .status(401).json({
                error: 'Invalid login credentials',
             }); 
          }

          const accessToken = generateAccessToken(user);
          res.status(200).header('Authorization', accessToken).json({
            user: user.id,
            rol_id: user.rol_id,
            message: 'Login successful',
            token: accessToken,
          });
       } catch (error) {
          console.error('Error logging in:', error);
          return res.status(500).json({
            error: 'Login failed',
            details: error.message,
          });
       }
    }

    static async verifyToken(req, res) {
        const authHeader = req.headers['authorization'];
        if (!authHeader) {
            return res.status(401).json({ message: 'No token provided' });
        }
        const result = validateJwtToken(authHeader, res);
        if (result.status !== 200) {
            return res.status(result.status).json({ 
                message: result.message, user: null,
             });
        }

        return res.status(result.status).json({
           message: result.message,
           user: result.user, 
        });
    }

    static async initiatePasswordReset(req, res) {
        // ...
        res.status(501).json({ error: 'Not implemented' });
    }

    static async resetPassword(req, res) {
        // ...
        res.status(501).json({ error: 'Not implemented' });
    }

    static async deleteUser(req, res) {
        try {
            const { id } = req.params;
            const deleted = await authModel.deleteUser(id);
            if (!deleted) {
                return res.status(404).json({ message: 'Usuario no encontrado' });
            }
            res.status(200).json({ message: 'Usuario eliminado correctamente' });
        } catch (error) {
            console.error('Error eliminando usuario:', error);
            res.status(500).json({ message: 'Error interno del servidor' });
        }
    }

    static async registerByAdmin(req, res) {
        try {
            const { password, email, rol_id } = req.body;
            // req.user has the jwt payload which we should check
            if (!password || !email || !rol_id) {
                return res.status(400).json({ error: 'Faltan campos requeridos' }); 
            }
    
            // Verificar rol ADMIN (rol_id = 1)
            if (req.user.rol_id !== 1) {
                return res.status(403).json({ error: 'Solo ADMINISTRADORES pueden registrar roles específicos' });
            }
    
            const user = await authModel.register(password, email, rol_id);
            res.status(201).json({ message: 'Usuario registrado exitosamente', user });
        } catch (error) {
            console.error('Error registrando usuario:', error);
            res.status(500).json({ message: 'Error interno del servidor', details: error.message });
        }
    }
}