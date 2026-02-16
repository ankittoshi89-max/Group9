const fs = require('fs');
const path = require('path');

console.log('🏥 Creating Hospital Management API files...\n');

// All file contents
const files = {
  // Config files
  'src/config/database.js': `const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(\`✅ MongoDB Connected: \${conn.connection.host}\`);
    console.log(\`📊 Database: \${conn.connection.name}\`);
  } catch (error) {
    console.error(\`❌ MongoDB Error: \${error.message}\`);
    process.exit(1);
  }
};

module.exports = connectDB;`,

  // Models
  'src/models/User.js': `const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true,
    maxlength: 50
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\\w+([\\.-]?\\w+)*@\\w+([\\.-]?\\w+)*(\\.\\w{2,3})+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 6,
    select: false
  },
  role: {
    type: String,
    enum: ['admin', 'doctor', 'nurse', 'registration_clerk'],
    required: true,
    default: 'registration_clerk'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);`,

  'src/models/Patient.js': `const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  patientId: {
    type: String,
    unique: true
  },
  name: {
    type: String,
    required: [true, 'Patient name is required'],
    trim: true
  },
  age: {
    type: Number,
    required: true,
    min: 0,
    max: 150
  },
  gender: {
    type: String,
    required: true,
    enum: ['male', 'female', 'other']
  },
  contactNumber: {
    type: String,
    required: true
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String
  },
  bloodGroup: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown']
  },
  knownDiseases: [String],
  allergies: [String],
  currentComplaints: String,
  registeredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  registrationDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['active', 'discharged', 'referred'],
    default: 'active'
  }
}, { timestamps: true });

// Auto-generate patient ID
patientSchema.pre('save', async function(next) {
  if (!this.patientId) {
    const count = await mongoose.model('Patient').countDocuments();
    this.patientId = \`PAT\${String(count + 1).padStart(6, '0')}\`;
  }
  next();
});

module.exports = mongoose.model('Patient', patientSchema);`,

  'src/models/Admission.js': `const mongoose = require('mongoose');

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
    this.admissionId = \`ADM\${String(count + 1).padStart(6, '0')}\`;
  }
  next();
});

module.exports = mongoose.model('Admission', admissionSchema);`,

  // Middleware
  'src/middleware/auth.js': `const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
  try {
    let token;
    
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    if (!token) {
      return res.status(401).json({ error: 'Not authorized to access this route' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);
    
    if (!req.user) {
      return res.status(401).json({ error: 'User not found' });
    }
    
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Not authorized' });
  }
};

exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: \`User role \${req.user.role} is not authorized to access this route\` 
      });
    }
    next();
  };
};`,

  // Controllers
  'src/controllers/authController.js': `const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ error: 'User already exists' });
    }
    
    const user = await User.create({ name, email, password, role });
    
    const token = generateToken(user._id);
    
    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Please provide email and password' });
    }
    
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const isMatch = await user.comparePassword(password);
    
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = generateToken(user._id);
    
    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};`,

  'src/controllers/patientController.js': `const Patient = require('../models/Patient');

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
};`,

  'src/controllers/admissionController.js': `const Admission = require('../models/Admission');
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
};`,

  // Routes
  'src/routes/auth.js': `const express = require('express');
const router = express.Router();
const { register, login, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);

module.exports = router;`,

  'src/routes/patients.js': `const express = require('express');
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

module.exports = router;`,

  'src/routes/admissions.js': `const express = require('express');
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

module.exports = router;`,

  // Main server files
  'src/app.js': `const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();

// Security middleware
app.use(helmet());
app.use(cors());

// Rate limiting
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 100
});
app.use(limiter);

// Body parser
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/patients', require('./routes/patients'));
app.use('/api/admissions', require('./routes/admissions'));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Hospital API is running' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

module.exports = app;`,

  'src/server.js': `require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/database');

const PORT = process.env.PORT || 5000;

// Connect to database
connectDB();

// Start server
const server = app.listen(PORT, () => {
  console.log(\`\\n🚀 Server running on port \${PORT}\`);
  console.log(\`📍 Environment: \${process.env.NODE_ENV}\`);
  console.log(\`\\n🏥 Hospital Management API is ready!\`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.log(\`Error: \${err.message}\`);
  server.close(() => process.exit(1));
});`
};

// Create all files
Object.entries(files).forEach(([filePath, content]) => {
  const fullPath = path.join(process.cwd(), filePath);
  const dir = path.dirname(fullPath);
  
  // Create directory if it doesn't exist
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  // Write file
  fs.writeFileSync(fullPath, content);
  console.log(`✅ Created: ${filePath}`);
});

console.log('\n🎉 All files created successfully!');
console.log('\n📦 Next step: Run "npm install" to install dependencies');