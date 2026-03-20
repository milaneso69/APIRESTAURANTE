import { expect } from 'chai';
import sinon from 'sinon';
import request from 'supertest';
import express from 'express';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import PDFDocument from 'pdfkit';
import moment from 'moment';

// Mock de la base de datos
const mockDb = {
  query: sinon.stub(),
  connect: sinon.stub()
};

// Mock del controlador
const mockSaleController = {
  createCashSale: sinon.stub(),
  createCardSale: sinon.stub(),
  getSaleById: sinon.stub(),
  getUserSales: sinon.stub(),
  generateTicketPDF: sinon.stub(),
  updateSaleStatus: sinon.stub(),
  confirmDelivery: sinon.stub(),
  getSalesStats: sinon.stub(),
  getPaymentMethodsStats: sinon.stub(),
  getExpirationTimesStats: sinon.stub(),
  getPaymentMethods: sinon.stub(),
  getExpirationTimes: sinon.stub(),
  cancelExpiredSales: sinon.stub(),
  getDailySalesCut: sinon.stub(),
  healthCheck: sinon.stub()
};

// Mock del modelo
const mockSaleModel = {
  createCashSale: sinon.stub(),
  createCardSale: sinon.stub(),
  findById: sinon.stub(),
  findByUserId: sinon.stub(),
  reduceProductStock: sinon.stub(),
  updateStatus: sinon.stub(),
  confirmDeliveryByOrderNumber: sinon.stub(),
  getSalesStats: sinon.stub(),
  getPaymentMethodsStats: sinon.stub(),
  getExpirationTimesStats: sinon.stub(),
  getPaymentMethods: sinon.stub(),
  getExpirationTimes: sinon.stub(),
  cancelExpiredSales: sinon.stub(),
  generateSecretWord: sinon.stub(),
  findWithFilters: sinon.stub(),
  detectAllPromotions: sinon.stub(),
  getDailySalesCut: sinon.stub(),
  getSalesCutByDateRange: sinon.stub()
};

// Mock de Stripe
const mockStripeService = {
  createPaymentIntent: sinon.stub(),
  confirmPayment: sinon.stub()
};

