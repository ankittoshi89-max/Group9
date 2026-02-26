const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const User = require('../src/models/User');
const Patient = require('../src/models/Patient');
const Doctor = require('../src/models/Doctor');
const Appointment = require('../src/models/Appointment');

describe('Appointment API Tests', () => {
  let token;
  let patientId;
  let doctorId;

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI);

    // Register a clerk for patient/appointment operations
    const userRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test Appointment User',
        email: 'testappointment@hospital.com',
        password: 'password123',
        role: 'registration_clerk'
      });

    token = userRes.body.token;

    // Register an ADMIN user to create doctors
    const adminRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Admin User',
        email: 'adminappointment@hospital.com',
        password: 'password123',
        role: 'admin'
      });

    const adminToken = adminRes.body.token;

    const patientRes = await request(app)
      .post('/api/patients')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Appointment Test Patient',
        age: 28,
        gender: 'female',
        contactNumber: '0504445566'
      });

    patientId = patientRes.body.data._id;

    const doctorUserRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Dr. Appointment Test',
        email: 'drappointment@hospital.com',
        password: 'password123',
        role: 'doctor'
      });

    // Use ADMIN token here instead of clerk token
    const doctorRes = await request(app)
      .post('/api/doctors')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        user: doctorUserRes.body.user.id,
        specialization: 'General Medicine',
        department: 'Medicine',
        qualification: 'MBBS',
        experience: 5,
        contactNumber: '0507778899',
        consultationFee: 150,
        availability: {
          days: ['Monday', 'Tuesday'],
          startTime: '09:00',
          endTime: '17:00'
        }
      });

    doctorId = doctorRes.body.data?._id || doctorRes.body._id;
    });

  afterAll(async () => {
    await Appointment.deleteMany({ reason: { $regex: /Test/ } });
    await Doctor.deleteMany({ qualification: 'MBBS' });
    await Patient.deleteMany({ name: 'Appointment Test Patient' });
    await User.deleteMany({ email: { $regex: /appointment@hospital\.com/ } });
    await mongoose.connection.close();
  });

  describe('POST /api/appointments', () => {
    
    test('Should book an appointment successfully', async () => {
      const response = await request(app)
        .post('/api/appointments')
        .set('Authorization', `Bearer ${token}`)
        .send({
          patient: patientId,
          doctor: doctorId,
          appointmentDate: '2026-02-25',
          appointmentTime: '10:00',
          reason: 'Test appointment - routine checkup',
          type: 'consultation'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('appointmentId');
      expect(response.body.data.appointmentId).toMatch(/^APT/);
    });

    test('Should require authentication', async () => {
      const response = await request(app)
        .post('/api/appointments')
        .send({
          patient: patientId,
          doctor: doctorId,
          appointmentDate: '2026-02-26',
          appointmentTime: '11:00'
        });

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/appointments', () => {
    
    test('Should get all appointments', async () => {
      const response = await request(app)
        .get('/api/appointments')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });
});