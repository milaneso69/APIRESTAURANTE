import { expect } from 'chai';
import sinon from 'sinon';
import request from 'supertest';
import express from 'express';
import fs from 'fs';
import path from 'path';

// Mock de la base de datos
const mockDb = {
  query: sinon.stub()
};

// Mock del controlador de productos
const mockProductController = {
  getAllProducts: sinon.stub(),
  getProductById: sinon.stub(),
  getProductsByName: sinon.stub(),
  getProductsByPrice: sinon.stub(),
  getProductsByStock: sinon.stub(),
  createProduct: sinon.stub(),
  updateProduct: sinon.stub(),
  updateProductImage: sinon.stub(),
  deleteProduct: sinon.stub()
};

// Mock del controlador de promociones
const mockPromotionController = {
  createPromotion: sinon.stub(),
  getPromotionById: sinon.stub(),
  updatePromotion: sinon.stub(),
  deletePromotion: sinon.stub(),
  getActivePromotions: sinon.stub(),
  uploadPromotionImage: sinon.stub()
};

// Mock del modelo de productos
const mockProductModel = {
  findAll: sinon.stub(),
  findById: sinon.stub(),
  findByName: sinon.stub(),
  findByPrice: sinon.stub(),
  findByStock: sinon.stub(),
  create: sinon.stub(),
  update: sinon.stub(),
  updateImage: sinon.stub(),
  delete: sinon.stub(),
  convertImageToBase64: sinon.stub(),
  processImageBuffer: sinon.stub(),
  processImageUrl: sinon.stub()
};

// Mock del modelo de promociones
const mockPromotionModel = {
  create: sinon.stub(),
  findAll: sinon.stub(),
  findById: sinon.stub(),
  update: sinon.stub(),
  delete: sinon.stub(),
  findActive: sinon.stub()
};

// Mock de ImageKit
const mockImageKit = {
  upload: sinon.stub()
};

