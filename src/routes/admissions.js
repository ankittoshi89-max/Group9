const express = require('express');
const router = express.Router();
const {
  admitPatient,
  getAdmissions,
  getAdmission,
  addVitalSigns,
  dischargePatient
} = require('../controllers/admissionController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .get(getAdmissions)
  .post(authorize('doctor', 'nurse'), admitPatient);

router.route('/:id')
  .get(getAdmission);

router.put('/:id/vitals', authorize('doctor', 'nurse'), addVitalSigns);
router.put('/:id/discharge', authorize('doctor'), dischargePatient);

module.exports = router;