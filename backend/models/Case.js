const mongoose = require('mongoose');

const caseSchema = new mongoose.Schema({
  caseNumber: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  status: { type: String, required: true },
  reporter: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Case', caseSchema);
