const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['EmployeFIT', 'Revendeur', 'Client', 'Responsable'],  // Ajout des rôles
    default: 'Client',
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
  resetToken: String,
  expireToken: Date,
}, { timestamps: true }); // Ajout des timestamps pour enregistrer les dates de création et de mise à jour

module.exports = mongoose.model('user', UserSchema);
