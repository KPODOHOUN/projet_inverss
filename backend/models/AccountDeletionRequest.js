const mongoose = require('mongoose');

// A user's own request to delete their account — reviewed by an admin
// (approve -> account is anonymized/deleted, reject -> stays as-is) rather
// than deleting on the spot, so a moment of frustration or a compromised
// session can't nuke an account unilaterally. An admin can still delete a
// user directly without one of these existing (see deleteUserDirect).
const schema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reason: { type: String, default: '' },
  status: { type: String, enum: ['pending', 'approved', 'rejected', 'cancelled'], default: 'pending' },
  rejectionReason: { type: String, default: '' },
  requestedAt: { type: Date, default: Date.now },
  reviewedAt: { type: Date },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

schema.index({ userId: 1, status: 1 });

module.exports = mongoose.model('AccountDeletionRequest', schema);