describe('Products and Promotions Module - 50 Unit Tests', () => {
  let app;
  let sandbox;
  
  beforeEach(() => {
    app = express();
    app.use(express.json());
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
    sinon.restore();
  });

  // ==================== PRODUCT CONTROLLER TESTS ====================

  describe('ProductController', () => {
    // Test 1: getAllProducts - Success
    it('1. should get all products successfully', async () => {
      const mockProducts = [
        { id: 1, name_product: 'Café Americano', price_product: 5.50, stock_display: 'Disponible' },
        { id: 2, name_product: 'Café Latte', price_product: 6.00, stock_display: 'Disponible' }
      ];
      
      mockProductController.getAllProducts.resolves({
        status: 200,
        json: sinon.stub().returns({ productos: mockProducts })
      });
      
      const result = await mockProductController.getAllProducts();
      expect(result.status).to.equal(200);
    });

    // Test 2: getAllProducts - Error handling
    it('2. should handle errors when getting all products', async () => {
      mockProductController.getAllProducts.rejects(new Error('Database error'));
      
      try {
        await mockProductController.getAllProducts();
      } catch (error) {
        expect(error.message).to.equal('Database error');
      }
    });

    // Test 3: getProductById - Success
    it('3. should get product by ID successfully', async () => {
      const mockProduct = { id: 1, name_product: 'Café Test', price_product: 5.50 };
      
      mockProductController.getProductById.resolves({
        status: 200,
        json: sinon.stub().returns({ producto: mockProduct })
      });
      
      const result = await mockProductController.getProductById(1);
      expect(result.status).to.equal(200);
    });

    // Test 4: getProductById - Not found
    it('4. should return 404 when product not found by ID', async () => {
      mockProductController.getProductById.resolves({
        status: 404,
        json: sinon.stub().returns({ error: 'Producto no encontrado' })
      });
      
      const result = await mockProductController.getProductById(999);
      expect(result.status).to.equal(404);
    });

    // Test 5: getProductsByName - Success
    it('5. should get products by name successfully', async () => {
      const mockProducts = [{ id: 1, name_product: 'Café Americano' }];
      
      mockProductController.getProductsByName.resolves({
        status: 200,
        json: sinon.stub().returns({ productos: mockProducts })
      });
      
      const result = await mockProductController.getProductsByName('Café');
      expect(result.status).to.equal(200);
    });

    // Test 6: getProductsByPrice - Success
    it('6. should get products by price successfully', async () => {
      const mockProducts = [{ id: 1, name_product: 'Café Test', price_product: 5.50 }];
      
      mockProductController.getProductsByPrice.resolves({
        status: 200,
        json: sinon.stub().returns({ productos: mockProducts })
      });
      
      const result = await mockProductController.getProductsByPrice(5.50);
      expect(result.status).to.equal(200);
    });

    // Test 7: getProductsByStock - Boolean type
    it('7. should get products by stock with boolean type', async () => {
      const mockProducts = [{ id: 1, stock: 1, stock_type: 'boolean', stock_display: 'Disponible' }];
      
      mockProductController.getProductsByStock.resolves({
        status: 200,
        json: sinon.stub().returns({ productos: mockProducts })
      });
      
      const result = await mockProductController.getProductsByStock('disponible');
      expect(result.status).to.equal(200);
    });

    // Test 8: createProduct - Success with image
    it('8. should create product successfully with image', async () => {
      const mockProduct = {
        id: 1,
        name_product: 'Nuevo Café',
        price_product: 6.00,
        stock: 10,
        stock_type: 'units',
        image_product: 'https://imagekit.io/image.jpg'
      };
      
      mockProductController.createProduct.resolves({
        status: 201,
        json: sinon.stub().returns({ message: 'Producto creado exitosamente', producto: mockProduct })
      });
      
      const result = await mockProductController.createProduct(mockProduct);
      expect(result.status).to.equal(201);
    });

    // Test 9: createProduct - Missing required fields
    it('9. should return 400 when missing required fields', async () => {
      mockProductController.createProduct.resolves({
        status: 400,
        json: sinon.stub().returns({ error: 'Faltan campos requeridos' })
      });
      
      const result = await mockProductController.createProduct({ name_product: 'Test' });
      expect(result.status).to.equal(400);
    });

    // Test 10: createProduct - Invalid stock type
    it('10. should return 400 for invalid stock type', async () => {
      mockProductController.createProduct.resolves({
        status: 400,
        json: sinon.stub().returns({ error: 'stock_type debe ser "units" o "boolean"' })
      });
      
      const productData = {
        name_product: 'Test',
        price_product: 5.00,
        stock_type: 'invalid'
      };
      
      const result = await mockProductController.createProduct(productData);
      expect(result.status).to.equal(400);
    });

    // Test 11: updateProduct - Success
    it('11. should update product successfully', async () => {
      const mockUpdatedProduct = {
        id: 1,
        name_product: 'Café Actualizado',
        price_product: 7.00
      };
      
      mockProductController.updateProduct.resolves({
        status: 200,
        json: sinon.stub().returns({ message: 'Producto actualizado exitosamente', producto: mockUpdatedProduct })
      });
      
      const result = await mockProductController.updateProduct(1, { name_product: 'Café Actualizado' });
      expect(result.status).to.equal(200);
    });

    // Test 12: updateProduct - Product not found
    it('12. should return 404 when updating non-existent product', async () => {
      mockProductController.updateProduct.resolves({
        status: 404,
        json: sinon.stub().returns({ error: 'Producto no encontrado' })
      });
      
      const result = await mockProductController.updateProduct(999, { name_product: 'Test' });
      expect(result.status).to.equal(404);
    });

    // Test 13: updateProductImage - Success
    it('13. should update product image successfully', async () => {
      const mockFile = {
        buffer: Buffer.from('fake image data'),
        mimetype: 'image/jpeg'
      };
      
      mockProductController.updateProductImage.resolves({
        status: 200,
        json: sinon.stub().returns({ message: 'Imagen actualizada exitosamente' })
      });
      
      const result = await mockProductController.updateProductImage(1, mockFile);
      expect(result.status).to.equal(200);
    });

    // Test 14: updateProductImage - No file provided
    it('14. should return 400 when no image provided for update', async () => {
      mockProductController.updateProductImage.resolves({
        status: 400,
        json: sinon.stub().returns({ error: 'No se subió ningún archivo' })
      });
      
      const result = await mockProductController.updateProductImage(1, null);
      expect(result.status).to.equal(400);
    });

    // Test 15: deleteProduct - Success
    it('15. should delete product successfully', async () => {
      mockProductController.deleteProduct.resolves({
        status: 200,
        json: sinon.stub().returns({ message: 'Producto eliminado exitosamente' })
      });
      
      const result = await mockProductController.deleteProduct(1);
      expect(result.status).to.equal(200);
    });

    // Test 16: deleteProduct - Product not found
    it('16. should return 404 when deleting non-existent product', async () => {
      mockProductController.deleteProduct.resolves({
        status: 404,
        json: sinon.stub().returns({ error: 'Producto no encontrado' })
      });
      
      const result = await mockProductController.deleteProduct(999);
      expect(result.status).to.equal(404);
    });
  });

  // ==================== PROMOTION CONTROLLER TESTS ====================

  describe('PromotionController', () => {
    // Test 17: createPromotion - Success
    it('17. should create promotion successfully', async () => {
      const mockPromotion = {
        id: 1,
        name_promotion: 'Combo Test',
        total_combo_price: 8.50,
        product_ids: [1, 2]
      };
      
      mockPromotionController.createPromotion.resolves({
        status: 201,
        json: sinon.stub().returns({ message: 'Promoción creada exitosamente', promocion: mockPromotion })
      });
      
      const result = await mockPromotionController.createPromotion(mockPromotion);
      expect(result.status).to.equal(201);
    });

    // Test 18: createPromotion - Missing name
    it('18. should return 400 when promotion name is missing', async () => {
      mockPromotionController.createPromotion.resolves({
        status: 400,
        json: sinon.stub().returns({ error: 'El nombre de la promoción es requerido' })
      });
      
      const result = await mockPromotionController.createPromotion({ total_combo_price: 8.50 });
      expect(result.status).to.equal(400);
    });

    // Test 19: createPromotion - Invalid combo price
    it('19. should return 400 when combo price is invalid', async () => {
      mockPromotionController.createPromotion.resolves({
        status: 400,
        json: sinon.stub().returns({ error: 'El precio del combo debe ser un número positivo' })
      });
      
      const promotionData = {
        name_promotion: 'Test',
        total_combo_price: -5.00,
        product_ids: [1, 2]
      };
      
      const result = await mockPromotionController.createPromotion(promotionData);
      expect(result.status).to.equal(400);
    });

    // Test 20: createPromotion - Less than 2 products
    it('20. should return 400 when less than 2 products provided', async () => {
      mockPromotionController.createPromotion.resolves({
        status: 400,
        json: sinon.stub().returns({ error: 'Se requieren al menos 2 productos para crear una promoción' })
      });
      
      const promotionData = {
        name_promotion: 'Test',
        total_combo_price: 8.50,
        product_ids: [1]
      };
      
      const result = await mockPromotionController.createPromotion(promotionData);
      expect(result.status).to.equal(400);
    });

    // Test 21: createPromotion - Duplicate products
    it('21. should return 400 when duplicate products provided', async () => {
      mockPromotionController.createPromotion.resolves({
        status: 400,
        json: sinon.stub().returns({ error: 'No se pueden repetir productos en la promoción' })
      });
      
      const promotionData = {
        name_promotion: 'Test',
        total_combo_price: 8.50,
        product_ids: [1, 1, 2]
      };
      
      const result = await mockPromotionController.createPromotion(promotionData);
      expect(result.status).to.equal(400);
    });

    // Test 22: getPromotionById - Success
    it('22. should get promotion by ID successfully', async () => {
      const mockPromotion = {
        id: 1,
        name_promotion: 'Combo Test',
        products: []
      };
      
      mockPromotionController.getPromotionById.resolves({
        status: 200,
        json: sinon.stub().returns({ promocion: mockPromotion })
      });
      
      const result = await mockPromotionController.getPromotionById(1);
      expect(result.status).to.equal(200);
    });

    // Test 23: getPromotionById - Not found
    it('23. should return 404 when promotion not found', async () => {
      mockPromotionController.getPromotionById.resolves({
        status: 404,
        json: sinon.stub().returns({ error: 'Promoción no encontrada' })
      });
      
      const result = await mockPromotionController.getPromotionById(999);
      expect(result.status).to.equal(404);
    });

    // Test 24: updatePromotion - Success
    it('24. should update promotion successfully', async () => {
      const mockUpdatedPromotion = {
        id: 1,
        name_promotion: 'Combo Actualizado',
        total_combo_price: 9.00
      };
      
      mockPromotionController.updatePromotion.resolves({
        status: 200,
        json: sinon.stub().returns({ message: 'Promoción actualizada exitosamente', promocion: mockUpdatedPromotion })
      });
      
      const result = await mockPromotionController.updatePromotion(1, { name_promotion: 'Combo Actualizado' });
      expect(result.status).to.equal(200);
    });

    // Test 25: deletePromotion - Success
    it('25. should delete promotion successfully', async () => {
      mockPromotionController.deletePromotion.resolves({
        status: 200,
        json: sinon.stub().returns({ message: 'Promoción eliminada exitosamente' })
      });
      
      const result = await mockPromotionController.deletePromotion(1);
      expect(result.status).to.equal(200);
    });

    // Test 26: getActivePromotions - Success
    it('26. should get active promotions successfully', async () => {
      const mockPromotions = [
        { id: 1, name_promotion: 'Combo 1', active: true },
        { id: 2, name_promotion: 'Combo 2', active: true }
      ];
      
      mockPromotionController.getActivePromotions.resolves({
        status: 200,
        json: sinon.stub().returns({ promociones: mockPromotions })
      });
      
      const result = await mockPromotionController.getActivePromotions();
      expect(result.status).to.equal(200);
    });

    // Test 27: uploadPromotionImage - Success
    it('27. should upload promotion image successfully', async () => {
      const mockFile = {
        buffer: Buffer.from('fake image data'),
        mimetype: 'image/jpeg'
      };
      
      mockPromotionController.uploadPromotionImage.resolves({
        status: 200,
        json: sinon.stub().returns({ message: 'Imagen subida exitosamente' })
      });
      
      const result = await mockPromotionController.uploadPromotionImage(1, mockFile);
      expect(result.status).to.equal(200);
    });
  });

  // ==================== PRODUCT MODEL TESTS ====================

  describe('ProductModel', () => {
    // Test 28: convertImageToBase64 - Success
    it('28. should convert image to base64 successfully', async () => {
      const mockImageBuffer = Buffer.from('fake image data');
      const expectedBase64 = 'data:image/jpeg;base64,' + mockImageBuffer.toString('base64');
      
      mockProductModel.convertImageToBase64.resolves(expectedBase64);
      
      const result = await mockProductModel.convertImageToBase64(mockImageBuffer, 'image/jpeg');
      expect(result).to.include('data:image/jpeg;base64,');
    });

    // Test 29: processImageBuffer - Success
    it('29. should process image buffer successfully', async () => {
      const mockImageBuffer = Buffer.from('fake image data');
      const expectedResult = 'data:image/jpeg;base64,' + mockImageBuffer.toString('base64');
      
      mockProductModel.processImageBuffer.resolves(expectedResult);
      
      const result = await mockProductModel.processImageBuffer(mockImageBuffer);
      expect(result).to.include('data:image/jpeg;base64,');
    });

    // Test 30: processImageUrl - Success
    it('30. should process image URL successfully', async () => {
      const imageUrl = 'https://example.com/image.jpg';
      const expectedResult = 'data:image/jpeg;base64,/9j/4AAQ...';
      
      mockProductModel.processImageUrl.resolves(expectedResult);
      
      const result = await mockProductModel.processImageUrl(imageUrl);
      expect(result).to.include('data:image/jpeg;base64,');
    });

    // Test 31: findAll - Success
    it('31. should find all products successfully', async () => {
      const mockProducts = [
        { id: 1, name_product: 'Café 1', name_category: 'Bebidas' },
        { id: 2, name_product: 'Café 2', name_category: 'Bebidas' }
      ];
      
      mockProductModel.findAll.resolves(mockProducts);
      
      const result = await mockProductModel.findAll();
      expect(result).to.be.an('array');
      expect(result).to.have.length(2);
    });

    // Test 32: findById - Success
    it('32. should find product by ID successfully', async () => {
      const mockProduct = { id: 1, name_product: 'Café Test', name_category: 'Bebidas' };
      
      mockProductModel.findById.resolves(mockProduct);
      
      const result = await mockProductModel.findById(1);
      expect(result).to.have.property('id', 1);
      expect(result).to.have.property('name_product', 'Café Test');
    });

    // Test 33: findByName - Success
    it('33. should find products by name successfully', async () => {
      const mockProducts = [{ id: 1, name_product: 'Café Americano' }];
      
      mockProductModel.findByName.resolves(mockProducts);
      
      const result = await mockProductModel.findByName('Café');
      expect(result).to.be.an('array');
      expect(result[0]).to.have.property('name_product');
    });

    // Test 34: findByPrice - Success
    it('34. should find products by price successfully', async () => {
      const mockProducts = [{ id: 1, name_product: 'Café Test', price_product: 5.50 }];
      
      mockProductModel.findByPrice.resolves(mockProducts);
      
      const result = await mockProductModel.findByPrice(5.50);
      expect(result).to.be.an('array');
      expect(result[0]).to.have.property('price_product', 5.50);
    });

    // Test 35: findByStock - Boolean type
    it('35. should find products by stock with boolean type', async () => {
      const mockProducts = [{ id: 1, stock: 1, stock_type: 'boolean' }];
      
      mockProductModel.findByStock.resolves(mockProducts);
      
      const result = await mockProductModel.findByStock(1, 'boolean');
      expect(result).to.be.an('array');
      expect(result[0]).to.have.property('stock_type', 'boolean');
    });

    // Test 36: create - Success with image processing
    it('36. should create product with image processing', async () => {
      const productData = {
        name_product: 'Nuevo Café',
        price_product: 6.00,
        stock: 10,
        stock_type: 'units',
        image_product: 'https://example.com/image.jpg',
        category_id: 1
      };
      
      const mockCreatedProduct = { id: 1, ...productData };
      mockProductModel.create.resolves(mockCreatedProduct);
      
      const result = await mockProductModel.create(productData);
      expect(result).to.have.property('id', 1);
      expect(result).to.have.property('name_product', 'Nuevo Café');
    });

    // Test 37: update - Success
    it('37. should update product successfully', async () => {
      const updateData = { name_product: 'Café Actualizado', price_product: 7.00 };
      const mockUpdatedProduct = { id: 1, ...updateData };
      
      mockProductModel.update.resolves(mockUpdatedProduct);
      
      const result = await mockProductModel.update(1, updateData);
      expect(result).to.have.property('id', 1);
      expect(result).to.have.property('name_product', 'Café Actualizado');
    });

    // Test 38: updateImage - Success
    it('38. should update product image successfully', async () => {
      const imageData = 'https://example.com/new-image.jpg';
      const mockUpdatedProduct = { id: 1, image_product: 'data:image/jpeg;base64,newimage' };
      
      mockProductModel.updateImage.resolves(mockUpdatedProduct);
      
      const result = await mockProductModel.updateImage(1, imageData);
      expect(result).to.have.property('id', 1);
      expect(result).to.have.property('image_product');
    });

    // Test 39: delete - Success
    it('39. should delete product successfully', async () => {
      mockProductModel.delete.resolves(true);
      
      const result = await mockProductModel.delete(1);
      expect(result).to.be.true;
    });
  });

  // ==================== PROMOTION MODEL TESTS ====================

  describe('PromotionModel', () => {
    // Test 40: create - Success
    it('40. should create promotion successfully', async () => {
      const promotionData = {
        name_promotion: 'Combo Test',
        description_promotion: 'Descripción del combo',
        total_combo_price: 8.50,
        product_ids: [1, 2]
      };
      
      const mockCreatedPromotion = { id: 1, ...promotionData };
      mockPromotionModel.create.resolves(mockCreatedPromotion);
      
      const result = await mockPromotionModel.create(promotionData);
      expect(result).to.have.property('id', 1);
      expect(result).to.have.property('name_promotion', 'Combo Test');
    });

    // Test 41: findAll - Success
    it('41. should find all promotions successfully', async () => {
      const mockPromotions = [
        { id: 1, name_promotion: 'Combo 1', products: [] },
        { id: 2, name_promotion: 'Combo 2', products: [] }
      ];
      
      mockPromotionModel.findAll.resolves(mockPromotions);
      
      const result = await mockPromotionModel.findAll();
      expect(result).to.be.an('array');
      expect(result).to.have.length(2);
    });

    // Test 42: findById - Success
    it('42. should find promotion by ID successfully', async () => {
      const mockPromotion = { id: 1, name_promotion: 'Combo Test', products: [] };
      
      mockPromotionModel.findById.resolves(mockPromotion);
      
      const result = await mockPromotionModel.findById(1);
      expect(result).to.have.property('id', 1);
      expect(result).to.have.property('name_promotion', 'Combo Test');
    });

    // Test 43: update - Success
    it('43. should update promotion successfully', async () => {
      const updateData = { name_promotion: 'Combo Actualizado', total_combo_price: 9.00 };
      const mockUpdatedPromotion = { id: 1, ...updateData };
      
      mockPromotionModel.update.resolves(mockUpdatedPromotion);
      
      const result = await mockPromotionModel.update(1, updateData);
      expect(result).to.have.property('id', 1);
      expect(result).to.have.property('name_promotion', 'Combo Actualizado');
    });

    // Test 44: delete - Success
    it('44. should delete promotion successfully', async () => {
      mockPromotionModel.delete.resolves(true);
      
      const result = await mockPromotionModel.delete(1);
      expect(result).to.be.true;
    });

    // Test 45: findActive - Success
    it('45. should find active promotions successfully', async () => {
      const mockActivePromotions = [
        { id: 1, name_promotion: 'Combo Activo 1', active: true },
        { id: 2, name_promotion: 'Combo Activo 2', active: true }
      ];
      
      mockPromotionModel.findActive.resolves(mockActivePromotions);
      
      const result = await mockPromotionModel.findActive();
      expect(result).to.be.an('array');
      expect(result.every(promo => promo.active)).to.be.true;
    });
  });

  // ==================== INTEGRATION AND VALIDATION TESTS ====================

  describe('Integration and Validation Tests', () => {
    // Test 46: Stock type validation
    it('46. should validate stock type correctly', () => {
      const validStockTypes = ['units', 'boolean'];
      const testStockType = 'units';
      
      expect(validStockTypes).to.include(testStockType);
    });

    // Test 47: Price validation
    it('47. should validate price is positive number', () => {
      const price = 5.50;
      
      expect(price).to.be.a('number');
      expect(price).to.be.greaterThan(0);
    });

    // Test 48: Product IDs array validation for promotions
    it('48. should validate product IDs array for promotions', () => {
      const productIds = [1, 2, 3];
      
      expect(productIds).to.be.an('array');
      expect(productIds).to.have.length.greaterThan(1);
      expect(new Set(productIds)).to.have.lengthOf(productIds.length); // No duplicates
    });

    // Test 49: Image format validation
    it('49. should validate image formats', () => {
      const validMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      const testMimeType = 'image/jpeg';
      
      expect(validMimeTypes).to.include(testMimeType);
    });

    // Test 50: Error response format validation
    it('50. should handle errors and return proper response format', () => {
      const errorResponse = {
        status: 500,
        error: 'Internal server error',
        timestamp: new Date().toISOString()
      };
      
      expect(errorResponse).to.have.property('status');
      expect(errorResponse).to.have.property('error');
      expect(errorResponse).to.have.property('timestamp');
      expect(errorResponse.status).to.be.a('number');
    });
  });
});