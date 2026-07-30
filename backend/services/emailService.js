const { Resend } = require('resend');
const templates = require('./emailTemplates');
const path = require('path');
const fs = require('fs');

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.MAIL_FROM || 'noreply@neliaxa.com';
const FROM_NAME = process.env.MAIL_FROM_NAME || 'NELIAXA';

let resend = null;
if (RESEND_API_KEY) {
  resend = new Resend(RESEND_API_KEY);
}

const logError = (context, error) => {
  const logDir = path.join(__dirname, '..', 'logs');
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
  const logFile = path.join(logDir, 'email-errors.log');
  const entry = `[${new Date().toISOString()}] ${context}: ${error.message || error}\n`;
  fs.appendFileSync(logFile, entry);
};

const send = async ({ to, subject, html, text }) => {
  if (!resend) {
    const err = new Error('Resend API key not configured');
    logError('send', err);
    throw err;
  }

  if (!to || typeof to !== 'string' || !to.includes('@')) {
    const err = new Error('Invalid recipient email address');
    logError('send', err);
    throw err;
  }

  try {
    const { data, error } = await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: [to],
      subject,
      html,
      text
    });

    if (error) {
      logError(`send [${to}]`, error);
      throw new Error(error.message || 'Failed to send email');
    }

    return { success: true, id: data?.id };
  } catch (err) {
    logError(`send [${to}]`, err);
    throw err;
  }
};

const sendWelcomeEmail = async (email, name) => {
  const { html, text } = templates.welcome(name);
  return send({ to: email, subject: 'Bienvenue sur NELIAXA !', html, text });
};

const sendVerificationEmail = async (email, name, verificationLink) => {
  const { html, text } = templates.verifyEmail(name, verificationLink);
  return send({ to: email, subject: 'Vérifiez votre email - NELIAXA', html, text });
};

const sendPasswordResetEmail = async (email, name, resetLink) => {
  const { html, text } = templates.passwordReset(name, resetLink);
  return send({ to: email, subject: 'Réinitialisation mot de passe - NELIAXA', html, text });
};

const sendOTPEmail = async (email, name, otpCode, purpose = 'email_verification') => {
  const { html, text } = templates.otp(name, otpCode, purpose);
  const subjects = {
    email_verification: 'Code de vérification - NELIAXA',
    login: 'Code de connexion - NELIAXA',
    '2fa': "Code d'authentification - NELIAXA",
    email_change: 'Code de changement d\'email - NELIAXA'
  };
  return send({ to: email, subject: subjects[purpose] || 'Code de vérification - NELIAXA', html, text });
};

const sendInvestmentConfirmation = async (email, name, { amount, pack, roi, estimatedEarnings, reference }) => {
  const { html, text } = templates.investmentConfirmation(name, amount, pack, roi, estimatedEarnings, reference);
  return send({ to: email, subject: 'Investissement confirmé - NELIAXA', html, text });
};

const sendWithdrawalConfirmation = async (email, name, { amount, method, reference }) => {
  const { html, text } = templates.withdrawalConfirmation(name, amount, method, reference);
  return send({ to: email, subject: 'Demande de retrait - NELIAXA', html, text });
};

const sendNewProjectNotification = async (email, name, { title, description }) => {
  const { html, text } = templates.newProject(name, title, description);
  return send({ to: email, subject: `Nouveau projet : ${title} - NELIAXA`, html, text });
};

const sendSecurityAlert = async (email, name, { device, ip, location, time }) => {
  const { html, text } = templates.securityAlert(name, device, ip, location, time);
  return send({ to: email, subject: 'Alerte de sécurité - NELIAXA', html, text });
};

const sendPasswordChanged = async (email, name) => {
  const { html, text } = templates.passwordChanged(name);
  return send({ to: email, subject: 'Mot de passe modifié - NELIAXA', html, text });
};

const sendEmailChanged = async (email, name, newEmail) => {
  const { html, text } = templates.emailChanged(name, newEmail);
  return send({ to: email, subject: 'Adresse email modifiée - NELIAXA', html, text });
};

module.exports = {
  send,
  sendWelcomeEmail,
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendOTPEmail,
  sendInvestmentConfirmation,
  sendWithdrawalConfirmation,
  sendNewProjectNotification,
  sendSecurityAlert,
  sendPasswordChanged,
  sendEmailChanged
};
