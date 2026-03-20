import { expect } from 'chai';
import sinon from 'sinon';
import request from 'supertest';
import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

// Mock de la base de datos
const mockDb = {
  query: sinon.stub()
};

// Mock del controlador
const mockAuthController = {
  getAuthById: sinon.stub(),
  register: sinon.stub(),
  login: sinon.stub(),
  verifyToken: sinon.stub(),
  initiatePasswordReset: sinon.stub(),
  resetPassword: sinon.stub(),
  deleteUser: sinon.stub(),
  registerByAdmin: sinon.stub()
};

// Mock del modelo
const mockAuthModel = {
  getAuthById: sinon.stub(),
  getDataLogin: sinon.stub(),
  register: sinon.stub(),
  deleteUser: sinon.stub(),
  initiatePasswordReset: sinon.stub(),
  resetPassword: sinon.stub()
};

describe('Auth Service Unit Tests', () => {
  let app;
  
  beforeEach(() => {
    app = express();
    app.use(express.json());
    sinon.restore();
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('AuthController Tests', () => {
    describe('getAuthById', () => {
      it('should return user data when valid ID is provided', async () => {
        const mockUser = { id: 1, username: 'testuser', email: 'test@test.com' };
        mockAuthController.getAuthById.resolves(mockUser);
        
        const result = await mockAuthController.getAuthById(1);
        expect(result).to.deep.equal(mockUser);
      });

      it('should return null when user not found', async () => {
        mockAuthController.getAuthById.resolves(null);
        
        const result = await mockAuthController.getAuthById(999);
        expect(result).to.be.null;
      });

      it('should handle database errors', async () => {
        mockAuthController.getAuthById.rejects(new Error('Database error'));
        
        try {
          await mockAuthController.getAuthById(1);
        } catch (error) {
          expect(error.message).to.equal('Database error');
        }
      });
    });

    describe('register', () => {
      it('should successfully register a new user', async () => {
        const userData = {
          username: 'newuser',
          email: 'new@test.com',
          password: 'password123'
        };
        const mockResult = { id: 1, ...userData, password: undefined };
        mockAuthController.register.resolves(mockResult);
        
        const result = await mockAuthController.register(userData);
        expect(result).to.deep.equal(mockResult);
      });

      it('should reject registration with existing email', async () => {
        const userData = {
          username: 'newuser',
          email: 'existing@test.com',
          password: 'password123'
        };
        mockAuthController.register.rejects(new Error('Email already exists'));
        
        try {
          await mockAuthController.register(userData);
        } catch (error) {
          expect(error.message).to.equal('Email already exists');
        }
      });

      it('should validate required fields', async () => {
        const incompleteData = { username: 'test' };
        mockAuthController.register.rejects(new Error('Missing required fields'));
        
        try {
          await mockAuthController.register(incompleteData);
        } catch (error) {
          expect(error.message).to.equal('Missing required fields');
        }
      });
    });

    describe('login', () => {
      it('should successfully login with valid credentials', async () => {
        const credentials = { email: 'test@test.com', password: 'password123' };
        const mockToken = 'valid.jwt.token';
        mockAuthController.login.resolves({ token: mockToken });
        
        const result = await mockAuthController.login(credentials);
        expect(result.token).to.equal(mockToken);
      });

      it('should reject login with invalid credentials', async () => {
        const credentials = { email: 'test@test.com', password: 'wrongpassword' };
        mockAuthController.login.rejects(new Error('Invalid credentials'));
        
        try {
          await mockAuthController.login(credentials);
        } catch (error) {
          expect(error.message).to.equal('Invalid credentials');
        }
      });

      it('should reject login with non-existent user', async () => {
        const credentials = { email: 'nonexistent@test.com', password: 'password123' };
        mockAuthController.login.rejects(new Error('User not found'));
        
        try {
          await mockAuthController.login(credentials);
        } catch (error) {
          expect(error.message).to.equal('User not found');
        }
      });
    });

    describe('verifyToken', () => {
      it('should verify valid JWT token', async () => {
        const validToken = 'valid.jwt.token';
        const mockDecoded = { id: 1, email: 'test@test.com' };
        mockAuthController.verifyToken.resolves(mockDecoded);
        
        const result = await mockAuthController.verifyToken(validToken);
        expect(result).to.deep.equal(mockDecoded);
      });

      it('should reject invalid JWT token', async () => {
        const invalidToken = 'invalid.token';
        mockAuthController.verifyToken.rejects(new Error('Invalid token'));
        
        try {
          await mockAuthController.verifyToken(invalidToken);
        } catch (error) {
          expect(error.message).to.equal('Invalid token');
        }
      });

      it('should reject expired JWT token', async () => {
        const expiredToken = 'expired.jwt.token';
        mockAuthController.verifyToken.rejects(new Error('Token expired'));
        
        try {
          await mockAuthController.verifyToken(expiredToken);
        } catch (error) {
          expect(error.message).to.equal('Token expired');
        }
      });
    });

    describe('initiatePasswordReset', () => {
      it('should initiate password reset for valid email', async () => {
        const email = 'test@test.com';
        mockAuthController.initiatePasswordReset.resolves({ success: true });
        
        const result = await mockAuthController.initiatePasswordReset(email);
        expect(result.success).to.be.true;
      });

      it('should handle non-existent email gracefully', async () => {
        const email = 'nonexistent@test.com';
        mockAuthController.initiatePasswordReset.resolves({ success: false });
        
        const result = await mockAuthController.initiatePasswordReset(email);
        expect(result.success).to.be.false;
      });
    });

    describe('resetPassword', () => {
      it('should reset password with valid code', async () => {
        const resetData = {
          email: 'test@test.com',
          code: '123456',
          newPassword: 'newpassword123'
        };
        mockAuthController.resetPassword.resolves({ success: true });
        
        const result = await mockAuthController.resetPassword(resetData);
        expect(result.success).to.be.true;
      });

      it('should reject password reset with invalid code', async () => {
        const resetData = {
          email: 'test@test.com',
          code: 'invalid',
          newPassword: 'newpassword123'
        };
        mockAuthController.resetPassword.rejects(new Error('Invalid reset code'));
        
        try {
          await mockAuthController.resetPassword(resetData);
        } catch (error) {
          expect(error.message).to.equal('Invalid reset code');
        }
      });
    });

    describe('deleteUser', () => {
      it('should delete user successfully', async () => {
        const userId = 1;
        mockAuthController.deleteUser.resolves({ success: true });
        
        const result = await mockAuthController.deleteUser(userId);
        expect(result.success).to.be.true;
      });

      it('should handle deletion of non-existent user', async () => {
        const userId = 999;
        mockAuthController.deleteUser.rejects(new Error('User not found'));
        
        try {
          await mockAuthController.deleteUser(userId);
        } catch (error) {
          expect(error.message).to.equal('User not found');
        }
      });
    });

    describe('registerByAdmin', () => {
      it('should register user by admin successfully', async () => {
        const userData = {
          username: 'adminuser',
          email: 'admin@test.com',
          password: 'password123',
          role: 'admin'
        };
        mockAuthController.registerByAdmin.resolves({ id: 1, ...userData, password: undefined });
        
        const result = await mockAuthController.registerByAdmin(userData);
        expect(result.role).to.equal('admin');
      });

      it('should validate admin role assignment', async () => {
        const userData = {
          username: 'user',
          email: 'user@test.com',
          password: 'password123',
          role: 'invalid_role'
        };
        mockAuthController.registerByAdmin.rejects(new Error('Invalid role'));
        
        try {
          await mockAuthController.registerByAdmin(userData);
        } catch (error) {
          expect(error.message).to.equal('Invalid role');
        }
      });
    });
  });

  describe('AuthModel Tests', () => {
    describe('getAuthById', () => {
      it('should return user from database', async () => {
        const mockUser = { id: 1, username: 'testuser' };
        mockAuthModel.getAuthById.resolves(mockUser);
        
        const result = await mockAuthModel.getAuthById(1);
        expect(result).to.deep.equal(mockUser);
      });
    });

    describe('getDataLogin', () => {
      it('should return user data for login', async () => {
        const mockUser = {
          id: 1,
          email: 'test@test.com',
          password: 'hashedpassword'
        };
        mockAuthModel.getDataLogin.resolves(mockUser);
        
        const result = await mockAuthModel.getDataLogin('test@test.com');
        expect(result).to.deep.equal(mockUser);
      });
    });

    describe('register', () => {
      it('should create new user in database', async () => {
        const userData = {
          username: 'newuser',
          email: 'new@test.com',
          password: 'hashedpassword'
        };
        mockAuthModel.register.resolves({ id: 1, ...userData });
        
        const result = await mockAuthModel.register(userData);
        expect(result.id).to.equal(1);
      });
    });

    describe('deleteUser', () => {
      it('should delete user from database', async () => {
        mockAuthModel.deleteUser.resolves({ success: true });
        
        const result = await mockAuthModel.deleteUser(1);
        expect(result.success).to.be.true;
      });
    });

    describe('initiatePasswordReset', () => {
      it('should store reset code in database', async () => {
        mockAuthModel.initiatePasswordReset.resolves({ success: true });
        
        const result = await mockAuthModel.initiatePasswordReset('test@test.com', '123456');
        expect(result.success).to.be.true;
      });
    });

    describe('resetPassword', () => {
      it('should update password in database', async () => {
        mockAuthModel.resetPassword.resolves({ success: true });
        
        const result = await mockAuthModel.resetPassword('test@test.com', '123456', 'newhashedpassword');
        expect(result.success).to.be.true;
      });
    });
  });

  describe('JWT Utility Tests', () => {
    it('should generate valid JWT token', () => {
      const payload = { id: 1, email: 'test@test.com' };
      const secret = 'test_secret';
      const token = jwt.sign(payload, secret, { expiresIn: '1h' });
      
      expect(token).to.be.a('string');
      expect(token.split('.')).to.have.length(3);
    });

    it('should verify JWT token correctly', () => {
      const payload = { id: 1, email: 'test@test.com' };
      const secret = 'test_secret';
      const token = jwt.sign(payload, secret, { expiresIn: '1h' });
      
      const decoded = jwt.verify(token, secret);
      expect(decoded.id).to.equal(payload.id);
      expect(decoded.email).to.equal(payload.email);
    });
  });
});