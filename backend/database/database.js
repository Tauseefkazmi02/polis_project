const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// MongoDB connection
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/polis_db', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error('❌ MongoDB connection error:', error.message);
        process.exit(1);
    }
};

// Create default admin user
const createDefaultAdmin = async () => {
    try {
        const adminPassword = await bcrypt.hash('admin123', 10);
        const adminUser = await User.findOne({ username: 'admin' });

        if (!adminUser) {
            const admin = new User({
                username: 'admin',
                email: 'admin@polis.com',
                password: adminPassword,
                full_name: 'System Administrator',
                role: 'admin',
                dob: new Date('2000-01-01')
            });

            await admin.save();
            console.log('✅ Default admin user created');
            console.log('👤 Username: admin');
            console.log('🔑 Password: admin123');
        }
    } catch (error) {
        console.error('Error creating admin user:', error);
    }
};

module.exports = {
    connectDB,
    createDefaultAdmin
};
