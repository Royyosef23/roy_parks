import request from 'supertest';
import express from 'express';
import authRoutes from '../routes/auth';
import { errorHandler } from '../middleware/errorHandler';
import { testPrisma } from './setup';

const app = express();
app.use(express.json());
app.use('/api/v1/auth', authRoutes);
// הוסף error handler אחרי כל הroutes
app.use(errorHandler);

describe('Auth API Tests', () => {
  describe('POST /api/v1/auth/register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'Test123456',
        firstName: 'Test',
        lastName: 'User',
        phone: '0541234567',
        role: 'RESIDENT',
        buildingCode: 'PADOVA32'
      };

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data.user.email).toBe(userData.email);
      expect(response.body.data.user).not.toHaveProperty('password');
    });

    it('should not register user with invalid email', async () => {
      const userData = {
        email: 'invalid-email',
        password: 'Test123456',
        firstName: 'Test',
        lastName: 'User',
        phone: '0541234567',
        role: 'RESIDENT',
        buildingCode: 'PADOVA32'
      };

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should not register user with weak password', async () => {
      const userData = {
        email: 'test2@example.com',
        password: '123',
        firstName: 'Test',
        lastName: 'User',
        phone: '0541234567',
        role: 'RESIDENT',
        buildingCode: 'PADOVA32'
      };

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/v1/auth/login', () => {
    beforeEach(async () => {
      // צור משתמש לפני המבחן
      await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'login-test@example.com',
          password: 'Test123456',
          firstName: 'Login',
          lastName: 'Test',
          phone: '0541234567',
          role: 'RESIDENT',
          buildingCode: 'PADOVA32'
        });
    });

    it('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'login-test@example.com',
          password: 'Test123456'
        })
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data.user.email).toBe('login-test@example.com');
    });

    it('should not login with invalid credentials', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'login-test@example.com',
          password: 'WrongPassword'
        })
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });

    it('should not login with non-existent user', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'Test123456'
        })
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });
  });

  afterEach(async () => {
    // ניקוי אחרי כל מבחן
    await testPrisma.user.deleteMany({
      where: {
        email: {
          contains: 'test'
        }
      }
    });
  });
});
