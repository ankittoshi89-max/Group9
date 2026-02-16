/**
 * Hospital Management System - Admission Controller
 * Developed by: Muhammad Manneh
 * Date: February 2026
 * Course: Applied DevOps (F21AO)
 */

const Admission = require('../models/Admission');
const Patient = require('../models/Patient');

// @desc    Admit patient
// @route   POST /api/admissions
// @access  Private (Doctor, Nurse)
exports.admitPatient = async (req, res) => {
  try {
    const patient = await Patient.findById(req.body.patient);
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }
    
    const admission = await Admission.create({
      ...req.body,
      admittedBy: req.user.id
    });
    
    res.status(201).json({ success: true, data: admission });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// @desc    Get all admissions
// @route   GET /api/admissions
// @access  Private
exports.getAdmissions = async (req, res) => {
  try {
    const admissions = await Admission.find()
      .populate('patient', 'name patientId')
      .populate('admittedBy', 'name email');
      
    res.json({ success: true, count: admissions.length, data: admissions });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get single admission
// @route   GET /api/admissions/:id
// @access  Private
exports.getAdmission = async (req, res) => {
  try {
    const admission = await Admission.findById(req.params.id)
      .populate('patient')
      .populate('admittedBy', 'name email');
      
    if (!admission) {
      return res.status(404).json({ error: 'Admission not found' });
    }
    
    res.json({ success: true, data: admission });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Add vital signs
// @route   PUT /api/admissions/:id/vitals
// @access  Private (Nurse, Doctor)
exports.addVitalSigns = async (req, res) => {
  try {
    const admission = await Admission.findById(req.params.id);
    
    if (!admission) {
      return res.status(404).json({ error: 'Admission not found' });
    }
    
    admission.vitalSigns.push({
      ...req.body,
      recordedBy: req.user.id
    });
    
    await admission.save();
    
    res.json({ success: true, data: admission });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// @desc    Discharge patient
// @route   PUT /api/admissions/:id/discharge
// @access  Private (Doctor)
exports.dischargePatient = async (req, res) => {
  try {
    const admission = await Admission.findByIdAndUpdate(
      req.params.id,
      {
        status: 'discharged',
        dischargeDate: Date.now(),
        dischargeSummary: req.body.dischargeSummary
      },
      { new: true }
    );
    
    if (!admission) {
      return res.status(404).json({ error: 'Admission not found' });
    }
    
    res.json({ success: true, data: admission });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};