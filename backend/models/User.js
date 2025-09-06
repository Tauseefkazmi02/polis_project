const { getRow, getAll, runQuery } = require('../database/database');
const bcrypt = require('bcryptjs');

class User {
  // Find user by username
  static findByUsername(username) {
    return getRow('SELECT * FROM users WHERE username = ?', [username]);
  }

  // Find user by email
  static findByEmail(email) {
    return getRow('SELECT * FROM users WHERE email = ?', [email]);
  }

  // Create a new user with hashed password
  static async create(userData) {
    const {
      username,
      email,
      password,
      full_name,
      phone = null,
      role = 'user',
      dob = null
    } = userData;

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const sql = `INSERT INTO users (username, email, password, full_name, phone, role, dob) 
                 VALUES (?, ?, ?, ?, ?, ?, ?)`;

    const params = [username, email, hashedPassword, full_name, phone, role, dob];

    const result = await runQuery(sql, params);
    return getRow(
      'SELECT id, username, email, full_name, phone, role, dob, created_at FROM users WHERE id = ?',
      [result.id]
    );
  }

  // Get all users (excluding password)
  static findAll() {
    return getAll('SELECT id, username, email, full_name, phone, role, dob, created_at FROM users');
  }

  // Compare plaintext password with hashed password
  static comparePassword(password, hashedPassword) {
    return bcrypt.compare(password, hashedPassword);
  }
}

module.exports = User;
