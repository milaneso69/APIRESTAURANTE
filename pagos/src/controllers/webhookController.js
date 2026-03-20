import StripeService from '../services/stripeService.js';
import SaleModel from '../models/saleModel.js';
import axios from 'axios';

export default class WebhookController {
  /**
   * Manejar webhooks de Stripe
   * Este endpoint recibe eventos de Stripe cuando ocurren cambios en los pagos
   */
  static async handleStripeWebhook(req, res) {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
      // Verificar la firma del webhook
      event = StripeService.verifyWebhookSignature(req.body, sig, endpointSecret);
    } catch (err) {
      console.error('Error verificando webhook:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    try {
      // Manejar diferentes tipos de eventos
      switch (event.type) {
        case 'payment_intent.succeeded':
          await WebhookController.handlePaymentSucceeded(event.data.object);
          break;
        
        case 'payment_intent.payment_failed':
          await WebhookController.handlePaymentFailed(event.data.object);
          break;
        
        case 'payment_intent.canceled':
          await WebhookController.handlePaymentCanceled(event.data.object);
          break;
        
        case 'charge.dispute.created':
          await WebhookController.handleChargeDispute(event.data.object);
          break;
        
        default:
          console.log(`Evento no manejado: ${event.type}`);
      }

      res.json({ received: true });
    } catch (error) {
      console.error('Error procesando webhook:', error);
      res.status(500).json({ error: 'Error procesando webhook' });
    }
  }

  /**
   * Manejar pago exitoso
   */
  static async handlePaymentSucceeded(paymentIntent) {
    try {
      const saleId = paymentIntent.metadata.sale_id;
      const orderId = paymentIntent.metadata.order_id;
      
      if (saleId) {
        // Actualizar estado de la venta
        await SaleModel.updateSaleStatus(saleId, 'Completada');
        
        // Registrar transacción exitosa
        await SaleModel.createPaymentTransaction({
          sale_id: saleId,
          stripe_payment_intent_id: paymentIntent.id,
          amount: paymentIntent.amount / 100, // Stripe maneja centavos
          currency: paymentIntent.currency,
          status: 'succeeded',
          transaction_type: 'payment'
        });
        
        // Actualizar orden a "lista para recoger" si existe
        if (orderId) {
          try {
            await axios.put(
              `${process.env.ORDERS_SERVICE_URL}/api/orders/${orderId}/status`,
              { status: 'lista para recoger' },
              {
                headers: {
                  'Content-Type': 'application/json'
                }
              }
            );
          } catch (orderError) {
            console.error('Error actualizando orden:', orderError.message);
          }
        }
        
        console.log(`Pago exitoso procesado para venta ${saleId}`);
      }
    } catch (error) {
      console.error('Error manejando pago exitoso:', error);
      throw error;
    }
  }

  /**
   * Manejar pago fallido
   */
  static async handlePaymentFailed(paymentIntent) {
    try {
      const saleId = paymentIntent.metadata.sale_id;
      const orderId = paymentIntent.metadata.order_id;
      
      if (saleId) {
        // Actualizar estado de la venta
        await SaleModel.updateSaleStatus(saleId, 'Cancelada');
        
        // Registrar transacción fallida
        await SaleModel.createPaymentTransaction({
          sale_id: saleId,
          stripe_payment_intent_id: paymentIntent.id,
          amount: paymentIntent.amount / 100,
          currency: paymentIntent.currency,
          status: 'failed',
          transaction_type: 'payment',
          failure_reason: paymentIntent.last_payment_error?.message || 'Pago fallido'
        });
        
        // Restaurar stock
        await SaleModel.restoreStockFromSale(saleId);
        
        // Actualizar orden a "cancelada" si existe
        if (orderId) {
          try {
            await axios.put(
              `${process.env.ORDERS_SERVICE_URL}/api/orders/${orderId}/status`,
              { status: 'cancelada' },
              {
                headers: {
                  'Content-Type': 'application/json'
                }
              }
            );
          } catch (orderError) {
            console.error('Error actualizando orden:', orderError.message);
          }
        }
        
        console.log(`Pago fallido procesado para venta ${saleId}`);
      }
    } catch (error) {
      console.error('Error manejando pago fallido:', error);
      throw error;
    }
  }

  /**
   * Manejar pago cancelado
   */
  static async handlePaymentCanceled(paymentIntent) {
    try {
      const saleId = paymentIntent.metadata.sale_id;
      const orderId = paymentIntent.metadata.order_id;
      
      if (saleId) {
        // Actualizar estado de la venta
        await SaleModel.updateSaleStatus(saleId, 'Cancelada');
        
        // Registrar transacción cancelada
        await SaleModel.createPaymentTransaction({
          sale_id: saleId,
          stripe_payment_intent_id: paymentIntent.id,
          amount: paymentIntent.amount / 100,
          currency: paymentIntent.currency,
          status: 'canceled',
          transaction_type: 'payment'
        });
        
        // Restaurar stock
        await SaleModel.restoreStockFromSale(saleId);
        
        // Actualizar orden a "cancelada" si existe
        if (orderId) {
          try {
            await axios.put(
              `${process.env.ORDERS_SERVICE_URL}/api/orders/${orderId}/status`,
              { status: 'cancelada' },
              {
                headers: {
                  'Content-Type': 'application/json'
                }
              }
            );
          } catch (orderError) {
            console.error('Error actualizando orden:', orderError.message);
          }
        }
        
        console.log(`Pago cancelado procesado para venta ${saleId}`);
      }
    } catch (error) {
      console.error('Error manejando pago cancelado:', error);
      throw error;
    }
  }

  /**
   * Manejar disputa de cargo
   */
  static async handleChargeDispute(dispute) {
    try {
      const chargeId = dispute.charge;
      
      // Buscar la venta asociada al cargo
      const sale = await SaleModel.findByStripeChargeId(chargeId);
      
      if (sale) {
        // Registrar la disputa
        await SaleModel.createPaymentTransaction({
          sale_id: sale.id,
          stripe_payment_intent_id: dispute.payment_intent,
          amount: dispute.amount / 100,
          currency: dispute.currency,
          status: 'disputed',
          transaction_type: 'dispute',
          failure_reason: dispute.reason
        });
        
        console.log(`Disputa registrada para venta ${sale.id}`);
      }
    } catch (error) {
      console.error('Error manejando disputa:', error);
      throw error;
    }
  }
}