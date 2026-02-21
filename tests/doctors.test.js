const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const User = require('../src/models/User');
const Doctor = require('../src/models/Doctor');

describe('Doctor API Tests', () => {
  let adminToken;
  let doctorUserId;

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI);

    const adminRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test Admin',
        email: 'testadmin@hospital.com',
        password: 'password123',
        role: 'admin'
      });

    adminToken = adminRes.body.token;

    const doctorRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Dr. Test Specialist',
        email: 'testspecialist@hospital.com',
        password: 'password123',
        role: 'doctor'
      });

    doctorUserId = doctorRes.body.user.id;
  });

  afterAll(async () => {
    await Doctor.deleteMany({ qualification: { $regex: /Test/ } });
    await User.deleteMany({ email: { $regex: /test.*@hospital\.com/ } });
    await mongoose.connection.close();
  });

  describe('POST /api/doctors', () => {
    
    test('Should register a doctor profile', async () => {
      const response = await request(app)
        .post('/api/doctors')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          user: doctorUserId,
          specialization: 'Cardiology',
          department: 'Medicine',
          qualification: 'MBBS, MD - Test',
          experience: 12,
          contactNumber: '0501112233',
          availability: {
            days: ['Monday', 'Wednesday', 'Friday'],
            startTime: '09:00',
            endTime: '17:00'
          },
          consultationFee: 250
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('doctorId');
      expect(response.body.data.doctorId).toMatch(/^DOC/);
    });
  });

  describe('GET /api/doctors', () => {
    
    test('Should get all doctors without authentication', async () => {
      const response = await request(app)
        .get('/api/doctors');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });
});