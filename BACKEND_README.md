# Lush & Co - Backend API

Backend API for the Lush & Co Salon Management System built with Node.js, Express, and MongoDB.

## Table of Contents

- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Database Schema](#database-schema)
- [API Endpoints](#api-endpoints)
- [Authentication Middleware](#authentication-middleware)
- [Running the Server](#running-the-server)

## Tech Stack

- **Runtime**: Node.js (v18+)
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcrypt
- **Validation**: express-validator
- **Environment Variables**: dotenv
- **CORS**: cors middleware

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── database.js          # MongoDB connection
│   ├── middleware/
│   │   ├── auth.js              # Authentication middleware
│   │   └── errorHandler.js      # Error handling middleware
│   ├── models/
│   │   ├── User.js              # User model (Owner/Receptionist)
│   │   ├── Staff.js             # Staff member model
│   │   ├── Service.js           # Service model
│   │   ├── Appointment.js       # Appointment model
│   │   └── Revenue.js           # Revenue/Transaction model
│   ├── routes/
│   │   ├── auth.js              # Authentication routes
│   │   ├── staff.js             # Staff management routes
│   │   ├── services.js          # Services management routes
│   │   ├── appointments.js      # Appointments routes
│   │   └── revenue.js           # Revenue/analytics routes
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── staffController.js
│   │   ├── servicesController.js
│   │   ├── appointmentsController.js
│   │   └── revenueController.js
│   └── server.js                # Entry point
├── .env                         # Environment variables
├── .gitignore
├── package.json
└── README.md
```

## Prerequisites

- Node.js v18 or higher
- MongoDB installed locally or MongoDB Atlas account
- npm or yarn package manager

## Installation

### 1. Initialize the Project

```bash
mkdir lush-co-backend
cd lush-co-backend
npm init -y
```

### 2. Install Dependencies

```bash
npm install express mongoose dotenv cors bcrypt jsonwebtoken express-validator
npm install -D nodemon
```

### 3. Update package.json Scripts

Add these scripts to your `package.json`:

```json
{
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js"
  }
}
```

## Environment Variables

Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/lush-co
# Or for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/lush-co?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# CORS Configuration
FRONTEND_URL=http://localhost:3000
```

## Database Schema

### User Model (Owner/Receptionist)

```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: String (enum: ['owner', 'receptionist']),
  createdAt: Date,
  updatedAt: Date
}
```

### Staff Model

```javascript
{
  name: String,
  email: String (unique),
  phone: String,
  role: String (e.g., "Senior Stylist", "Colorist"),
  rating: Number (default: 0),
  clients: Number (default: 0),
  status: String (enum: ['active', 'inactive']),
  specialties: [String],
  createdAt: Date,
  updatedAt: Date
}
```

### Service Model

```javascript
{
  name: String,
  description: String,
  price: Number,
  duration: Number (in minutes),
  categoryId: String,
  categoryName: String (e.g., "Hair Styling", "Hair Coloring"),
  popular: Boolean (default: false),
  createdAt: Date,
  updatedAt: Date
}
```

### Appointment Model

```javascript
{
  clientName: String,
  clientEmail: String,
  clientPhone: String,
  serviceId: ObjectId (ref: 'Service'),
  staffId: ObjectId (ref: 'Staff'),
  appointmentDate: Date,
  appointmentTime: String,
  duration: Number,
  status: String (enum: ['scheduled', 'completed', 'cancelled', 'no-show']),
  totalPrice: Number,
  notes: String,
  createdBy: ObjectId (ref: 'User'),
  createdAt: Date,
  updatedAt: Date
}
```

### Revenue Model

```javascript
{
  appointmentId: ObjectId (ref: 'Appointment'),
  serviceId: ObjectId (ref: 'Service'),
  staffId: ObjectId (ref: 'Staff'),
  amount: Number,
  paymentMethod: String (enum: ['cash', 'card', 'upi', 'other']),
  transactionDate: Date,
  month: Number,
  year: Number,
  createdAt: Date,
  updatedAt: Date
}
```

## API Endpoints

### Authentication Routes (Public)

```
POST   /api/auth/register        # Register new user (owner/receptionist)
POST   /api/auth/login           # Login user
POST   /api/auth/refresh         # Refresh JWT token
GET    /api/auth/me              # Get current user info (protected)
```

### Staff Routes (Protected)

```
GET    /api/staff                # Get all staff members
GET    /api/staff/:id            # Get staff by ID
POST   /api/staff                # Create new staff member
PUT    /api/staff/:id            # Update staff member
DELETE /api/staff/:id            # Delete staff member
GET    /api/staff/stats          # Get staff statistics
```

### Services Routes (Protected)

```
GET    /api/services             # Get all services
GET    /api/services/:id         # Get service by ID
POST   /api/services             # Create new service
PUT    /api/services/:id         # Update service
DELETE /api/services/:id         # Delete service
GET    /api/services/category/:categoryName  # Get services by category
```

### Appointments Routes (Protected)

```
GET    /api/appointments         # Get all appointments
GET    /api/appointments/:id     # Get appointment by ID
POST   /api/appointments         # Create new appointment
PUT    /api/appointments/:id     # Update appointment
DELETE /api/appointments/:id     # Cancel appointment
GET    /api/appointments/date/:date  # Get appointments by date
GET    /api/appointments/staff/:staffId  # Get appointments by staff
GET    /api/appointments/stats   # Get appointment statistics
```

### Revenue Routes (Protected)

```
GET    /api/revenue              # Get all revenue records
GET    /api/revenue/:id          # Get revenue by ID
POST   /api/revenue              # Record new revenue/transaction
GET    /api/revenue/monthly      # Get monthly revenue breakdown
GET    /api/revenue/stats        # Get revenue statistics
GET    /api/revenue/analytics    # Get detailed analytics
```

## Authentication Middleware

All protected routes require a valid JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Middleware Implementation

The auth middleware should:
1. Extract token from Authorization header
2. Verify token using JWT_SECRET
3. Attach user info to request object
4. Handle token expiration and invalid tokens

### Role-Based Access

- **Owner**: Full access to all endpoints
- **Receptionist**: Limited access (can't delete staff or modify revenue records)

## Implementation Guide

### Step 1: Setup Database Connection

Create `src/config/database.js`:

```javascript
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

module.exports = connectDB;
```

### Step 2: Create Authentication Middleware

Create `src/middleware/auth.js`:

```javascript
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ message: 'No authentication token, access denied' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// Role-based middleware
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: 'Access denied. Insufficient permissions.'
      });
    }
    next();
  };
};

module.exports = { auth, authorize };
```

### Step 3: Create User Model

Create `src/models/User.js`:

```javascript
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['owner', 'receptionist'],
    default: 'receptionist'
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
```

### Step 4: Create Staff Model

Create `src/models/Staff.js`:

```javascript
const mongoose = require('mongoose');

const staffSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    required: true
  },
  role: {
    type: String,
    default: 'Stylist'
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  clients: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  specialties: [{
    type: String
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Staff', staffSchema);
```

### Step 5: Create Service Model

Create `src/models/Service.js`:

```javascript
const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  duration: {
    type: Number,
    required: true,
    min: 1
  },
  categoryId: {
    type: String,
    required: true
  },
  categoryName: {
    type: String,
    required: true
  },
  popular: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Service', serviceSchema);
```

### Step 6: Create Authentication Routes

Create `src/routes/auth.js`:

```javascript
const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const authController = require('../controllers/authController');

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);

// Protected routes
router.get('/me', auth, authController.getCurrentUser);
router.post('/refresh', auth, authController.refreshToken);

module.exports = router;
```

### Step 7: Create Auth Controller

Create `src/controllers/authController.js`:

```javascript
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
};

// Register user
exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'receptionist'
    });

    // Generate token
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
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate token
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
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get current user
exports.getCurrentUser = async (req, res) => {
  try {
    res.json({
      success: true,
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Refresh token
exports.refreshToken = async (req, res) => {
  try {
    const token = generateToken(req.user._id);
    res.json({ success: true, token });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
```

### Step 8: Create Staff Routes

Create `src/routes/staff.js`:

```javascript
const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const staffController = require('../controllers/staffController');

// All routes are protected
router.use(auth);

router.get('/', staffController.getAllStaff);
router.get('/:id', staffController.getStaffById);
router.post('/', staffController.createStaff);
router.put('/:id', staffController.updateStaff);
router.delete('/:id', authorize('owner'), staffController.deleteStaff);

module.exports = router;
```

### Step 9: Create Staff Controller

Create `src/controllers/staffController.js`:

```javascript
const Staff = require('../models/Staff');

// Get all staff
exports.getAllStaff = async (req, res) => {
  try {
    const staff = await Staff.find().sort({ createdAt: -1 });
    res.json({ success: true, data: staff });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get staff by ID
exports.getStaffById = async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.id);
    if (!staff) {
      return res.status(404).json({ message: 'Staff member not found' });
    }
    res.json({ success: true, data: staff });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create staff
exports.createStaff = async (req, res) => {
  try {
    const { name, email, phone } = req.body;

    // Check if staff with email exists
    const existingStaff = await Staff.findOne({ email });
    if (existingStaff) {
      return res.status(400).json({ message: 'Staff member with this email already exists' });
    }

    const staff = await Staff.create({
      name,
      email,
      phone,
      role: 'Stylist',
      rating: 0,
      clients: 0,
      status: 'active',
      specialties: []
    });

    res.status(201).json({ success: true, data: staff });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update staff
exports.updateStaff = async (req, res) => {
  try {
    const { name, email, phone } = req.body;

    const staff = await Staff.findByIdAndUpdate(
      req.params.id,
      { name, email, phone },
      { new: true, runValidators: true }
    );

    if (!staff) {
      return res.status(404).json({ message: 'Staff member not found' });
    }

    res.json({ success: true, data: staff });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete staff (Owner only)
exports.deleteStaff = async (req, res) => {
  try {
    const staff = await Staff.findByIdAndDelete(req.params.id);

    if (!staff) {
      return res.status(404).json({ message: 'Staff member not found' });
    }

    res.json({ success: true, message: 'Staff member deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
```

### Step 10: Create Main Server File

Create `src/server.js`:

```javascript
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/database');

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/staff', require('./routes/staff'));
app.use('/api/services', require('./routes/services'));
app.use('/api/appointments', require('./routes/appointments'));
app.use('/api/revenue', require('./routes/revenue'));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
});
```

## Running the Server

### Development Mode

```bash
npm run dev
```

### Production Mode

```bash
npm start
```

## Testing API Endpoints

### 1. Register a User

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin User",
    "email": "admin@lushandco.com",
    "password": "password123",
    "role": "owner"
  }'
```

### 2. Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@lushandco.com",
    "password": "password123"
  }'
```

### 3. Create Staff (Protected)

```bash
curl -X POST http://localhost:5000/api/staff \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "Emma Wilson",
    "email": "emma@lushandco.com",
    "phone": "(555) 123-4567"
  }'
```

### 4. Get All Staff (Protected)

```bash
curl -X GET http://localhost:5000/api/staff \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Next Steps

1. **Create remaining models**: Appointment, Revenue, Service
2. **Implement remaining controllers**: servicesController, appointmentsController, revenueController
3. **Add validation**: Use express-validator for input validation
4. **Add error handling**: Centralized error handling
5. **Add logging**: Winston or Morgan for request logging
6. **Add rate limiting**: To prevent abuse
7. **Add file upload**: For staff/service images (using multer)
8. **Add search & filtering**: Query parameters for advanced searches
9. **Add pagination**: For large datasets
10. **Add unit tests**: Jest or Mocha for testing

## Security Best Practices

1. **Never commit .env file** to version control
2. **Use strong JWT secrets** in production
3. **Implement rate limiting** on auth routes
4. **Validate and sanitize** all user inputs
5. **Use HTTPS** in production
6. **Implement refresh token rotation**
7. **Set appropriate CORS** policies
8. **Hash passwords** with bcrypt (min 10 rounds)
9. **Implement request timeout**
10. **Monitor for suspicious activity**

## Additional Resources

- [Express.js Documentation](https://expressjs.com/)
- [Mongoose Documentation](https://mongoosejs.com/)
- [JWT Best Practices](https://jwt.io/introduction)
- [MongoDB Security Checklist](https://docs.mongodb.com/manual/administration/security-checklist/)

## Support

For issues or questions, please create an issue in the GitHub repository.

## License

MIT
