const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const User = require('../src/models/User');
const Patient = require('../src/models/Patient');

describe('Patient API Tests', () => {
  let token;
  let userId;

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI);

    const userRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test Clerk',
        email: 'testclerk@hospital.com',
        password: 'password123',
        role: 'registration_clerk'
      });

    token = userRes.body.token;
    userId = userRes.body.user.id;
  });

  afterAll(async () => {
    await Patient.deleteMany({ name: { $regex: /Test Patient/ } });
    await User.deleteMany({ email: 'testclerk@hospital.com' });
    await mongoose.connection.close();
  });

  describe('POST /api/patients', () => {
    
    test('Should register a new patient', async () => {
      const response = await request(app)
        .post('/api/patients')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Test Patient One',
          age: 30,
          gender: 'male',
          contactNumber: '0501234567',
          bloodGroup: 'O+',
          currentComplaints: 'Fever'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('patientId');
      expect(response.body.data.patientId).toMatch(/^PAT/);
    });

    test('Should reject patient registration without auth', async () => {
      const response = await request(app)
        .post('/api/patients')
        .send({
          name: 'No Auth Patient',
          age: 25,
          gender: 'female',
          contactNumber: '0507654321'
        });

      expect(response.status).toBe(401);
    });

    test('Should reject patient with missing required fields', async () => {
      const response = await request(app)
        .post('/api/patients')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Incomplete Patient'
        });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/patients', () => {
    
    test('Should get all patients', async () => {
      const response = await request(app)
        .get('/api/patients')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    test('Should require authentication', async () => {
      const response = await request(app)
        .get('/api/patients');

      expect(response.status).toBe(401);
    });
  });
});