// seedAdmin.js
// Run: node seedAdmin.js
// Creates a default admin user with phone + password login
const bcrypt = require('bcrypt');
const sequelize = require('./config/database');
const Admin = require('./models/Admin');

async function seedAdmin() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected');

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ where: { phone: '01700000001' } });
    if (existingAdmin) {
      console.log('⚠️  Admin with phone 01700000001 already exists. Updating password...');
      const salt = await bcrypt.genSalt(10);
      existingAdmin.password = await bcrypt.hash('admin123', salt);
      await existingAdmin.save({ hooks: false }); // Skip beforeUpdate hook to avoid double hashing
      console.log('✅ Password updated successfully!');
    } else {
      // Create new admin - password will be hashed by model hook
      await Admin.create({
        full_name: 'সুপার অ্যাডমিন',
        email: 'admin@familycard.gov.bd',
        password: 'admin123',
        phone: '01700000001',
        role: 'super_admin',
        status: 'active',
      });
      console.log('✅ Admin created successfully!');
    }

    console.log('\n📋 Admin Login Credentials:');
    console.log('   Phone: 01700000001');
    console.log('   Password: admin123');
    console.log('\n⚠️  Please change the password after first login!');

    process.exit(0);
  } catch (err) {
    console.error('❌ Error seeding admin:', err.message);
    process.exit(1);
  }
}

seedAdmin();
