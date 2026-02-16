const mongoose = require('mongoose');

const admissionSchema = new mongoose.Schema({
  admissionId: {
    type: String,
    unique: true
  },
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  department: {
    type: String,
    required: true,
    enum: ['Medicine', 'Surgery', 'Orthopedics', 'Pediatrics', 'ENT', 'Ophthalmology', 'Gynecology', 'Dermatology', 'Oncology']
  },
  ward: {
    type: String,
    required: true
  },
  bedNumber: {
    type: String,
    required: true
  },
  admissionDate: {
    type: Date,
    default: Date.now
  },
  admittedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reasonForAdmission: {
    type: String,
    required: true
  },
  vitalSigns: [{
    temperature: Number,
    bloodPressure: {
      systolic: Number,
      diastolic: Number
    },
    pulseRate: Number,
    recordedAt: {
      type: Date,
      default: Date.now
    },
    recordedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  status: {
    type: String,
    enum: ['active', 'discharged'],
    default: 'active'
  },
  dischargeDate: Date,
  dischargeSummary: String
}, { timestamps: true });

// Auto-generate admission ID
admissionSchema.pre('save', async function(next) {
  if (!this.admissionId) {
    const count = await mongoose.model('Admission').countDocuments();
    this.admissionId = `ADM${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Admission', admissionSchema);