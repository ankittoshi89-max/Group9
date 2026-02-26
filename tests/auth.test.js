const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const User = require('../src/models/User');

describe('Authentication API Tests', () => {
  
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI);
  });

  afterAll(async () => {
    await User.deleteMany({ email: { $regex: /test.*@hospital\.com/ } });
    await mongoose.connection.close();
  });

  describe('POST /api/auth/register', () => {
    
    test('Should register a new user successfully', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test Doctor',
          email: 'testdoc@hospital.com',
          password: 'password123',
          role: 'doctor'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body).toHaveProperty('token');
      expect(response.body.user.email).toBe('testdoc@hospital.com');
    });

    test('Should reject registration with missing fields', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'incomplete@hospital.com'
        });

      expect(response.status).toBe(400);
    });

    test('Should reject duplicate email registration', async () => {
      await request(app)
        .post('/api/auth/register')
        .send({
          name: 'First User',
          email: 'duplicate@hospital.com',
          password: 'password123',
          role: 'nurse'
        });

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Second User',
          email: 'duplicate@hospital.com',
          password: 'password456',
          role: 'doctor'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('exists');
    });
  });

  describe('POST /api/auth/login', () => {
    
    beforeAll(async () => {
      await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Login Test User',
          email: 'logintest@hospital.com',
          password: 'password123',
          role: 'doctor'
        });
    });

    test('Should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'logintest@hospital.com',
          password: 'password123'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body).toHaveProperty('token');
    });

    test('Should reject login with wrong password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'logintest@hospital.com',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
    });

    test('Should reject login with non-existent email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'notexist@hospital.com',
          password: 'password123'
        });

      expect(response.status).toBe(401);
    });
  });
});