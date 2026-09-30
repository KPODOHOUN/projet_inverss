const { Resend } = require('resend');
const templates = require('./emailTemplates');
const path = require('path');
const fs = require('fs');

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.MAIL_FROM || 'noreply@imc.com';
const FROM_NAME = process.env.MAIL_FROM_NAME || 'IMC';

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

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

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

  // Transient network blips (DNS/connection hiccups right after boot or
  // after idle periods) occasionally fail the very first attempt — retry
  // once before giving up, since a verification/reset email that silently
  // never arrives is a real problem for the user.
  const attempts = 2;
  let lastErr;
  for (let i = 1; i <= attempts; i++) {
    try {
      const { data, error } = await resend.emails.send({
        from: `${FROM_NAME} <${FROM_EMAIL}>`,
        to: [to],
        subject,
        html,
        text
      });

      if (error) throw new Error(error.message || 'Failed to send email');
      return { success: true, id: data?.id };
    } catch (err) {
      lastErr = err;
      logError(`send [${to}] attempt ${i}/${attempts}`, err);
      if (i < attempts) await sleep(500);
    }
  }
  throw lastErr;
};

const sendWelcomeEmail = async (email, name) => {
  const { html, text } = templates.welcome(name);
  return send({ to: email, subject: 'Bienvenue sur IMC !', html, text });
};

const sendVerificationEmail = async (email, name, verificationLink) => {
  const { html, text } = templates.verifyEmail(name, verificationLink);
  return send({ to: email, subject: 'Vérifiez votre email - IMC', html, text });
};

const sendPasswordResetEmail = async (email, name, resetLink) => {
  const { html, text } = templates.passwordReset(name, resetLink);
  return send({ to: email, subject: 'Réinitialisation mot de passe - IMC', html, text });
};

const sendOTPEmail = async (email, name, otpCode, purpose = 'email_verification') => {
  const { html, text } = templates.otp(name, otpCode, purpose);
  const subjects = {
    email_verification: 'Code de vérification - IMC',
    login: 'Code de connexion - IMC',
    '2fa': "Code d'authentification - IMC",
    email_change: 'Code de changement d\'email - IMC',
    password_reset: 'Code de réinitialisation - IMC'
  };
  return send({ to: email, subject: subjects[purpose] || 'Code de vérification - IMC', html, text });
};

const sendInvestmentConfirmation = async (email, name, { amount, pack, roi, estimatedEarnings, reference }) => {
  const { html, text } = templates.investmentConfirmation(name, amount, pack, roi, estimatedEarnings, reference);
  return send({ to: email, subject: 'Investissement confirmé - IMC', html, text });
};

const sendWithdrawalConfirmation = async (email, name, { amount, method, reference }) => {
  const { html, text } = templates.withdrawalConfirmation(name, amount, method, reference);
  return send({ to: email, subject: 'Demande de retrait - IMC', html, text });
};

const sendNewProjectNotification = async (email, name, { title, description }) => {
  const { html, text } = templates.newProject(name, title, description);
  return send({ to: email, subject: `Nouveau projet : ${title} - IMC`, html, text });
};

const sendSecurityAlert = async (email, name, { device, ip, location, time }) => {
  const { html, text } = templates.securityAlert(name, device, ip, location, time);
  return send({ to: email, subject: 'Alerte de sécurité - IMC', html, text });
};

const sendPasswordChanged = async (email, name) => {
  const { html, text } = templates.passwordChanged(name);
  return send({ to: email, subject: 'Mot de passe modifié - IMC', html, text });
};

const sendEmailChanged = async (email, name, newEmail) => {
  const { html, text } = templates.emailChanged(name, newEmail);
  return send({ to: email, subject: 'Adresse email modifiée - IMC', html, text });
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
