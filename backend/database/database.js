const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

// Database file path
const dbPath = path.join(__dirname, 'polis.db');

// Create database connection
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('✅ Connected to POLIS database');
        initializeDatabase();
    }
});

// Initialize database tables
function initializeDatabase() {
    // Users table
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        full_name TEXT NOT NULL,
        phone TEXT,
        role TEXT DEFAULT 'user',
        dob DATE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, function(err) {
        if (err) {
            console.error('Error creating users table:', err);
            return;
        }
        
        // Cases table
        db.run(`CREATE TABLE IF NOT EXISTS cases (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            case_number TEXT UNIQUE NOT NULL,
            title TEXT NOT NULL,
            description TEXT,
            crime_type TEXT NOT NULL,
            location TEXT,
            date_reported DATETIME NOT NULL,
            date_occurred DATETIME,
            status TEXT DEFAULT 'open',
            priority TEXT DEFAULT 'medium',
            assigned_officer_id INTEGER,
            complainant_name TEXT,
            complainant_phone TEXT,
            complainant_email TEXT,
            evidence_description TEXT,
            created_by INTEGER,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (assigned_officer_id) REFERENCES users (id),
            FOREIGN KEY (created_by) REFERENCES users (id)
        )`, function(err) {
            if (err) {
                console.error('Error creating cases table:', err);
                return;
            }
            
            // Evidence table
            db.run(`CREATE TABLE IF NOT EXISTS evidence (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                case_id INTEGER NOT NULL,
                evidence_type TEXT NOT NULL,
                description TEXT,
                file_path TEXT,
                collected_by INTEGER,
                collected_date DATETIME DEFAULT CURRENT_TIMESTAMP,
                status TEXT DEFAULT 'pending',
                FOREIGN KEY (case_id) REFERENCES cases (id),
                FOREIGN KEY (collected_by) REFERENCES users (id)
            )`, function(err) {
                if (err) {
                    console.error('Error creating evidence table:', err);
                    return;
                }
                
                // Case updates table
                db.run(`CREATE TABLE IF NOT EXISTS case_updates (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    case_id INTEGER NOT NULL,
                    update_text TEXT NOT NULL,
                    updated_by INTEGER NOT NULL,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (case_id) REFERENCES cases (id),
                    FOREIGN KEY (updated_by) REFERENCES users (id)
                )`, function(err) {
                    if (err) {
                        console.error('Error creating case_updates table:', err);
                        return;
                    }
                    
                    console.log('✅ All database tables created successfully');
                    // Create default admin user after all tables are created
                    createDefaultAdmin();
                });
            });
        });
    });
}

// Create default admin user
function createDefaultAdmin() {
    const adminPassword = bcrypt.hashSync('admin123', 10);
    
    db.get("SELECT id FROM users WHERE username = 'admin'", (err, row) => {
        if (err) {
            console.error('Error checking admin user:', err);
            return;
        }
        
        if (!row) {
            db.run(`INSERT INTO users (username, email, password, full_name, role, dob) 
                    VALUES (?, ?, ?, ?, ?, ?)`,
                ['admin', 'admin@polis.com', adminPassword, 'System Administrator', 'admin', '2000-01-01'],
                function(err) {
                    if (err) {
                        console.error('Error creating admin user:', err);
                    } else {
                        console.log('✅ Default admin user created');
                        console.log('👤 Username: admin');
                        console.log('🔑 Password: admin123');
                    }
                }
            );
        }
    });
}

// Helper function to run queries with promises
function runQuery(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function(err) {
            if (err) {
                reject(err);
            } else {
                resolve({ id: this.lastID, changes: this.changes });
            }
        });
    });
}

// Helper function to get single row
function getRow(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => {
            if (err) {
                reject(err);
            } else {
                resolve(row);
            }
        });
    });
}

// Helper function to get multiple rows
function getAll(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
}

module.exports = {
    db,
    runQuery,
    getRow,
    getAll
};
