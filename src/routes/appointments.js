const express = require('express');
const router = express.Router();
const {
  bookAppointment,
  getAppointments,
  getAppointment,
  updateAppointment,
  cancelAppointment,
  getPatientAppointments
} = require('../controllers/appointmentController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .get(getAppointments)
  .post(authorize('registration_clerk', 'doctor', 'nurse'), bookAppointment);

router.route('/:id')
  .get(getAppointment)
  .put(authorize('doctor', 'nurse', 'registration_clerk'), updateAppointment);

router.put('/:id/cancel', cancelAppointment);
router.get('/patient/:patientId', getPatientAppointments);

module.exports = router;