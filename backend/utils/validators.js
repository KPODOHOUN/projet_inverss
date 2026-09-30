const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const isValidEmail = (email) => typeof email === 'string' && EMAIL_RE.test(email.trim());

// At least 8 chars, one letter and one number — strong enough for a
// financial platform without being so strict it locks real users out.
const isStrongPassword = (password) => {
  return typeof password === 'string'
    && password.length >= 8
    && /[a-zA-Z]/.test(password)
    && /[0-9]/.test(password);
};

const passwordRequirementsMessage = 'Le mot de passe doit contenir au moins 8 caractères, avec au moins une lettre et un chiffre';

module.exports = { isValidEmail, isStrongPassword, passwordRequirementsMessage };
