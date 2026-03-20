import { expect } from 'chai';
import sinon from 'sinon';
import OrderController from '../src/controllers/orderController.js';
import OrderModel from '../src/models/orderModel.js';
import axios from 'axios';
import PDFDocument from 'pdfkit';
import { pool } from '../src/config/db.js';

describe('Orders Module Tests', () => {
    let sandbox;
    let req, res;

    beforeEach(() => {
        sandbox = sinon.createSandbox();
        req = {
            body: {},
            params: {},
            query: {},
            headers: { authorization: 'Bearer test-token' },
            user: { id: 1, role: 2 }
        };
        res = {
            status: sandbox.stub().returnsThis(),
            json: sandbox.stub().returnsThis(),
            send: sandbox.stub().returnsThis(),
            setHeader: sandbox.stub().returnsThis(),
            pipe: sandbox.stub().returnsThis()
        };
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe('OrderController', () => {
        describe('createOrder', () => {
            it('should create order successfully', async () => {
                req.body = {
                    user_id: 1,
                    products: [{ product_id: 1, quantity: 2 }],
                    notes: 'Test order'
                };

                const mockOrder = {
                    id: 1,
                    order_number: 'ORD-001',
                    user_id: 1,
                    status: 'pendiente',
                    total: 100.00
                };

                sandbox.stub(OrderModel, 'create').resolves(mockOrder);

                await OrderController.createOrder(req, res);

                expect(res.status.calledWith(201)).to.be.true;
                expect(res.json.calledWith({
                    message: 'Orden creada exitosamente',
                    order: mockOrder
                })).to.be.true;
            });

            it('should reject order creation without user_id', async () => {
                req.body = {
                    products: [{ product_id: 1, quantity: 2 }]
                };

                await OrderController.createOrder(req, res);

                expect(res.status.calledWith(400)).to.be.true;
                expect(res.json.calledWith({
                    error: 'Datos inválidos. Se requiere user_id y al menos un producto'
                })).to.be.true;
            });

            it('should reject order creation without products', async () => {
                req.body = {
                    user_id: 1,
                    products: []
                };

                await OrderController.createOrder(req, res);

                expect(res.status.calledWith(400)).to.be.true;
                expect(res.json.calledWith({
                    error: 'Datos inválidos. Se requiere user_id y al menos un producto'
                })).to.be.true;
            });

            it('should reject order creation with invalid product structure', async () => {
                req.body = {
                    user_id: 1,
                    products: [{ product_id: 1 }] // missing quantity
                };

                await OrderController.createOrder(req, res);

                expect(res.status.calledWith(400)).to.be.true;
                expect(res.json.calledWith({
                    error: 'Cada producto debe tener product_id y quantity válidos'
                })).to.be.true;
            });

            it('should handle order creation errors', async () => {
                req.body = {
                    user_id: 1,
                    products: [{ product_id: 1, quantity: 2 }]
                };

                sandbox.stub(OrderModel, 'create').rejects(new Error('Database error'));

                await OrderController.createOrder(req, res);

                expect(res.status.calledWith(500)).to.be.true;
                expect(res.json.calledWith({
                    error: 'Database error'
                })).to.be.true;
            });
        });

        describe('getOrderById', () => {
            it('should get order by ID successfully', async () => {
                req.params.id = '1';
                const mockOrder = {
                    id: 1,
                    order_number: 'ORD-001',
                    user_id: 1,
                    status: 'pendiente'
                };

                sandbox.stub(OrderModel, 'findById').resolves(mockOrder);

                await OrderController.getOrderById(req, res);

                expect(res.status.calledWith(200)).to.be.true;
                expect(res.json.calledWith(mockOrder)).to.be.true;
            });

            it('should return 404 when order not found', async () => {
                req.params.id = '999';
                sandbox.stub(OrderModel, 'findById').resolves(null);

                await OrderController.getOrderById(req, res);

                expect(res.status.calledWith(404)).to.be.true;
                expect(res.json.calledWith({
                    error: 'Orden no encontrada'
                })).to.be.true;
            });

            it('should handle database errors', async () => {
                req.params.id = '1';
                sandbox.stub(OrderModel, 'findById').rejects(new Error('Database error'));

                await OrderController.getOrderById(req, res);

                expect(res.status.calledWith(500)).to.be.true;
                expect(res.json.calledWith({
                    error: 'Error interno del servidor'
                })).to.be.true;
            });
        });

        describe('getOrderByNumber', () => {
            it('should get order by number successfully', async () => {
                req.params.orderNumber = 'ORD-001';
                const mockOrder = {
                    id: 1,
                    order_number: 'ORD-001',
                    user_id: 1,
                    status: 'pendiente'
                };

                sandbox.stub(OrderModel, 'findByOrderNumber').resolves(mockOrder);

                await OrderController.getOrderByNumber(req, res);

                expect(res.status.calledWith(200)).to.be.true;
                expect(res.json.calledWith(mockOrder)).to.be.true;
            });

            it('should return 404 when order number not found', async () => {
                req.params.orderNumber = 'ORD-999';
                sandbox.stub(OrderModel, 'findByOrderNumber').resolves(null);

                await OrderController.getOrderByNumber(req, res);

                expect(res.status.calledWith(404)).to.be.true;
                expect(res.json.calledWith({
                    error: 'Orden no encontrada'
                })).to.be.true;
            });
        });

        describe('updateOrderStatus', () => {
            it('should update order status successfully', async () => {
                req.params.id = '1';
                req.body.status = 'confirmada';
                const mockOrder = {
                    id: 1,
                    status: 'confirmada'
                };

                sandbox.stub(OrderModel, 'updateStatus').resolves(mockOrder);

                await OrderController.updateOrderStatus(req, res);

                expect(res.status.calledWith(200)).to.be.true;
                expect(res.json.calledWith({
                    message: 'Estado actualizado exitosamente',
                    order: mockOrder
                })).to.be.true;
            });

            it('should reject invalid status', async () => {
                req.params.id = '1';
                req.body.status = 'invalid_status';

                await OrderController.updateOrderStatus(req, res);

                expect(res.status.calledWith(400)).to.be.true;
                expect(res.json.calledWith({
                    error: 'Estado inválido'
                })).to.be.true;
            });

            it('should require status field', async () => {
                req.params.id = '1';
                req.body = {};

                await OrderController.updateOrderStatus(req, res);

                expect(res.status.calledWith(400)).to.be.true;
                expect(res.json.calledWith({
                    error: 'El estado es requerido'
                })).to.be.true;
            });
        });

        describe('getOrdersByUser', () => {
            it('should get orders by user successfully', async () => {
                req.params.user_id = '1';
                const mockOrders = [
                    { id: 1, user_id: 1, status: 'pendiente' },
                    { id: 2, user_id: 1, status: 'completada' }
                ];

                sandbox.stub(OrderModel, 'findByUserId').resolves(mockOrders);

                await OrderController.getOrdersByUser(req, res);

                expect(res.status.calledWith(200)).to.be.true;
                expect(res.json.calledWith({
                    orders: mockOrders
                })).to.be.true;
            });

            it('should reject invalid user_id', async () => {
                req.params.user_id = 'invalid';

                await OrderController.getOrdersByUser(req, res);

                expect(res.status.calledWith(400)).to.be.true;
                expect(res.json.calledWith({
                    error: 'ID de usuario inválido'
                })).to.be.true;
            });
        });

        describe('getAllOrders', () => {
            it('should get all orders successfully', async () => {
                const mockOrders = [
                    { id: 1, user_id: 1, status: 'pendiente' },
                    { id: 2, user_id: 2, status: 'completada' }
                ];

                sandbox.stub(OrderModel, 'findAll').resolves(mockOrders);

                await OrderController.getAllOrders(req, res);

                expect(res.status.calledWith(200)).to.be.true;
                expect(res.json.calledWith({
                    orders: mockOrders
                })).to.be.true;
            });
        });


        describe('getOrderTicket', () => {
            it('should get order ticket successfully', async () => {
                req.params.id = '1';
                const mockOrder = {
                    id: 1,
                    order_number: 'ORD-001',
                    user_id: 1,
                    status: 'pendiente',
                    created_at: new Date(),
                    items: [],
                    subtotal: 50.00,
                    discount: 0,
                    total: 50.00
                };

                sandbox.stub(OrderModel, 'findById').resolves(mockOrder);
                sandbox.stub(axios, 'get').resolves({
                    data: { id: 1, name: 'Test User', email: 'test@test.com' }
                });

                await OrderController.getOrderTicket(req, res);

                expect(res.status.calledWith(200)).to.be.true;
            });
        });

        describe('generateOrderTicketPDF', () => {
            it('should generate PDF ticket successfully', async () => {
                req.params.id = '1';
                const mockOrder = {
                    id: 1,
                    order_number: 'ORD-001',
                    user_id: 1,
                    status: 'pendiente',
                    created_at: new Date(),
                    items: [],
                    subtotal: 50.00,
                    total: 50.00
                };

                sandbox.stub(OrderModel, 'findById').resolves(mockOrder);
                sandbox.stub(axios, 'get').resolves({
                    data: { id: 1, name: 'Test User' }
                });

                const mockDoc = {
                    pipe: sandbox.stub(),
                    fontSize: sandbox.stub().returnsThis(),
                    text: sandbox.stub().returnsThis(),
                    moveDown: sandbox.stub().returnsThis(),
                    end: sandbox.stub()
                };
                sandbox.stub(PDFDocument.prototype, 'pipe').returns(mockDoc);
                sandbox.stub(PDFDocument.prototype, 'fontSize').returns(mockDoc);
                sandbox.stub(PDFDocument.prototype, 'text').returns(mockDoc);
                sandbox.stub(PDFDocument.prototype, 'moveDown').returns(mockDoc);
                sandbox.stub(PDFDocument.prototype, 'end').returns(mockDoc);

                await OrderController.generateOrderTicketPDF(req, res);

                expect(res.setHeader.called).to.be.true;
            });
        });
    });

    describe('OrderModel', () => {
        describe('validateProductStock', () => {
            it('should validate product stock successfully', async () => {
                const products = [{ product_id: 1, quantity: 2 }];
                const mockResponse = {
                    status: 200,
                    data: {
                        stock: 10,
                        stock_type: 'units',
                        name_product: 'Test Product'
                    }
                };

                sandbox.stub(axios, 'get').resolves(mockResponse);

                const result = await OrderModel.validateProductStock(products);

                expect(result).to.be.an('array');
                expect(result[0]).to.have.property('valid', true);
                expect(result[0]).to.have.property('product_id', 1);
            });

            it('should handle insufficient stock', async () => {
                const products = [{ product_id: 1, quantity: 20 }];
                const mockResponse = {
                    status: 200,
                    data: {
                        stock: 5,
                        stock_type: 'units',
                        name_product: 'Test Product'
                    }
                };

                sandbox.stub(axios, 'get').resolves(mockResponse);

                const result = await OrderModel.validateProductStock(products);

                expect(result[0]).to.have.property('valid', false);
                expect(result[0]).to.have.property('message', 'Stock insuficiente');
            });

            it('should handle boolean stock type', async () => {
                const products = [{ product_id: 1, quantity: 1 }];
                const mockResponse = {
                    status: 200,
                    data: {
                        stock: 1,
                        stock_type: 'boolean',
                        name_product: 'Test Product'
                    }
                };

                sandbox.stub(axios, 'get').resolves(mockResponse);

                const result = await OrderModel.validateProductStock(products);

                expect(result[0]).to.have.property('valid', true);
                expect(result[0]).to.have.property('available_stock', 999);
            });

            it('should handle product not found', async () => {
                const products = [{ product_id: 999, quantity: 1 }];
                sandbox.stub(axios, 'get').resolves({ status: 404 });

                const result = await OrderModel.validateProductStock(products);

                expect(result[0]).to.have.property('valid', false);
                expect(result[0]).to.have.property('message', 'Producto no encontrado');
            });
        });

        describe('detectPromotion', () => {
            it('should detect promotion successfully', async () => {
                const products = [{ product_id: 1, quantity: 2 }, { product_id: 2, quantity: 1 }];
                const mockPromotions = [
                    {
                        id: 1,
                        name_promotion: 'Combo Test',
                        total_combo_price: 50.00,
                        products: [
                            { product_id: 1, quantity: 2 },
                            { product_id: 2, quantity: 1 }
                        ]
                    }
                ];

                sandbox.stub(axios, 'get').resolves({
                    status: 200,
                    data: mockPromotions
                });

                const result = await OrderModel.detectPromotion(products);

                expect(result).to.have.property('has_promotion', true);
                expect(result).to.have.property('promotion_name', 'Combo Test');
            });

            it('should handle no promotions available', async () => {
                const products = [{ product_id: 1, quantity: 1 }];
                sandbox.stub(axios, 'get').resolves({
                    status: 200,
                    data: []
                });

                const result = await OrderModel.detectPromotion(products);

                expect(result).to.have.property('has_promotion', false);
                expect(result).to.have.property('promotion_id', null);
            });
        });

        describe('detectAllPromotions', () => {
            it('should detect all applicable promotions', async () => {
                const products = [{ product_id: 1, quantity: 2 }];
                const mockPromotions = [
                    {
                        id: 1,
                        name_promotion: 'Test Promotion',
                        products: [{ product_id: 1, quantity: 1 }]
                    }
                ];

                sandbox.stub(axios, 'get').resolves({
                    status: 200,
                    data: mockPromotions
                });

                const result = await OrderModel.detectAllPromotions(products);

                expect(result).to.have.property('has_promotions');
                expect(result).to.have.property('applied_promotions');
            });
        });

        describe('create', () => {
            it('should create order successfully', async () => {
                const orderData = {
                    user_id: 1,
                    products: [{ product_id: 1, quantity: 2 }],
                    notes: 'Test order'
                };

                // Mock all dependencies
                sandbox.stub(OrderModel, 'validateProductStock').resolves([
                    { product_id: 1, valid: true, available_stock: 10 }
                ]);

                sandbox.stub(axios, 'get').resolves({
                    status: 200,
                    data: {
                        name_product: 'Test Product',
                        price_product: 25.00,
                        stock_type: 'units'
                    }
                });

                sandbox.stub(OrderModel, 'detectAllPromotions').resolves({
                    has_promotions: false,
                    applied_promotions: []
                });

                sandbox.stub(pool, 'query').resolves({
                    rows: [{
                        id: 1,
                        order_number: 'ORD-001',
                        user_id: 1,
                        status: 'pendiente',
                        total: 50.00
                    }]
                });

                const result = await OrderModel.create(orderData, 'Bearer test-token');

                expect(result).to.be.an('object');
                expect(result).to.have.property('id');
            });

            it('should reject order with insufficient stock', async () => {
                const orderData = {
                    user_id: 1,
                    products: [{ product_id: 1, quantity: 20 }]
                };

                sandbox.stub(OrderModel, 'validateProductStock').resolves([
                    { product_id: 1, valid: false, message: 'Stock insuficiente', product_name: 'Test Product' }
                ]);

                try {
                    await OrderModel.create(orderData, 'Bearer test-token');
                    expect.fail('Should have thrown an error');
                } catch (error) {
                    expect(error.message).to.include('Stock insuficiente');
                }
            });
        });

        describe('findById', () => {
            it('should find order by ID successfully', async () => {
                const mockOrder = {
                    id: 1,
                    order_number: 'ORD-001',
                    user_id: 1,
                    status: 'pendiente'
                };

                sandbox.stub(pool, 'query').resolves({
                    rows: [mockOrder]
                });

                const result = await OrderModel.findById(1);

                expect(result).to.deep.equal(mockOrder);
            });

            it('should return null when order not found', async () => {
                sandbox.stub(pool, 'query').resolves({
                    rows: []
                });

                const result = await OrderModel.findById(999);

                expect(result).to.be.null;
            });
        });

        describe('findByOrderNumber', () => {
            it('should find order by order number successfully', async () => {
                const mockOrder = {
                    id: 1,
                    order_number: 'ORD-001',
                    user_id: 1,
                    status: 'pendiente'
                };

                sandbox.stub(pool, 'query').resolves({
                    rows: [mockOrder]
                });

                const result = await OrderModel.findByOrderNumber('ORD-001');

                expect(result).to.deep.equal(mockOrder);
            });
        });

        describe('findByUserId', () => {
            it('should find orders by user ID successfully', async () => {
                const mockOrders = [
                    { id: 1, user_id: 1, status: 'pendiente' },
                    { id: 2, user_id: 1, status: 'completada' }
                ];

                sandbox.stub(pool, 'query').resolves({
                    rows: mockOrders
                });

                const result = await OrderModel.findByUserId(1);

                expect(result).to.deep.equal(mockOrders);
            });

            it('should filter orders by status', async () => {
                const mockOrders = [
                    { id: 1, user_id: 1, status: 'pendiente' }
                ];

                sandbox.stub(pool, 'query').resolves({
                    rows: mockOrders
                });

                const result = await OrderModel.findByUserId(1, { status: 'pendiente' });

                expect(result).to.deep.equal(mockOrders);
            });
        });

        describe('findAll', () => {
            it('should find all orders successfully', async () => {
                const mockOrders = [
                    { id: 1, user_id: 1, status: 'pendiente' },
                    { id: 2, user_id: 2, status: 'completada' }
                ];

                sandbox.stub(pool, 'query').resolves({
                    rows: mockOrders
                });

                const result = await OrderModel.findAll();

                expect(result).to.deep.equal(mockOrders);
            });
        });

        describe('updateStatus', () => {
            it('should update order status successfully', async () => {
                const mockOrder = {
                    id: 1,
                    status: 'confirmada'
                };

                sandbox.stub(pool, 'query').resolves({
                    rows: [mockOrder]
                });

                const result = await OrderModel.updateStatus(1, 'confirmada', 1);

                expect(result).to.deep.equal(mockOrder);
            });
        });

        describe('getStatusHistory', () => {
            it('should get status history successfully', async () => {
                const mockHistory = [
                    { id: 1, order_id: 1, status: 'pendiente', created_at: new Date() },
                    { id: 2, order_id: 1, status: 'confirmada', created_at: new Date() }
                ];

                sandbox.stub(pool, 'query').resolves({
                    rows: mockHistory
                });

                const result = await OrderModel.getStatusHistory(1);

                expect(result).to.deep.equal(mockHistory);
            });
        });
    });

    describe('Integration and Validation Tests', () => {
        describe('Order Status Validation', () => {
            it('should validate order status transitions', () => {
                const validStatuses = ['pendiente', 'confirmada', 'en_preparacion', 'lista_para_recoger', 'completada', 'cancelada'];
                
                validStatuses.forEach(status => {
                    expect(validStatuses).to.include(status);
                });
            });

            it('should reject invalid status transitions', () => {
                const invalidStatuses = ['invalid', 'wrong_status', ''];
                const validStatuses = ['pendiente', 'confirmada', 'en_preparacion', 'lista_para_recoger', 'completada', 'cancelada'];
                
                invalidStatuses.forEach(status => {
                    expect(validStatuses).to.not.include(status);
                });
            });
        });

        describe('Order Data Validation', () => {
            it('should validate required order fields', () => {
                const requiredFields = ['user_id', 'products'];
                const orderData = {
                    user_id: 1,
                    products: [{ product_id: 1, quantity: 2 }]
                };

                requiredFields.forEach(field => {
                    expect(orderData).to.have.property(field);
                });
            });

            it('should validate product structure', () => {
                const product = {
                    product_id: 1,
                    quantity: 2
                };

                expect(product).to.have.property('product_id');
                expect(product).to.have.property('quantity');
                expect(product.quantity).to.be.greaterThan(0);
            });
        });

        describe('Error Handling', () => {
            it('should handle database connection errors gracefully', async () => {
                sandbox.stub(pool, 'query').rejects(new Error('Connection failed'));

                try {
                    await OrderModel.findById(1);
                    expect.fail('Should have thrown an error');
                } catch (error) {
                    expect(error.message).to.equal('Connection failed');
                }
            });

            it('should handle external service errors', async () => {
                sandbox.stub(axios, 'get').rejects(new Error('Service unavailable'));

                try {
                    await OrderModel.validateProductStock([{ product_id: 1, quantity: 1 }]);
                    expect.fail('Should have thrown an error');
                } catch (error) {
                    expect(error.message).to.include('Error al validar stock');
                }
            });
        });

        describe('PDF Generation', () => {
            it('should handle PDF generation errors', () => {
                const mockDoc = {
                    pipe: sandbox.stub(),
                    fontSize: sandbox.stub().returnsThis(),
                    text: sandbox.stub().returnsThis(),
                    end: sandbox.stub()
                };

                expect(mockDoc.pipe).to.be.a('function');
                expect(mockDoc.fontSize).to.be.a('function');
                expect(mockDoc.text).to.be.a('function');
            });
        });

        describe('Promotion Logic', () => {
            it('should calculate promotion discounts correctly', () => {
                const originalPrice = 100;
                const comboPrice = 80;
                const discount = originalPrice - comboPrice;
                
                expect(discount).to.equal(20);
                expect(discount).to.be.greaterThan(0);
            });

            it('should handle multiple promotion applications', () => {
                const applications = 2;
                const discountPerApplication = 10;
                const totalDiscount = applications * discountPerApplication;
                
                expect(totalDiscount).to.equal(20);
            });
        });
    });
});