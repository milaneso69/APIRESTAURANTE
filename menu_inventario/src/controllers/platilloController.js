import { PlatilloModel, CategoriaMenuModel } from '../models/platilloModel.js';

export default class platilloController {
  static async createPlatillo(req, res) {
    try {
      const platillo = await PlatilloModel.create(req.body);
      res.status(201).json({ message: 'Platillo creado', platillo });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getPlatillos(req, res) {
    try {
      const platillos = await PlatilloModel.findAll();
      res.json(platillos);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getCategorias(req, res) {
    try {
      const categorias = await CategoriaMenuModel.findAll();
      res.json(categorias);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async createCategoria(req, res) {
    try {
      const categoria = await CategoriaMenuModel.create(req.body.nombre);
      res.status(201).json({ message: 'Categoría creada', categoria });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getPlatilloById(req, res) {
    try {
      const platillo = await PlatilloModel.findById(req.params.id);
      if(!platillo) return res.status(404).json({ message: 'Platillo no encontrado' });
      res.json(platillo);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async updatePlatillo(req, res) {
    try {
      const platillo = await PlatilloModel.update(req.params.id, req.body);
      res.json({ message: 'Platillo actualizado', platillo });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async deletePlatillo(req, res) {
    try {
      await PlatilloModel.delete(req.params.id);
      res.json({ message: 'Platillo eliminado' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getCategoriaById(req, res) {
    try {
      const categoria = await CategoriaMenuModel.findById(req.params.id);
      if(!categoria) return res.status(404).json({ message: 'Categoría no encontrada' });
      res.json(categoria);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async updateCategoria(req, res) {
    try {
      const categoria = await CategoriaMenuModel.update(req.params.id, req.body.nombre);
      res.json({ message: 'Categoría actualizada', categoria });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async deleteCategoria(req, res) {
    try {
      await CategoriaMenuModel.delete(req.params.id);
      res.json({ message: 'Categoría eliminada' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}