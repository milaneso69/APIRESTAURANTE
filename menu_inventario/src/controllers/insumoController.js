import { Promotion } from "../models/promotionModel.js";
import ImageKit from "imagekit";
import fs from "fs";

// Configure ImageKit
const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
});

class PromotionController {
  // Crear nueva promoción con precio total del combo
  static async createPromotion(req, res) {
    try {
      const { name_promotion, description_promotion, total_combo_price, product_ids } = req.body;

      // Validar campos requeridos
      if (!name_promotion) {
        return res.status(400).json({
          error: 'El nombre de la promoción es requerido'
        });
      }

      if (!total_combo_price || total_combo_price <= 0) {
        return res.status(400).json({
          error: 'El precio total del combo es requerido y debe ser mayor a 0'
        });
      }

      // Validar productos
      if (!product_ids || product_ids.length < 2) {
        return res.status(400).json({
          error: 'Debe seleccionar al menos 2 productos para crear un combo'
        });
      }

      // Validar que no haya productos duplicados
      const uniqueIds = new Set(product_ids);
      if (product_ids.length !== uniqueIds.size) {
        return res.status(400).json({
          error: 'No se pueden incluir productos duplicados en el combo'
        });
      }

      const promotion = await Promotion.create({
        name_promotion,
        description_promotion,
        total_combo_price,
        product_ids
      });

      res.status(201).json({
        message: `Combo creado exitosamente con ${product_ids.length} productos`,
        promotion
      });
    } catch (error) {
      console.error('Error al crear promoción:', error);
      res.status(500).json({ error: error.message || 'Error interno del servidor' });
    }
  }

  // Obtener promoción por ID
  static async getPromotionById(req, res) {
    try {
      const { id } = req.params;
      const promotion = await Promotion.findById(id);

      if (!promotion) {
        return res.status(404).json({ error: 'Promoción no encontrada' });
      }

      res.status(200).json(promotion);
    } catch (error) {
      console.error('Error al obtener promoción:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  // Actualizar promoción
  static async updatePromotion(req, res) {
    try {
      const { id } = req.params;
      const { name_promotion, description_promotion, total_combo_price, product_ids } = req.body;

      // Validar productos si se proporcionan
      if (product_ids && product_ids.length < 2) {
        return res.status(400).json({
          error: 'Debe seleccionar al menos 2 productos para el combo'
        });
      }

      if (total_combo_price && total_combo_price <= 0) {
        return res.status(400).json({
          error: 'El precio total del combo debe ser mayor a 0'
        });
      }

      // Validar que no haya productos duplicados si se proporcionan
      if (product_ids) {
        const uniqueIds = new Set(product_ids);
        if (product_ids.length !== uniqueIds.size) {
          return res.status(400).json({
            error: 'No se pueden incluir productos duplicados en el combo'
          });
        }
      }

      const updateData = {
        name_promotion,
        description_promotion,
        total_combo_price,
        product_ids
      };

      const promotion = await Promotion.update(id, updateData);

      res.status(200).json({
        message: 'Promoción actualizada exitosamente',
        promotion
      });
    } catch (error) {
      console.error('Error al actualizar promoción:', error);
      if (error.message === 'Promoción no encontrada') {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: error.message || 'Error interno del servidor' });
    }
  }

  // Eliminar promoción
  static async deletePromotion(req, res) {
    try {
      const { id } = req.params;
      const promotion = await Promotion.delete(id);

      if (!promotion) {
        return res.status(404).json({ error: 'Promoción no encontrada' });
      }

      res.status(200).json({
        message: 'Promoción eliminada exitosamente',
        promotion
      });
    } catch (error) {
      console.error('Error al eliminar promoción:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  // Obtener promociones activas
  static async getActivePromotions(req, res) {
    try {
      const promotions = await Promotion.findActive();
      res.status(200).json(promotions);
    } catch (error) {
      console.error('Error al obtener promociones activas:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  static async uploadPromotionImage(req, res) {
    try {
      const { id } = req.params;

      // Verificar si la promoción existe
      const existingPromotion = await Promotion.findById(id);
      if (!existingPromotion) {
        return res.status(404).json({ error: 'Promoción no encontrada' });
      }

      // Verificar si se envió una imagen
      if (!req.file) {
        return res.status(400).json({ error: 'No se proporcionó ninguna imagen' });
      }

      try {
        // Convertir imagen a Base64
        const imageBuffer = req.file.buffer || fs.readFileSync(req.file.path);
        const base64Image = `data:${req.file.mimetype};base64,${imageBuffer.toString('base64')}`;

        // Configurar opciones para ImageKit
        const options = {
          fileName: `promotion_${id}_${Date.now()}`,
          folder: '/promotions/'
        };

        // Subir imagen a ImageKit
        const uploadResult = await imagekit.upload({
          file: imageBuffer,
          fileName: options.fileName,
          folder: options.folder
        });

        // Actualizar la promoción con la imagen en Base64
        const updatedPromotion = await Promotion.update(id, {
          image_promotion: base64Image
        });

        // Eliminar archivo temporal si existe
        if (req.file.path && fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }

        res.json({
          message: 'Imagen subida exitosamente',
          promotion: updatedPromotion,
          image_url: uploadResult.url,
          imagekit_file_id: uploadResult.fileId
        });
      } catch (uploadError) {
        console.error('Error al subir imagen:', uploadError);
        return res.status(500).json({ error: 'Error al procesar la imagen' });
      }
    } catch (error) {
      console.error('Error al subir imagen de promoción:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
}
export default PromotionController;
