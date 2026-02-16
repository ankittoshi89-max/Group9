const express = require('express');
const router = express.Router();
const {
  registerDoctor,
  getDoctors,
  getDoctor,
  updateDoctor,
  getDoctorsBySpecialization
} = require('../controllers/doctorController');
const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .get(getDoctors)
  .post(protect, authorize('admin'), registerDoctor);

router.route('/:id')
  .get(getDoctor)
  .put(protect, authorize('admin', 'doctor'), updateDoctor);

router.get('/specialization/:spec', getDoctorsBySpecialization);

module.exports = router;