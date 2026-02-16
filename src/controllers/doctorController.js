/**
 * Hospital Management System - Doctor Controller
 * Developed by: Muhammad Manneh
 * Date: February 2026
 * Course: Applied DevOps (F21AO)
 */

const Doctor = require('../models/Doctor');
const User = require('../models/User');

// @desc    Register new doctor
// @route   POST /api/doctors
// @access  Private (Admin only)
exports.registerDoctor = async (req, res) => {
  try {
    // Check if user exists and is a doctor
    const user = await User.findById(req.body.user);
    if (!user || user.role !== 'doctor') {
      return res.status(400).json({ error: 'User must exist and have doctor role' });
    }

    const doctor = await Doctor.create(req.body);
    
    res.status(201).json({ success: true, data: doctor });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// @desc    Get all doctors
// @route   GET /api/doctors
// @access  Public
exports.getDoctors = async (req, res) => {
  try {
    const { specialization, department, status } = req.query;
    
    let query = {};
    if (specialization) query.specialization = specialization;
    if (department) query.department = department;
    if (status) query.status = status;
    
    const doctors = await Doctor.find(query).populate('user', 'name email');
    
    res.json({ success: true, count: doctors.length, data: doctors });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get single doctor
// @route   GET /api/doctors/:id
// @access  Public
exports.getDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id).populate('user', 'name email');
    
    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }
    
    res.json({ success: true, data: doctor });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Update doctor
// @route   PUT /api/doctors/:id
// @access  Private (Admin, Doctor)
exports.updateDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    
    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }
    
    res.json({ success: true, data: doctor });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// @desc    Get doctors by specialization
// @route   GET /api/doctors/specialization/:spec
// @access  Public
exports.getDoctorsBySpecialization = async (req, res) => {
  try {
    const doctors = await Doctor.find({ 
      specialization: req.params.spec,
      status: 'active'
    }).populate('user', 'name email');
    
    res.json({ success: true, count: doctors.length, data: doctors });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};