const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const User = require('../src/models/User');
const Patient = require('../src/models/Patient');
const Admission = require('../src/models/Admission');

describe('Admission API Tests', () => {
  let token;
  let patientId;

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI);

    const userRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test Doctor Admission',
        email: 'testdocadm@hospital.com',
        password: 'password123',
        role: 'doctor'
      });

    token = userRes.body.token;

    const patientRes = await request(app)
      .post('/api/patients')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Test Admission Patient',
        age: 35,
        gender: 'female',
        contactNumber: '0509876543',
        bloodGroup: 'A+'
      });

    patientId = patientRes.body.data._id;
  });

  afterAll(async () => {
    await Admission.deleteMany({ reasonForAdmission: { $regex: /Test/ } });
    await Patient.deleteMany({ name: 'Test Admission Patient' });
    await User.deleteMany({ email: 'testdocadm@hospital.com' });
    await mongoose.connection.close();
  });

  describe('POST /api/admissions', () => {
    
    test('Should admit a patient successfully', async () => {
      const response = await request(app)
        .post('/api/admissions')
        .set('Authorization', `Bearer ${token}`)
        .send({
          patient: patientId,
          department: 'Medicine',
          ward: 'Medical A',
          bedNumber: 'A-101',
          reasonForAdmission: 'Test admission for fever'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('admissionId');
      expect(response.body.data.admissionId).toMatch(/^ADM/);
    });

    test('Should reject admission without authentication', async () => {
      const response = await request(app)
        .post('/api/admissions')
        .send({
          patient: patientId,
          department: 'Surgery',
          ward: 'Surgical A',
          bedNumber: 'A-201'
        });

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/admissions', () => {
    
    test('Should get all admissions', async () => {
      const response = await request(app)
        .get('/api/admissions')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });
});