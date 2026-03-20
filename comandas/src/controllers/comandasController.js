import { MesaModel, ReservacionModel, OrdenModel } from '../models/comandasModel.js';

export default class comandasController {
  
  static async getMesas(req, res) {
    try {
      res.json(await MesaModel.findAll());
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  }

  static async updateMesaEstado(req, res) {
    try {
      res.json(await MesaModel.updateEstado(req.params.id, req.body.estado));
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  }

  static async getMesaById(req, res) {
    try {
      const mesa = await MesaModel.findById(req.params.id);
      if(!mesa) return res.status(404).json({ message: 'Mesa no encontrada' });
      res.json(mesa);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  }

  static async createReservacion(req, res) {
    try {
      res.status(201).json(await ReservacionModel.create(req.body));
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  }

  static async getReservaciones(req, res) {
    try {
      res.json(await ReservacionModel.findAll());
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  }

  static async getReservacionById(req, res) {
    try {
      const reservacion = await ReservacionModel.findById(req.params.id);
      if(!reservacion) return res.status(404).json({ message: 'Reservación no encontrada' });
      res.json(reservacion);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  }

  static async updateReservacion(req, res) {
    try {
      const reservacion = await ReservacionModel.update(req.params.id, req.body);
      res.json({ message: 'Reservación actualizada', reservacion });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  }

  static async deleteReservacion(req, res) {
    try {
      await ReservacionModel.delete(req.params.id);
      res.json({ message: 'Reservación cancelada' });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  }

  static async createOrden(req, res) {
    try {
      res.status(201).json(await OrdenModel.create(req.body));
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  }

  static async getOrdenes(req, res) {
    try {
      res.json(await OrdenModel.getOrdenes());
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  }

  static async getOrdenById(req, res) {
    try {
      const orden = await OrdenModel.findById(req.params.id);
      if(!orden) return res.status(404).json({ message: 'Orden no encontrada' });
      res.json(orden);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  }

  static async updateOrden(req, res) {
    try {
      const orden = await OrdenModel.update(req.params.id, req.body);
      res.json({ message: 'Orden actualizada', orden });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  }

  static async deleteOrden(req, res) {
    try {
      await OrdenModel.delete(req.params.id);
      res.json({ message: 'Orden cancelada' });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  }
}