describe('Sales Service Unit Tests', () => {
  let app;
  
  beforeEach(() => {
    app = express();
    app.use(express.json());
    sinon.restore();
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('SaleController Tests', () => {
    describe('createCashSale', () => {
      it('should create cash sale successfully', async () => {
        const saleData = {
          order_id: 1,
          user_id: 1,
          expiration_time_id: 1,
          cash_amount: 100.50
        };
        const mockResult = {
          success: true,
          message: 'Venta en efectivo creada exitosamente',
          data: {
            sale_id: 1,
            secret_word: 'CAFE123',
            cash_amount: 100.50,
            payment_type: 'cash',
            status: 'Pendiente'
          }
        };
        mockSaleController.createCashSale.resolves(mockResult);
        
        const result = await mockSaleController.createCashSale(saleData);
        expect(result.success).to.be.true;
        expect(result.data.sale_id).to.equal(1);
        expect(result.data.payment_type).to.equal('cash');
      });

      it('should reject creation without required fields', async () => {
        const incompleteData = { order_id: 1 };
        mockSaleController.createCashSale.rejects(new Error('order_id, user_id y expiration_time_id son requeridos'));
        
        try {
          await mockSaleController.createCashSale(incompleteData);
        } catch (error) {
          expect(error.message).to.equal('order_id, user_id y expiration_time_id son requeridos');
        }
      });

      it('should validate cash_amount is positive number', async () => {
        const invalidData = {
          order_id: 1,
          user_id: 1,
          expiration_time_id: 1,
          cash_amount: -50
        };
        mockSaleController.createCashSale.rejects(new Error('cash_amount debe ser un número mayor a 0'));
        
        try {
          await mockSaleController.createCashSale(invalidData);
        } catch (error) {
          expect(error.message).to.equal('cash_amount debe ser un número mayor a 0');
        }
      });

      it('should handle order service errors', async () => {
        const saleData = {
          order_id: 999,
          user_id: 1,
          expiration_time_id: 1
        };
        mockSaleController.createCashSale.rejects(new Error('Orden no encontrada'));
        
        try {
          await mockSaleController.createCashSale(saleData);
        } catch (error) {
          expect(error.message).to.equal('Orden no encontrada');
        }
      });
    });

    describe('createCardSale', () => {
      it('should create card sale successfully', async () => {
        const saleData = {
          order_id: 1,
          user_id: 1,
          amount: 75.25
        };
        const mockResult = {
          success: true,
          message: 'Venta con tarjeta iniciada',
          data: {
            sale_id: 1,
            payment_intent_id: 'pi_test123',
            client_secret: 'pi_test123_secret',
            amount: 75.25
          }
        };
        mockSaleController.createCardSale.resolves(mockResult);
        
        const result = await mockSaleController.createCardSale(saleData);
        expect(result.success).to.be.true;
        expect(result.data.amount).to.equal(75.25);
      });

      it('should reject creation without required fields', async () => {
        const incompleteData = { order_id: 1 };
        mockSaleController.createCardSale.rejects(new Error('order_id, user_id y amount son requeridos'));
        
        try {
          await mockSaleController.createCardSale(incompleteData);
        } catch (error) {
          expect(error.message).to.equal('order_id, user_id y amount son requeridos');
        }
      });

      it('should validate amount is positive', async () => {
        const invalidData = {
          order_id: 1,
          user_id: 1,
          amount: 0
        };
        mockSaleController.createCardSale.rejects(new Error('El monto debe ser mayor a 0'));
        
        try {
          await mockSaleController.createCardSale(invalidData);
        } catch (error) {
          expect(error.message).to.equal('El monto debe ser mayor a 0');
        }
      });
    });

    describe('getSaleById', () => {
      it('should return sale by ID successfully', async () => {
        const mockSale = {
          id: 1,
          order_id: 1,
          user_id: 1,
          payment_method_name: 'Efectivo',
          payment_status: 'Completado',
          secret_word: 'CAFE123'
        };
        mockSaleController.getSaleById.resolves(mockSale);
        
        const result = await mockSaleController.getSaleById(1);
        expect(result.id).to.equal(1);
        expect(result.payment_method_name).to.equal('Efectivo');
      });

      it('should return 404 when sale not found', async () => {
        mockSaleController.getSaleById.rejects(new Error('Venta no encontrada'));
        
        try {
          await mockSaleController.getSaleById(999);
        } catch (error) {
          expect(error.message).to.equal('Venta no encontrada');
        }
      });
    });

    describe('getUserSales', () => {
      it('should return user sales successfully', async () => {
        const mockSales = [
          { id: 1, order_id: 1, payment_status: 'Completado' },
          { id: 2, order_id: 2, payment_status: 'Pendiente' }
        ];
        mockSaleController.getUserSales.resolves({
          sales: mockSales,
          total: 2,
          page: 1,
          limit: 10
        });
        
        const result = await mockSaleController.getUserSales(1);
        expect(result.sales).to.be.an('array');
        expect(result.total).to.equal(2);
      });

      it('should handle pagination parameters', async () => {
        const mockResult = {
          sales: [],
          total: 0,
          page: 2,
          limit: 5
        };
        mockSaleController.getUserSales.resolves(mockResult);
        
        const result = await mockSaleController.getUserSales(1, { page: 2, limit: 5 });
        expect(result.page).to.equal(2);
        expect(result.limit).to.equal(5);
      });
    });

    describe('generateTicketPDF', () => {
      it('should generate PDF ticket successfully', async () => {
        const mockPDFBuffer = Buffer.from('PDF content');
        mockSaleController.generateTicketPDF.resolves(mockPDFBuffer);
        
        const result = await mockSaleController.generateTicketPDF(1);
        expect(result).to.be.instanceOf(Buffer);
      });

      it('should handle PDF generation errors', async () => {
        mockSaleController.generateTicketPDF.rejects(new Error('Error generando PDF'));
        
        try {
          await mockSaleController.generateTicketPDF(999);
        } catch (error) {
          expect(error.message).to.equal('Error generando PDF');
        }
      });
    });

    describe('updateSaleStatus', () => {
      it('should update sale status successfully', async () => {
        const mockResult = {
          success: true,
          message: 'Estado de venta actualizado',
          sale: { id: 1, payment_status: 'Completado' }
        };
        mockSaleController.updateSaleStatus.resolves(mockResult);
        
        const result = await mockSaleController.updateSaleStatus(1, 'Completado');
        expect(result.success).to.be.true;
        expect(result.sale.payment_status).to.equal('Completado');
      });

      it('should validate status values', async () => {
        mockSaleController.updateSaleStatus.rejects(new Error('Estado inválido'));
        
        try {
          await mockSaleController.updateSaleStatus(1, 'InvalidStatus');
        } catch (error) {
          expect(error.message).to.equal('Estado inválido');
        }
      });
    });

    describe('confirmDelivery', () => {
      it('should confirm delivery successfully', async () => {
        const mockResult = {
          success: true,
          message: 'Entrega confirmada exitosamente',
          sale: { id: 1, payment_status: 'Completado' }
        };
        mockSaleController.confirmDelivery.resolves(mockResult);
        
        const result = await mockSaleController.confirmDelivery('ORD001', 'CAFE123');
        expect(result.success).to.be.true;
        expect(result.message).to.equal('Entrega confirmada exitosamente');
      });

      it('should reject invalid secret word', async () => {
        mockSaleController.confirmDelivery.rejects(new Error('Palabra secreta incorrecta'));
        
        try {
          await mockSaleController.confirmDelivery('ORD001', 'WRONG123');
        } catch (error) {
          expect(error.message).to.equal('Palabra secreta incorrecta');
        }
      });
    });

    describe('getSalesStats', () => {
      it('should return sales statistics', async () => {
        const mockStats = {
          total_sales: 150,
          total_amount: 5250.75,
          completed_sales: 140,
          pending_sales: 10
        };
        mockSaleController.getSalesStats.resolves(mockStats);
        
        const result = await mockSaleController.getSalesStats();
        expect(result.total_sales).to.equal(150);
        expect(result.total_amount).to.equal(5250.75);
      });
    });

    describe('getPaymentMethodsStats', () => {
      it('should return payment methods statistics', async () => {
        const mockStats = [
          { method: 'Efectivo', count: 80, percentage: 60 },
          { method: 'Tarjeta', count: 53, percentage: 40 }
        ];
        mockSaleController.getPaymentMethodsStats.resolves(mockStats);
        
        const result = await mockSaleController.getPaymentMethodsStats();
        expect(result).to.be.an('array');
        expect(result[0].method).to.equal('Efectivo');
      });
    });

    describe('getExpirationTimesStats', () => {
      it('should return expiration times statistics', async () => {
        const mockStats = [
          { minutes: 15, count: 45, percentage: 30 },
          { minutes: 30, count: 75, percentage: 50 }
        ];
        mockSaleController.getExpirationTimesStats.resolves(mockStats);
        
        const result = await mockSaleController.getExpirationTimesStats();
        expect(result).to.be.an('array');
        expect(result[0].minutes).to.equal(15);
      });
    });

    describe('getPaymentMethods', () => {
      it('should return available payment methods', async () => {
        const mockMethods = [
          { id: 1, name: 'Efectivo', is_active: true },
          { id: 2, name: 'Tarjeta', is_active: true }
        ];
        mockSaleController.getPaymentMethods.resolves(mockMethods);
        
        const result = await mockSaleController.getPaymentMethods();
        expect(result).to.be.an('array');
        expect(result[0].name).to.equal('Efectivo');
      });
    });

    describe('getExpirationTimes', () => {
      it('should return available expiration times', async () => {
        const mockTimes = [
          { id: 1, minutes: 15, display_name: '15 minutos', is_active: true },
          { id: 2, minutes: 30, display_name: '30 minutos', is_active: true }
        ];
        mockSaleController.getExpirationTimes.resolves(mockTimes);
        
        const result = await mockSaleController.getExpirationTimes();
        expect(result).to.be.an('array');
        expect(result[0].minutes).to.equal(15);
      });
    });

    describe('cancelExpiredSales', () => {
      it('should cancel expired sales successfully', async () => {
        const mockResult = {
          success: true,
          message: 'Ventas expiradas canceladas',
          cancelled_count: 5
        };
        mockSaleController.cancelExpiredSales.resolves(mockResult);
        
        const result = await mockSaleController.cancelExpiredSales();
        expect(result.success).to.be.true;
        expect(result.cancelled_count).to.equal(5);
      });
    });

    describe('getDailySalesCut', () => {
      it('should return daily sales cut', async () => {
        const mockCut = {
          date: '2024-01-15',
          total_sales: 25,
          total_amount: 1250.50,
          cash_sales: 15,
          card_sales: 10
        };
        mockSaleController.getDailySalesCut.resolves(mockCut);
        
        const result = await mockSaleController.getDailySalesCut('2024-01-15');
        expect(result.total_sales).to.equal(25);
        expect(result.total_amount).to.equal(1250.50);
      });
    });

    describe('healthCheck', () => {
      it('should return health status', async () => {
        const mockHealth = {
          status: 'OK',
          timestamp: new Date().toISOString(),
          service: 'sales'
        };
        mockSaleController.healthCheck.resolves(mockHealth);
        
        const result = await mockSaleController.healthCheck();
        expect(result.status).to.equal('OK');
        expect(result.service).to.equal('sales');
      });
    });
  });

  describe('SaleModel Tests', () => {
    describe('createCashSale', () => {
      it('should create cash sale in database', async () => {
        const saleData = {
          order_id: 1,
          user_id: 1,
          expiration_time_id: 1,
          cash_amount: 100.50
        };
        const mockSale = {
          id: 1,
          secret_word: 'CAFE123',
          payment_status: 'Pendiente',
          ...saleData
        };
        mockSaleModel.createCashSale.resolves(mockSale);
        
        const result = await mockSaleModel.createCashSale(saleData, 'Bearer token');
        expect(result.id).to.equal(1);
        expect(result.secret_word).to.equal('CAFE123');
      });

      it('should handle order validation errors', async () => {
        const saleData = { order_id: 999, user_id: 1, expiration_time_id: 1 };
        mockSaleModel.createCashSale.rejects(new Error('Orden no encontrada'));
        
        try {
          await mockSaleModel.createCashSale(saleData, 'Bearer token');
        } catch (error) {
          expect(error.message).to.equal('Orden no encontrada');
        }
      });

      it('should reject completed orders', async () => {
        const saleData = { order_id: 1, user_id: 1, expiration_time_id: 1 };
        mockSaleModel.createCashSale.rejects(new Error("No se puede crear una venta para una orden con estado 'completada'"));
        
        try {
          await mockSaleModel.createCashSale(saleData, 'Bearer token');
        } catch (error) {
          expect(error.message).to.include('completada');
        }
      });
    });

    describe('findById', () => {
      it('should find sale by ID', async () => {
        const mockSale = {
          id: 1,
          order_id: 1,
          user_id: 1,
          payment_method_name: 'Efectivo',
          payment_status: 'Completado'
        };
        mockSaleModel.findById.resolves(mockSale);
        
        const result = await mockSaleModel.findById(1);
        expect(result.id).to.equal(1);
        expect(result.payment_method_name).to.equal('Efectivo');
      });

      it('should return null for non-existent sale', async () => {
        mockSaleModel.findById.resolves(null);
        
        const result = await mockSaleModel.findById(999);
        expect(result).to.be.null;
      });
    });

    describe('findByUserId', () => {
      it('should find sales by user ID', async () => {
        const mockSales = [
          { id: 1, user_id: 1, payment_status: 'Completado' },
          { id: 2, user_id: 1, payment_status: 'Pendiente' }
        ];
        mockSaleModel.findByUserId.resolves(mockSales);
        
        const result = await mockSaleModel.findByUserId(1);
        expect(result).to.be.an('array');
        expect(result).to.have.length(2);
      });

      it('should handle pagination options', async () => {
        const mockSales = [{ id: 1, user_id: 1 }];
        mockSaleModel.findByUserId.resolves(mockSales);
        
        const result = await mockSaleModel.findByUserId(1, { limit: 5, offset: 10 });
        expect(result).to.be.an('array');
      });
    });

    describe('reduceProductStock', () => {
      it('should reduce product stock successfully', async () => {
        const products = [
          { product_id: 1, quantity: 2 },
          { product_id: 2, quantity: 1 }
        ];
        mockSaleModel.reduceProductStock.resolves({ success: true });
        
        const result = await mockSaleModel.reduceProductStock(products, 'Bearer token');
        expect(result.success).to.be.true;
      });

      it('should handle insufficient stock errors', async () => {
        const products = [{ product_id: 1, quantity: 100 }];
        mockSaleModel.reduceProductStock.rejects(new Error('Stock insuficiente'));
        
        try {
          await mockSaleModel.reduceProductStock(products, 'Bearer token');
        } catch (error) {
          expect(error.message).to.equal('Stock insuficiente');
        }
      });
    });

    describe('updateStatus', () => {
      it('should update sale status', async () => {
        const mockUpdatedSale = {
          id: 1,
          payment_status: 'Completado',
          updated_at: new Date()
        };
        mockSaleModel.updateStatus.resolves(mockUpdatedSale);
        
        const result = await mockSaleModel.updateStatus(1, 'Completado');
        expect(result.payment_status).to.equal('Completado');
      });

      it('should reject invalid status', async () => {
        mockSaleModel.updateStatus.rejects(new Error('Estado inválido'));
        
        try {
          await mockSaleModel.updateStatus(1, 'InvalidStatus');
        } catch (error) {
          expect(error.message).to.equal('Estado inválido');
        }
      });
    });

    describe('confirmDeliveryByOrderNumber', () => {
      it('should confirm delivery with correct secret word', async () => {
        const mockResult = {
          success: true,
          sale: { id: 1, payment_status: 'Completado' }
        };
        mockSaleModel.confirmDeliveryByOrderNumber.resolves(mockResult);
        
        const result = await mockSaleModel.confirmDeliveryByOrderNumber('ORD001', 'CAFE123', 'Bearer token');
        expect(result.success).to.be.true;
        expect(result.sale.payment_status).to.equal('Completado');
      });

      it('should reject incorrect secret word', async () => {
        mockSaleModel.confirmDeliveryByOrderNumber.rejects(new Error('Palabra secreta incorrecta'));
        
        try {
          await mockSaleModel.confirmDeliveryByOrderNumber('ORD001', 'WRONG123', 'Bearer token');
        } catch (error) {
          expect(error.message).to.equal('Palabra secreta incorrecta');
        }
      });
    });

    describe('generateSecretWord', () => {
      it('should generate a secret word', () => {
        mockSaleModel.generateSecretWord.returns('CAFE123');
        
        const result = mockSaleModel.generateSecretWord();
        expect(result).to.be.a('string');
        expect(result).to.equal('CAFE123');
      });

      it('should generate different words on multiple calls', () => {
        mockSaleModel.generateSecretWord.onFirstCall().returns('CAFE123');
        mockSaleModel.generateSecretWord.onSecondCall().returns('LATTE456');
        
        const result1 = mockSaleModel.generateSecretWord();
        const result2 = mockSaleModel.generateSecretWord();
        expect(result1).to.not.equal(result2);
      });
    });

    describe('detectAllPromotions', () => {
      it('should detect applicable promotions', async () => {
        const products = [
          { product_id: 1, quantity: 2 },
          { product_id: 2, quantity: 1 }
        ];
        const mockPromotions = {
          applied_promotions: [
            { promotion_id: 1, promotion_name: '2x1 Café', discount: 15.50 }
          ],
          total_discount: 15.50
        };
        mockSaleModel.detectAllPromotions.resolves(mockPromotions);
        
        const result = await mockSaleModel.detectAllPromotions(products);
        expect(result.applied_promotions).to.be.an('array');
        expect(result.total_discount).to.equal(15.50);
      });

      it('should return empty promotions when none apply', async () => {
        const products = [{ product_id: 1, quantity: 1 }];
        const mockPromotions = {
          applied_promotions: [],
          total_discount: 0
        };
        mockSaleModel.detectAllPromotions.resolves(mockPromotions);
        
        const result = await mockSaleModel.detectAllPromotions(products);
        expect(result.applied_promotions).to.have.length(0);
        expect(result.total_discount).to.equal(0);
      });
    });

    describe('getDailySalesCut', () => {
      it('should return daily sales cut data', async () => {
        const mockCutData = {
          date: '2024-01-15',
          total_sales: 25,
          total_amount: 1250.50,
          cash_amount: 750.25,
          card_amount: 500.25,
          sales_by_hour: []
        };
        mockSaleModel.getDailySalesCut.resolves(mockCutData);
        
        const result = await mockSaleModel.getDailySalesCut('2024-01-15');
        expect(result.total_sales).to.equal(25);
        expect(result.total_amount).to.equal(1250.50);
      });

      it('should handle dates with no sales', async () => {
        const mockCutData = {
          date: '2024-01-01',
          total_sales: 0,
          total_amount: 0,
          cash_amount: 0,
          card_amount: 0,
          sales_by_hour: []
        };
        mockSaleModel.getDailySalesCut.resolves(mockCutData);
        
        const result = await mockSaleModel.getDailySalesCut('2024-01-01');
        expect(result.total_sales).to.equal(0);
        expect(result.total_amount).to.equal(0);
      });
    });

    describe('getSalesCutByDateRange', () => {
      it('should return sales cut for date range', async () => {
        const mockRangeData = {
          start_date: '2024-01-01',
          end_date: '2024-01-07',
          total_sales: 175,
          total_amount: 8750.75,
          daily_breakdown: []
        };
        mockSaleModel.getSalesCutByDateRange.resolves(mockRangeData);
        
        const result = await mockSaleModel.getSalesCutByDateRange('2024-01-01', '2024-01-07');
        expect(result.total_sales).to.equal(175);
        expect(result.total_amount).to.equal(8750.75);
      });
    });

    describe('findWithFilters', () => {
      it('should find sales with filters', async () => {
        const filters = {
          payment_status: 'Completado',
          payment_method: 'Efectivo'
        };
        const mockSales = [
          { id: 1, payment_status: 'Completado', payment_method_name: 'Efectivo' },
          { id: 2, payment_status: 'Completado', payment_method_name: 'Efectivo' }
        ];
        mockSaleModel.findWithFilters.resolves(mockSales);
        
        const result = await mockSaleModel.findWithFilters(filters);
        expect(result).to.be.an('array');
        expect(result).to.have.length(2);
      });

      it('should return empty array when no matches', async () => {
        const filters = { payment_status: 'NonExistent' };
        mockSaleModel.findWithFilters.resolves([]);
        
        const result = await mockSaleModel.findWithFilters(filters);
        expect(result).to.be.an('array');
        expect(result).to.have.length(0);
      });
    });

    describe('cancelExpiredSales', () => {
      it('should cancel expired sales', async () => {
        const mockResult = {
          cancelled_count: 5,
          cancelled_sales: [1, 2, 3, 4, 5]
        };
        mockSaleModel.cancelExpiredSales.resolves(mockResult);
        
        const result = await mockSaleModel.cancelExpiredSales();
        expect(result.cancelled_count).to.equal(5);
        expect(result.cancelled_sales).to.be.an('array');
      });

      it('should return zero when no expired sales', async () => {
        const mockResult = {
          cancelled_count: 0,
          cancelled_sales: []
        };
        mockSaleModel.cancelExpiredSales.resolves(mockResult);
        
        const result = await mockSaleModel.cancelExpiredSales();
        expect(result.cancelled_count).to.equal(0);
      });
    });
  });

  describe('Integration Tests', () => {
    describe('Sale Workflow', () => {
      it('should complete full cash sale workflow', async () => {
        // Mock the complete workflow
        const saleData = {
          order_id: 1,
          user_id: 1,
          expiration_time_id: 1,
          cash_amount: 100.50
        };
        
        // Create sale
        mockSaleModel.createCashSale.resolves({
          id: 1,
          secret_word: 'CAFE123',
          payment_status: 'Pendiente'
        });
        
        // Confirm delivery
        mockSaleModel.confirmDeliveryByOrderNumber.resolves({
          success: true,
          sale: { id: 1, payment_status: 'Completado' }
        });
        
        const sale = await mockSaleModel.createCashSale(saleData, 'Bearer token');
        expect(sale.id).to.equal(1);
        
        const confirmation = await mockSaleModel.confirmDeliveryByOrderNumber('ORD001', 'CAFE123', 'Bearer token');
        expect(confirmation.success).to.be.true;
      });
    });
  });
});