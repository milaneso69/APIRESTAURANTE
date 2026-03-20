import { EmpleadoModel, ClienteModel } from '../models/userModel.js';
import axios from 'axios';

export default class userController {
  static async createEmpleado(req, res) {
    try {
      const { auth_users, ...empleadoData } = req.body;
      let authUserId = empleadoData.auth_user_id;
      
      if (auth_users && auth_users.email && auth_users.password && auth_users.rol_id) {
        const authResponse = await axios.post(
          `${process.env.AUTH_SERVICE_URL}/api/auth/register/admin`,
          auth_users,
          { headers: { 'Authorization': req.headers.authorization, 'Content-Type': 'application/json' } }
        );
        authUserId = authResponse.data.user.id;
      }

      const empleado = await EmpleadoModel.create({ ...empleadoData, auth_user_id: authUserId });
      res.status(201).json({ message: 'Empleado creado', empleado });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message }); 
    }
  }
  
  static async getEmpleados(req, res) {
    try {
      const empleados = await EmpleadoModel.findAll();
      res.json(empleados);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getEmpleadoById(req, res) {
    try {
      const empleado = await EmpleadoModel.findById(req.params.id);
      if(!empleado) return res.status(404).json({ message: 'Empleado no encontrado' });
      res.json(empleado);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async updateEmpleado(req, res) {
    try {
      const empleado = await EmpleadoModel.update(req.params.id, req.body);
      res.json({ message: 'Empleado actualizado', empleado });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async deleteEmpleado(req, res) {
    try {
      await EmpleadoModel.delete(req.params.id);
      res.json({ message: 'Empleado dado de baja' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async createCliente(req, res) {
    try {
      const { auth_users, ...clienteData } = req.body;
      let authUserId = clienteData.auth_user_id;

      if (auth_users && auth_users.email && auth_users.password) {
        auth_users.rol_id = 7; // Cliente
        const authResponse = await axios.post(
          `${process.env.AUTH_SERVICE_URL}/api/auth/register/auth/user`,
          auth_users,
          { headers: { 'Content-Type': 'application/json' } }
        );
        authUserId = authResponse.data.user.id;
      }

      const cliente = await ClienteModel.create({ ...clienteData, auth_user_id: authUserId });
      res.status(201).json({ message: 'Cliente creado', cliente });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  }

  static async getClientes(req, res) {
    try {
      const clientes = await ClienteModel.findAll();
      res.json(clientes);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getClienteById(req, res) {
    try {
      const cliente = await ClienteModel.findById(req.params.id);
      if(!cliente) return res.status(404).json({ message: 'Cliente no encontrado' });
      res.json(cliente);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async updateCliente(req, res) {
    try {
      const cliente = await ClienteModel.update(req.params.id, req.body);
      res.json({ message: 'Cliente actualizado', cliente });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async deleteCliente(req, res) {
    try {
      await ClienteModel.delete(req.params.id);
      res.json({ message: 'Cliente eliminado' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}
