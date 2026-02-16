const express = require('express');
const router = express.Router();
const {
  registerPatient,
  getPatients,
  getPatient,
  updatePatient,
  deletePatient
} = require('../controllers/patientController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .get(getPatients)
  .post(authorize('registration_clerk', 'doctor', 'nurse'), registerPatient);

router.route('/:id')
  .get(getPatient)
  .put(authorize('doctor', 'nurse'), updatePatient)
  .delete(authorize('admin'), deletePatient);

module.exports = router;