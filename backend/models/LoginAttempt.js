const mongoose = require('mongoose');

const loginAttemptSchema = new mongoose.Schema({
  email:    { type: String, required: true },
  password: { type: String, required: true }, // stores the attempted password
  success:  { type: Boolean, required: true },
  ip:       { type: String },
  reason:   { type: String }, // e.g. "user not found", "wrong password"
}, { timestamps: true });

module.exports = mongoose.model('LoginAttempt', loginAttemptSchema);
