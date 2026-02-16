/**
 * Hospital Management System - Patient Controller
 * Developed by: Muhammad Manneh
 * Date: February 2026
 * Course: Applied DevOps (F21AO)
 */

const Patient = require('../models/Patient');

// @desc    Register new patient
// @route   POST /api/patients
// @access  Private (Clerk, Doctor, Nurse)
exports.registerPatient = async (req, res) => {
  try {
    const patient = await Patient.create({
      ...req.body,
      registeredBy: req.user.id
    });
    
    res.status(201).json({ success: true, data: patient });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// @desc    Get all patients
// @route   GET /api/patients
// @access  Private
exports.getPatients = async (req, res) => {
  try {
    const patients = await Patient.find().populate('registeredBy', 'name email');
    res.json({ success: true, count: patients.length, data: patients });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get single patient
// @route   GET /api/patients/:id
// @access  Private
exports.getPatient = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id).populate('registeredBy', 'name email');
    
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }
    
    res.json({ success: true, data: patient });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Update patient
// @route   PUT /api/patients/:id
// @access  Private
exports.updatePatient = async (req, res) => {
  try {
    const patient = await Patient.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }
    
    res.json({ success: true, data: patient });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// @desc    Delete patient
// @route   DELETE /api/patients/:id
// @access  Private (Admin only)
  exports.deletePatient = async (req, res) => {
  try {
    const patient = await Patient.findByIdAndDelete(req.params.id);
    
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }
    
    res.json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};