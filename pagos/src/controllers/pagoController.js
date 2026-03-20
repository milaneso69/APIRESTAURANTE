import { PagoModel } from '../models/pagoModel.js';
import axios from 'axios';

export default class pagoController {
  static async createPago(req, res) {
    try {
      const pago = await PagoModel.create(req.body);
      // Optional: Informar a orden_id en comandas-service que la orden fue pagada/cerrar
      res.status(201).json({ message: 'Pago registrado', pago });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getPagos(req, res) {
    try {
      const pagos = await PagoModel.findAll();
      res.json(pagos);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getPagoById(req, res) {
    try {
      const pago = await PagoModel.findById(req.params.id);
      if(!pago) return res.status(404).json({ message: 'Pago no encontrado' });
      res.json(pago);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async updatePago(req, res) {
    try {
      const pago = await PagoModel.update(req.params.id, req.body);
      res.json({ message: 'Pago actualizado', pago });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async deletePago(req, res) {
    try {
      await PagoModel.delete(req.params.id);
      res.json({ message: 'Pago eliminado' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}
