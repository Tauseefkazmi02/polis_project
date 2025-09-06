const { getAll, getRow, runQuery } = require('../database/database');

class Case {
  // Find a case by its case number
  static findByCaseNumber(caseNumber) {
    return getRow('SELECT * FROM cases WHERE case_number = ?', [caseNumber]);
  }

  // Find a case by its ID
  static findById(id) {
    return getRow('SELECT * FROM cases WHERE id = ?', [id]);
  }

  // Create a new case record
  static create(caseData) {
    const {
      case_number,
      title,
      description,
      crime_type,
      location = null,
      date_reported,
      status = 'open',
      priority = 'medium',
      complainant_name = null,
      complainant_phone = null,
      complainant_email = null,
      created_by
    } = caseData;

    const sql = `INSERT INTO cases 
      (case_number, title, description, crime_type, location, date_reported, status, priority, complainant_name, complainant_phone, complainant_email, created_by) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    const params = [
      case_number,
      title,
      description,
      crime_type,
      location,
      date_reported,
      status,
      priority,
      complainant_name,
      complainant_phone,
      complainant_email,
      created_by
    ];

    return runQuery(sql, params).then(result => {
      // Return the full case after creation
      return Case.findById(result.id);
    });
  }

  // Get all cases ordered by creation date (descending)
  static findAll() {
    return getAll('SELECT * FROM cases ORDER BY created_at DESC');
  }

  // Update the status of a case by case number and update the timestamp
  static updateStatus(caseNumber, status) {
    const sql = `UPDATE cases SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE case_number = ?`;
    return runQuery(sql, [status, caseNumber]);
  }
}

module.exports = Case;
