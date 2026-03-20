import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default class StripeService {
  // Crear Payment Intent para pagos con tarjeta
  static async createPaymentIntent(amount, currency = 'mxn', metadata = {}) {
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Stripe maneja centavos
        currency: currency,
        metadata: metadata,
        automatic_payment_methods: {
          enabled: true,
        },
      });

      return {
        success: true,
        payment_intent: paymentIntent,
        client_secret: paymentIntent.client_secret
      };
    } catch (error) {
      console.error('Error creating payment intent:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Confirmar pago
  static async confirmPayment(paymentIntentId) {
    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      
      return {
        success: true,
        payment_intent: paymentIntent,
        status: paymentIntent.status
      };
    } catch (error) {
      console.error('Error confirming payment:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Cancelar Payment Intent
  static async cancelPayment(paymentIntentId) {
    try {
      const paymentIntent = await stripe.paymentIntents.cancel(paymentIntentId);
      
      return {
        success: true,
        payment_intent: paymentIntent
      };
    } catch (error) {
      console.error('Error canceling payment:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Procesar reembolso
  static async createRefund(chargeId, amount = null) {
    try {
      const refundData = { charge: chargeId };
      if (amount) {
        refundData.amount = Math.round(amount * 100);
      }

      const refund = await stripe.refunds.create(refundData);
      
      return {
        success: true,
        refund: refund
      };
    } catch (error) {
      console.error('Error creating refund:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Verificar webhook signature
  static verifyWebhookSignature(payload, signature) {
    try {
      const event = stripe.webhooks.constructEvent(
        payload,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );
      return { success: true, event };
    } catch (error) {
      console.error('Webhook signature verification failed:', error);
      return { success: false, error: error.message };
    }
  }
}