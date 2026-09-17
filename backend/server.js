const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');

// Load env vars
dotenv.config();

// Database & Models
const sequelize = require('./config/database');
require('./models'); // Ensure models are loaded and associations are set up

// Middlewares
const { errorHandler, notFound } = require('./middleware/errorHandler');

// Routes
const authRoutes = require('./routes/authRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const adminRoutes = require('./routes/adminRoutes');
const familyRoutes = require('./routes/familyRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const grievanceRoutes = require('./routes/grievanceRoutes');
const auditRoutes = require('./routes/auditRoutes');

// Cron Jobs
const monthlyPaymentJob = require('./jobs/monthlyPaymentJob');

const app = express();

// Security Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set static folder for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/family', familyRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/grievances', grievanceRoutes);
app.use('/api/audit', auditRoutes);

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Database Sync and Server Start
sequelize.sync({ alter: true }) // Update schema without dropping tables
  .then(() => {
    console.log('Database synced successfully with Sequelize.');
    app.listen(PORT, () => {
      console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
      // Start background jobs
      monthlyPaymentJob.start();
    });
  })
  .catch(err => {
    console.error('Failed to sync database:', err);
  });
