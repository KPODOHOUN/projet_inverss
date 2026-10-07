const SupportConversation = require('../models/SupportConversation');
const assistantService = require('../services/assistantService');
const { success, error } = require('../utils/response');

exports.sendMessage = async (req, res) => {
  try {
    const message = req.body.message?.trim();
    if (!message) return error(res, 'Message vide');
    if (message.length > 2000) return error(res, 'Message trop long');

    // Anonymous visitors (no account yet) still get an answer — just not a
    // persisted conversation, since there's no user to tie it to.
    let conversation = null;
    let history = [];
    if (req.user) {
      conversation = await SupportConversation.findOne({ userId: req.user._id });
      if (!conversation) conversation = new SupportConversation({ userId: req.user._id, messages: [] });
      history = conversation.messages;
    }

    const { reply, escalated, supportContactUrl } = await assistantService.sendMessage({ user: req.user, history, message });

    if (conversation) {
      conversation.messages.push({ role: 'user', content: message });
      conversation.messages.push({ role: 'assistant', content: reply });
      if (escalated) conversation.escalated = true;
      conversation.updatedAt = new Date();
      await conversation.save();
    }

    success(res, { reply, escalated, supportContactUrl });
  } catch (err) {
    error(res, err.message);
  }
};

exports.getHistory = async (req, res) => {
  try {
    const conversation = await SupportConversation.findOne({ userId: req.user._id });
    success(res, { messages: conversation?.messages || [] });
  } catch (err) {
    error(res, err.message);
  }
};
