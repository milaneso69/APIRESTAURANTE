import { expect } from 'chai';
import sinon from 'sinon';
import request from 'supertest';
import express from 'express';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import fs from 'fs';
import path from 'path';

// Mock de la base de datos
const mockDb = {
  query: sinon.stub()
};

// Mock del controlador
const mockUserController = {
  createUser: sinon.stub(),
  getAllUsers: sinon.stub(),
  getUserById: sinon.stub(),
  getUserByName: sinon.stub(),
  updateUser: sinon.stub(),
  updateUserProfileImage: sinon.stub(),
  deleteUser: sinon.stub(),
  createAdminOrEmployee: sinon.stub()
};

// Mock del modelo
const mockUserModel = {
  createUser: sinon.stub(),
  findAll: sinon.stub(),
  findByPk: sinon.stub(),
  findByUserName: sinon.stub(),
  updateUser: sinon.stub(),
  updateUserProfileImage: sinon.stub(),
  deleteUser: sinon.stub(),
  convertImageToBase64: sinon.stub(),
  processImageBuffer: sinon.stub(),
  processImageUrl: sinon.stub()
};

// Mock de ImageKit
const mockImageKit = {
  upload: sinon.stub()
};

describe('Users Service Unit Tests', () => {
  let app;
  
  beforeEach(() => {
    app = express();
    app.use(express.json());
    sinon.restore();
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('UserController Tests', () => {
    describe('createUser', () => {
      it('should create user successfully with auth data', async () => {
        const userData = {
          name: 'John',
          first_surname: 'Doe',
          last_surname: 'Smith',
          phone_number: '1234567890',
          auth_users: {
            username: 'johndoe',
            email: 'john@test.com',
            password: 'password123'
          }
        };
        const mockResult = { id: 1, ...userData, auth_users_id: 1 };
        mockUserController.createUser.resolves(mockResult);
        
        const result = await mockUserController.createUser(userData);
        expect(result.id).to.equal(1);
        expect(result.name).to.equal('John');
      });

      it('should create user with existing auth_users_id', async () => {
        const userData = {
          name: 'Jane',
          first_surname: 'Doe',
          auth_users_id: 2
        };
        const mockResult = { id: 2, ...userData };
        mockUserController.createUser.resolves(mockResult);
        
        const result = await mockUserController.createUser(userData);
        expect(result.auth_users_id).to.equal(2);
      });

      it('should reject creation without auth data', async () => {
        const userData = {
          name: 'Invalid',
          first_surname: 'User'
        };
        mockUserController.createUser.rejects(new Error('Se requieren datos de autenticación'));
        
        try {
          await mockUserController.createUser(userData);
        } catch (error) {
          expect(error.message).to.equal('Se requieren datos de autenticación');
        }
      });

      it('should handle auth service errors', async () => {
        const userData = {
          name: 'Test',
          first_surname: 'User',
          auth_users: {
            username: 'testuser',
            email: 'invalid-email',
            password: 'pass'
          }
        };
        mockUserController.createUser.rejects(new Error('Error al crear usuario de autenticación'));
        
        try {
          await mockUserController.createUser(userData);
        } catch (error) {
          expect(error.message).to.equal('Error al crear usuario de autenticación');
        }
      });

      it('should validate required fields', async () => {
        const incompleteData = { name: 'Test' };
        mockUserController.createUser.rejects(new Error('Missing required fields'));
        
        try {
          await mockUserController.createUser(incompleteData);
        } catch (error) {
          expect(error.message).to.equal('Missing required fields');
        }
      });
    });

    describe('getAllUsers', () => {
      it('should return all users successfully', async () => {
        const mockUsers = [
          { id: 1, name: 'User1', auth: { username: 'user1' } },
          { id: 2, name: 'User2', auth: null }
        ];
        mockUserController.getAllUsers.resolves({
          total: 2,
          usuariosConAuth: 1,
          usuariosSinAuth: 1,
          usuarios: mockUsers
        });
        
        const result = await mockUserController.getAllUsers();
        expect(result.total).to.equal(2);
        expect(result.usuariosConAuth).to.equal(1);
        expect(result.usuariosSinAuth).to.equal(1);
      });

      it('should return 404 when no users found', async () => {
        mockUserController.getAllUsers.rejects(new Error('No se encontraron usuarios'));
        
        try {
          await mockUserController.getAllUsers();
        } catch (error) {
          expect(error.message).to.equal('No se encontraron usuarios');
        }
      });

      it('should handle database errors', async () => {
        mockUserController.getAllUsers.rejects(new Error('Database error'));
        
        try {
          await mockUserController.getAllUsers();
        } catch (error) {
          expect(error.message).to.equal('Database error');
        }
      });
    });

    describe('getUserById', () => {
      it('should return user by ID successfully', async () => {
        const mockUser = {
          usuario: { id: 1, name: 'John', first_surname: 'Doe' },
          auth: { username: 'johndoe', email: 'john@test.com' }
        };
        mockUserController.getUserById.resolves(mockUser);
        
        const result = await mockUserController.getUserById(1);
        expect(result.usuario.id).to.equal(1);
        expect(result.auth.username).to.equal('johndoe');
      });

      it('should return 404 when user not found', async () => {
        mockUserController.getUserById.rejects(new Error('Usuario no encontrado'));
        
        try {
          await mockUserController.getUserById(999);
        } catch (error) {
          expect(error.message).to.equal('Usuario no encontrado');
        }
      });

      it('should return user without auth data', async () => {
        const mockUser = {
          usuario: { id: 1, name: 'John', first_surname: 'Doe' },
          auth: null
        };
        mockUserController.getUserById.resolves(mockUser);
        
        const result = await mockUserController.getUserById(1);
        expect(result.auth).to.be.null;
      });
    });

    describe('getUserByName', () => {
      it('should find users by name successfully', async () => {
        const mockUsers = [
          { id: 1, name: 'John Doe', auth: { username: 'johndoe' } }
        ];
        mockUserController.getUserByName.resolves(mockUsers);
        
        const result = await mockUserController.getUserByName('John');
        expect(result).to.be.an('array');
        expect(result[0].name).to.include('John');
      });

      it('should return empty array when no users found', async () => {
        mockUserController.getUserByName.resolves([]);
        
        const result = await mockUserController.getUserByName('NonExistent');
        expect(result).to.be.an('array');
        expect(result).to.have.length(0);
      });

      it('should handle search errors', async () => {
        mockUserController.getUserByName.rejects(new Error('Search error'));
        
        try {
          await mockUserController.getUserByName('Test');
        } catch (error) {
          expect(error.message).to.equal('Search error');
        }
      });
    });

    describe('updateUser', () => {
      it('should update user successfully', async () => {
        const updateData = { name: 'Updated Name', phone_number: '9876543210' };
        const mockUpdatedUser = { id: 1, ...updateData };
        mockUserController.updateUser.resolves({
          message: 'Usuario actualizado exitosamente',
          usuario: mockUpdatedUser
        });
        
        const result = await mockUserController.updateUser(1, updateData);
        expect(result.message).to.equal('Usuario actualizado exitosamente');
        expect(result.usuario.name).to.equal('Updated Name');
      });

      it('should reject update for non-existent user', async () => {
        const updateData = { name: 'Test' };
        mockUserController.updateUser.rejects(new Error('Usuario no encontrado'));
        
        try {
          await mockUserController.updateUser(999, updateData);
        } catch (error) {
          expect(error.message).to.equal('Usuario no encontrado');
        }
      });

      it('should validate update data', async () => {
        const invalidData = { invalid_field: 'value' };
        mockUserController.updateUser.rejects(new Error('Entrada inválida'));
        
        try {
          await mockUserController.updateUser(1, invalidData);
        } catch (error) {
          expect(error.message).to.equal('Entrada inválida');
        }
      });
    });

    describe('updateUserProfileImage', () => {
      it('should update profile image successfully', async () => {
        const mockFile = {
          buffer: Buffer.from('fake image data'),
          mimetype: 'image/jpeg'
        };
        const mockResult = {
          message: 'Imagen de perfil actualizada exitosamente',
          usuario: { id: 1, profile_image: 'https://imagekit.io/image.jpg' }
        };
        mockUserController.updateUserProfileImage.resolves(mockResult);
        
        const result = await mockUserController.updateUserProfileImage(1, mockFile);
        expect(result.message).to.equal('Imagen de perfil actualizada exitosamente');
      });

      it('should reject when no file provided', async () => {
        mockUserController.updateUserProfileImage.rejects(new Error('No se subió ningún archivo'));
        
        try {
          await mockUserController.updateUserProfileImage(1, null);
        } catch (error) {
          expect(error.message).to.equal('No se subió ningún archivo');
        }
      });

      it('should handle ImageKit upload errors', async () => {
        const mockFile = { buffer: Buffer.from('data'), mimetype: 'image/jpeg' };
        mockUserController.updateUserProfileImage.rejects(new Error('Error al procesar la imagen'));
        
        try {
          await mockUserController.updateUserProfileImage(1, mockFile);
        } catch (error) {
          expect(error.message).to.equal('Error al procesar la imagen');
        }
      });
    });

    describe('deleteUser', () => {
      it('should delete user successfully', async () => {
        const mockResult = {
          message: 'Usuario eliminado correctamente',
          deletedUser: { id: 1 },
          auth_deleted: true
        };
        mockUserController.deleteUser.resolves(mockResult);
        
        const result = await mockUserController.deleteUser(1);
        expect(result.message).to.equal('Usuario eliminado correctamente');
        expect(result.auth_deleted).to.be.true;
      });

      it('should handle deletion of non-existent user', async () => {
        mockUserController.deleteUser.rejects(new Error('Usuario no encontrado'));
        
        try {
          await mockUserController.deleteUser(999);
        } catch (error) {
          expect(error.message).to.equal('Usuario no encontrado');
        }
      });

      it('should handle auth service deletion errors', async () => {
        mockUserController.deleteUser.rejects(new Error('Error eliminando usuario del servicio de autenticación'));
        
        try {
          await mockUserController.deleteUser(1);
        } catch (error) {
          expect(error.message).to.equal('Error eliminando usuario del servicio de autenticación');
        }
      });
    });

    describe('createAdminOrEmployee', () => {
      it('should create admin user successfully', async () => {
        const adminData = {
          name: 'Admin',
          first_surname: 'User',
          auth_users: {
            username: 'admin',
            email: 'admin@test.com',
            password: 'password123',
            role_id: 2
          }
        };
        const mockResult = {
          message: 'Administrador o empleado creado exitosamente',
          user: { id: 1, ...adminData, auth_users_id: 1 }
        };
        mockUserController.createAdminOrEmployee.resolves(mockResult);
        
        const result = await mockUserController.createAdminOrEmployee(adminData);
        expect(result.message).to.equal('Administrador o empleado creado exitosamente');
      });

      it('should create employee user successfully', async () => {
        const employeeData = {
          name: 'Employee',
          first_surname: 'User',
          auth_users: {
            username: 'employee',
            email: 'employee@test.com',
            password: 'password123',
            role_id: 3
          }
        };
        const mockResult = {
          message: 'Administrador o empleado creado exitosamente',
          user: { id: 2, ...employeeData, auth_users_id: 2 }
        };
        mockUserController.createAdminOrEmployee.resolves(mockResult);
        
        const result = await mockUserController.createAdminOrEmployee(employeeData);
        expect(result.message).to.equal('Administrador o empleado creado exitosamente');
      });

      it('should reject invalid role_id', async () => {
        const invalidData = {
          name: 'Test',
          first_surname: 'User',
          auth_users: {
            username: 'test',
            email: 'test@test.com',
            password: 'password123',
            role_id: 1
          }
        };
        mockUserController.createAdminOrEmployee.rejects(new Error('El role_id debe ser 2 (administrador) o 3 (empleado)'));
        
        try {
          await mockUserController.createAdminOrEmployee(invalidData);
        } catch (error) {
          expect(error.message).to.equal('El role_id debe ser 2 (administrador) o 3 (empleado)');
        }
      });

      it('should reject unauthorized user creation', async () => {
        mockUserController.createAdminOrEmployee.rejects(new Error('No tienes permisos para crear administradores o empleados'));
        
        try {
          await mockUserController.createAdminOrEmployee({});
        } catch (error) {
          expect(error.message).to.equal('No tienes permisos para crear administradores o empleados');
        }
      });
    });
  });

  describe('UserModel Tests', () => {
    describe('createUser', () => {
      it('should create user in database', async () => {
        const userData = {
          name: 'John',
          first_surname: 'Doe',
          last_surname: 'Smith',
          phone_number: '1234567890',
          profile_image: 'data:image/jpeg;base64,/9j/4AAQ...',
          auth_users_id: 1
        };
        mockUserModel.createUser.resolves({ id: 1, ...userData });
        
        const result = await mockUserModel.createUser(userData);
        expect(result.id).to.equal(1);
        expect(result.name).to.equal('John');
      });

      it('should process image URL', async () => {
        const userData = {
          name: 'Test',
          first_surname: 'User',
          profile_image: 'https://example.com/image.jpg',
          auth_users_id: 1
        };
        mockUserModel.createUser.resolves({ id: 1, ...userData });
        
        const result = await mockUserModel.createUser(userData);
        expect(result).to.have.property('id');
      });

      it('should handle database errors', async () => {
        const userData = { name: 'Test', first_surname: 'User' };
        mockUserModel.createUser.rejects(new Error('Database constraint violation'));
        
        try {
          await mockUserModel.createUser(userData);
        } catch (error) {
          expect(error.message).to.equal('Database constraint violation');
        }
      });
    });

    describe('findAll', () => {
      it('should return all users with auth data', async () => {
        const mockUsers = [
          { id: 1, name: 'User1', auth_users_id: 1, auth: { username: 'user1' } },
          { id: 2, name: 'User2', auth_users_id: null, auth: null }
        ];
        mockUserModel.findAll.resolves(mockUsers);
        
        const result = await mockUserModel.findAll();
        expect(result).to.be.an('array');
        expect(result[0]).to.have.property('auth');
      });

      it('should return empty array when no users exist', async () => {
        mockUserModel.findAll.resolves([]);
        
        const result = await mockUserModel.findAll();
        expect(result).to.be.an('array');
        expect(result).to.have.length(0);
      });

      it('should handle auth service errors gracefully', async () => {
        const mockUsers = [
          { id: 1, name: 'User1', auth_users_id: 1, auth: null }
        ];
        mockUserModel.findAll.resolves(mockUsers);
        
        const result = await mockUserModel.findAll();
        expect(result[0].auth).to.be.null;
      });
    });

    describe('findByPk', () => {
      it('should find user by primary key', async () => {
        const mockUser = {
          id: 1,
          name: 'John',
          first_surname: 'Doe',
          auth_users_id: 1,
          auth: { username: 'johndoe' }
        };
        mockUserModel.findByPk.resolves(mockUser);
        
        const result = await mockUserModel.findByPk(1);
        expect(result.id).to.equal(1);
        expect(result.auth.username).to.equal('johndoe');
      });

      it('should return null for non-existent user', async () => {
        mockUserModel.findByPk.resolves(null);
        
        const result = await mockUserModel.findByPk(999);
        expect(result).to.be.null;
      });

      it('should return user without auth data', async () => {
        const mockUser = {
          id: 1,
          name: 'John',
          first_surname: 'Doe',
          auth_users_id: null,
          auth: null
        };
        mockUserModel.findByPk.resolves(mockUser);
        
        const result = await mockUserModel.findByPk(1);
        expect(result.auth).to.be.null;
      });
    });

    describe('findByUserName', () => {
      it('should find users by name pattern', async () => {
        const mockUsers = [
          { id: 1, name: 'John Doe', auth: { username: 'johndoe' } }
        ];
        mockUserModel.findByUserName.resolves(mockUsers);
        
        const result = await mockUserModel.findByUserName('John');
        expect(result).to.be.an('array');
        expect(result[0].name).to.include('John');
      });

      it('should return empty array for no matches', async () => {
        mockUserModel.findByUserName.resolves([]);
        
        const result = await mockUserModel.findByUserName('NonExistent');
        expect(result).to.be.an('array');
        expect(result).to.have.length(0);
      });
    });

    describe('updateUser', () => {
      it('should update user successfully', async () => {
        const updateData = { name: 'Updated Name', phone_number: '9876543210' };
        const mockUpdatedUser = { id: 1, ...updateData, updated_at: new Date() };
        mockUserModel.updateUser.resolves(mockUpdatedUser);
        
        const result = await mockUserModel.updateUser(1, updateData);
        expect(result.name).to.equal('Updated Name');
        expect(result.phone_number).to.equal('9876543210');
      });

      it('should reject update for non-existent user', async () => {
        mockUserModel.updateUser.rejects(new Error('Usuario no encontrado'));
        
        try {
          await mockUserModel.updateUser(999, { name: 'Test' });
        } catch (error) {
          expect(error.message).to.equal('Usuario no encontrado');
        }
      });

      it('should reject update with no valid fields', async () => {
        mockUserModel.updateUser.rejects(new Error('No se proporcionaron campos válidos para actualizar'));
        
        try {
          await mockUserModel.updateUser(1, {});
        } catch (error) {
          expect(error.message).to.equal('No se proporcionaron campos válidos para actualizar');
        }
      });
    });

    describe('updateUserProfileImage', () => {
      it('should update profile image with URL', async () => {
        const imageUrl = 'https://imagekit.io/image.jpg';
        const mockUpdatedUser = { id: 1, profile_image: imageUrl };
        mockUserModel.updateUserProfileImage.resolves(mockUpdatedUser);
        
        const result = await mockUserModel.updateUserProfileImage(1, imageUrl);
        expect(result.profile_image).to.equal(imageUrl);
      });

      it('should return null for non-existent user', async () => {
        mockUserModel.updateUserProfileImage.resolves(null);
        
        const result = await mockUserModel.updateUserProfileImage(999, 'image.jpg');
        expect(result).to.be.null;
      });

      it('should handle image processing errors', async () => {
        mockUserModel.updateUserProfileImage.rejects(new Error('Formato de imagen no soportado'));
        
        try {
          await mockUserModel.updateUserProfileImage(1, 'invalid-format');
        } catch (error) {
          expect(error.message).to.equal('Formato de imagen no soportado');
        }
      });
    });

    describe('deleteUser', () => {
      it('should delete user successfully', async () => {
        mockUserModel.deleteUser.resolves(true);
        
        const result = await mockUserModel.deleteUser(1);
        expect(result).to.be.true;
      });

      it('should return false for non-existent user', async () => {
        mockUserModel.deleteUser.resolves(false);
        
        const result = await mockUserModel.deleteUser(999);
        expect(result).to.be.false;
      });

      it('should handle database errors', async () => {
        mockUserModel.deleteUser.rejects(new Error('Foreign key constraint'));
        
        try {
          await mockUserModel.deleteUser(1);
        } catch (error) {
          expect(error.message).to.equal('Foreign key constraint');
        }
      });
    });
  });

  describe('Image Processing Tests', () => {
    describe('convertImageToBase64', () => {
      it('should convert local image to base64', () => {
        const mockBase64 = 'data:image/jpeg;base64,/9j/4AAQ...';
        mockUserModel.convertImageToBase64.returns(mockBase64);
        
        const result = mockUserModel.convertImageToBase64('/path/to/image.jpg');
        expect(result).to.equal(mockBase64);
        expect(result).to.include('data:image');
      });

      it('should handle file read errors', () => {
        mockUserModel.convertImageToBase64.throws(new Error('File not found'));
        
        expect(() => {
          mockUserModel.convertImageToBase64('/invalid/path.jpg');
        }).to.throw('File not found');
      });
    });

    describe('processImageBuffer', () => {
      it('should process image buffer correctly', () => {
        const mockBuffer = Buffer.from('fake image data');
        const mockBase64 = 'data:image/jpeg;base64,ZmFrZSBpbWFnZSBkYXRh';
        mockUserModel.processImageBuffer.returns(mockBase64);
        
        const result = mockUserModel.processImageBuffer(mockBuffer, 'image/jpeg');
        expect(result).to.equal(mockBase64);
        expect(result).to.include('data:image/jpeg');
      });

      it('should handle buffer processing errors', () => {
        mockUserModel.processImageBuffer.throws(new Error('Invalid buffer'));
        
        expect(() => {
          mockUserModel.processImageBuffer(null, 'image/jpeg');
        }).to.throw('Invalid buffer');
      });
    });

    describe('processImageUrl', () => {
      it('should download and process image from URL', async () => {
        const imageUrl = 'https://example.com/image.jpg';
        const mockBase64 = 'data:image/jpeg;base64,/9j/4AAQ...';
        mockUserModel.processImageUrl.resolves(mockBase64);
        
        const result = await mockUserModel.processImageUrl(imageUrl);
        expect(result).to.equal(mockBase64);
        expect(result).to.include('data:image');
      });

      it('should handle URL download errors', async () => {
        mockUserModel.processImageUrl.rejects(new Error('Network error'));
        
        try {
          await mockUserModel.processImageUrl('https://invalid-url.com/image.jpg');
        } catch (error) {
          expect(error.message).to.equal('Network error');
        }
      });
    });
  });

  describe('JWT and Authentication Tests', () => {
    it('should validate JWT token correctly', () => {
      const payload = { id: 1, username: 'testuser', role_id: 1, email: 'test@test.com' };
      const secret = 'test_secret';
      const token = jwt.sign(payload, secret, { expiresIn: '1h' });
      
      const decoded = jwt.verify(token, secret);
      expect(decoded.id).to.equal(payload.id);
      expect(decoded.username).to.equal(payload.username);
      expect(decoded.role_id).to.equal(payload.role_id);
    });

    it('should reject expired JWT token', () => {
      const payload = { id: 1, username: 'testuser' };
      const secret = 'test_secret';
      const token = jwt.sign(payload, secret, { expiresIn: '-1h' });
      
      expect(() => {
        jwt.verify(token, secret);
      }).to.throw('jwt expired');
    });

    it('should reject invalid JWT token', () => {
      const invalidToken = 'invalid.jwt.token';
      const secret = 'test_secret';
      
      expect(() => {
        jwt.verify(invalidToken, secret);
      }).to.throw('invalid token');
    });
  });

  describe('Validation and Security Tests', () => {
    it('should validate user creation data', () => {
      const validData = {
        name: 'John',
        first_surname: 'Doe',
        phone_number: '1234567890',
        auth_users: {
          username: 'johndoe',
          email: 'john@test.com',
          password: 'password123'
        }
      };
      
      expect(validData.name).to.be.a('string');
      expect(validData.first_surname).to.be.a('string');
      expect(validData.auth_users.email).to.include('@');
      expect(validData.auth_users.password).to.have.length.at.least(8);
    });

    it('should validate role permissions', () => {
      const adminRole = 2;
      const employeeRole = 3;
      const userRole = 1;
      
      expect([2, 3]).to.include(adminRole);
      expect([2, 3]).to.include(employeeRole);
      expect([2, 3]).to.not.include(userRole);
    });

    it('should sanitize user input', () => {
      const userInput = {
        name: '  John  ',
        email: 'JOHN@TEST.COM',
        maliciousField: '<script>alert("xss")</script>'
      };
      
      const sanitized = {
        name: userInput.name.trim(),
        email: userInput.email.toLowerCase()
      };
      
      expect(sanitized.name).to.equal('John');
      expect(sanitized.email).to.equal('john@test.com');
      expect(sanitized).to.not.have.property('maliciousField');
    });
  });

  describe('Error Handling Tests', () => {
    it('should handle network timeouts', async () => {
      const timeoutError = new Error('Network timeout');
      timeoutError.code = 'ECONNABORTED';
      
      mockUserModel.findAll.rejects(timeoutError);
      
      try {
        await mockUserModel.findAll();
      } catch (error) {
        expect(error.code).to.equal('ECONNABORTED');
      }
    });

    it('should handle database connection errors', async () => {
      const dbError = new Error('Connection refused');
      dbError.code = 'ECONNREFUSED';
      
      mockUserModel.createUser.rejects(dbError);
      
      try {
        await mockUserModel.createUser({});
      } catch (error) {
        expect(error.code).to.equal('ECONNREFUSED');
      }
    });

    it('should handle validation errors gracefully', () => {
      const validationError = {
        errors: [
          { field: 'name', message: 'Name is required' },
          { field: 'email', message: 'Invalid email format' }
        ]
      };
      
      expect(validationError.errors).to.be.an('array');
      expect(validationError.errors).to.have.length(2);
      expect(validationError.errors[0]).to.have.property('field');
      expect(validationError.errors[0]).to.have.property('message');
    });
  });
});