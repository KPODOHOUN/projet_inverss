const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  role: { type: String, enum: ['user', 'assistant'], required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
}, { _id: false });

// One open conversation per logged-in user (anonymous visitors don't get a
// persisted conversation — nothing to tie it to, and nothing worth keeping
// once they close the tab). `escalated` is set once the assistant decides
// it can't help, so the admin logs/support inbox can be filtered to just
// the conversations a human actually needs to look at.
const supportConversationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  messages: [messageSchema],
  escalated: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('SupportConversation', supportConversationSchema);
