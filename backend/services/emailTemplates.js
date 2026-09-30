const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
const CURRENT_YEAR = new Date().getFullYear();

const baseHtml = (content) => `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>IMC</title>
  <style>
    @media only screen and (max-width: 600px) {
      .container { padding: 20px 10px !important; }
      .card { padding: 24px 16px !important; }
      .otp-code { font-size: 32px !important; letter-spacing: 8px !important; }
      .btn { display: block !important; width: 100% !important; text-align: center !important; }
      .features { flex-direction: column !important; }
      .feature { min-width: auto !important; }
    }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background: #050505; margin: 0; padding: 0; -webkit-font-smoothing: antialiased; }
    .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
    .card { background: linear-gradient(135deg, #0d0d0d, #1a1a1a); border: 1px solid rgba(212, 175, 55, 0.2); border-radius: 12px; padding: 40px; }
    .logo { text-align: center; margin-bottom: 30px; }
    .logo h1 { color: #D4AF37; font-size: 24px; margin: 0; letter-spacing: 4px; font-weight: 900; }
    .logo span { color: #666; font-size: 11px; letter-spacing: 6px; text-transform: uppercase; }
    h2 { color: #ffffff; font-size: 22px; margin: 0 0 8px; font-weight: 700; }
    .subtitle { color: #9ca3af; font-size: 14px; margin: 0 0 24px; line-height: 1.6; }
    p { color: #9ca3af; font-size: 14px; line-height: 1.7; margin: 0 0 16px; }
    .text-center { text-align: center; }
    .btn { display: inline-block; background: linear-gradient(135deg, #D4AF37, #B8860B); color: #000000; font-weight: 900; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 14px; letter-spacing: 2px; text-transform: uppercase; border: none; cursor: pointer; }
    .btn:hover { background: linear-gradient(135deg, #e0b940, #c9950a); }
    .divider { height: 1px; background: linear-gradient(to right, transparent, rgba(212, 175, 55, 0.3), transparent); margin: 24px 0; }
    .footer { text-align: center; margin-top: 30px; padding-top: 20px; }
    .footer p { font-size: 12px; color: #6b7280; margin: 4px 0; }
    .footer a { color: #D4AF37; text-decoration: none; }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="logo">
        <h1>IMC</h1>
        <span>Corporation</span>
      </div>
      ${content}
    </div>
    <div class="footer">
      <p>&copy; ${CURRENT_YEAR} IMC Corporation. Tous droits réservés.</p>
      <p>Ceci est un email automatique, merci de ne pas y répondre.</p>
    </div>
  </div>
</body>
</html>`;

const wrap = (htmlContent) => ({ html: baseHtml(htmlContent) });

const welcome = (name) => {
  const htmlContent = `
    <h2 class="text-center">Bienvenue ${name} !</h2>
    <p class="text-center subtitle">Votre compte investisseur a été créé avec succès.</p>
    <div class="divider"></div>
    <p>Bonjour ${name},</p>
    <p>Nous sommes ravis de vous accueillir sur IMC. Votre plateforme d'investissement intelligente est désormais active.</p>
    <div style="display:flex;justify-content:center;gap:16px;margin:24px 0;flex-wrap:wrap;">
      <div style="text-align:center;padding:16px;background:rgba(212,175,55,0.05);border-radius:8px;flex:1;min-width:100px;">
        <div style="font-size:28px;margin-bottom:4px;">📊</div>
        <div style="color:#D4AF37;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;">Investissement</div>
      </div>
      <div style="text-align:center;padding:16px;background:rgba(212,175,55,0.05);border-radius:8px;flex:1;min-width:100px;">
        <div style="font-size:28px;margin-bottom:4px;">🎓</div>
        <div style="color:#D4AF37;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;">Académie</div>
      </div>
      <div style="text-align:center;padding:16px;background:rgba(212,175,55,0.05);border-radius:8px;flex:1;min-width:100px;">
        <div style="font-size:28px;margin-bottom:4px;">👥</div>
        <div style="color:#D4AF37;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;">Parrainage</div>
      </div>
    </div>
    <p>Connectez-vous dès maintenant pour commencer à investir intelligemment.</p>
    <div class="text-center" style="margin:24px 0;">
      <a href="${FRONTEND_URL}/login" class="btn">Se connecter</a>
    </div>`;
  return {
    html: baseHtml(htmlContent),
    text: `Bienvenue ${name} sur IMC !\n\nVotre compte investisseur a été créé avec succès.\n\nAccédez à votre espace : ${FRONTEND_URL}/login\n\nL'équipe IMC`
  };
};

const verifyEmail = (name, verificationLink) => {
  const htmlContent = `
    <h2 class="text-center">Vérifiez votre email</h2>
    <p class="text-center subtitle">Confirmez votre adresse email pour activer votre compte.</p>
    <div class="divider"></div>
    <p>Bonjour ${name},</p>
    <p>Merci d'avoir créé un compte sur IMC. Pour activer votre compte, veuillez confirmer votre adresse email en cliquant sur le bouton ci-dessous :</p>
    <div class="text-center" style="margin:24px 0;">
      <a href="${verificationLink}" class="btn">Vérifier mon email</a>
    </div>
    <p style="color:#6b7280;font-size:12px;">Ce lien expire dans <strong>24 heures</strong>.</p>
    <p style="color:#6b7280;font-size:12px;">Si vous n'avez pas créé de compte, ignorez cet email.</p>`;
  return {
    html: baseHtml(htmlContent),
    text: `Bonjour ${name},\n\nMerci d'avoir créé un compte sur IMC. Confirmez votre email en cliquant sur ce lien :\n${verificationLink}\n\nCe lien expire dans 24 heures.\n\nSi vous n'avez pas créé de compte, ignorez cet email.`
  };
};

const passwordReset = (name, resetLink) => {
  const htmlContent = `
    <h2 class="text-center">Réinitialisation mot de passe</h2>
    <p class="text-center subtitle">Vous avez demandé la réinitialisation de votre mot de passe.</p>
    <div class="divider"></div>
    <p>Bonjour ${name},</p>
    <p>Cliquez sur le bouton ci-dessous pour réinitialiser votre mot de passe :</p>
    <div class="text-center" style="margin:24px 0;">
      <a href="${resetLink}" class="btn">Réinitialiser</a>
    </div>
    <p style="color:#6b7280;font-size:12px;">Ce lien expire dans <strong>1 heure</strong>.</p>
    <p style="color:#6b7280;font-size:12px;">Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.</p>`;
  return {
    html: baseHtml(htmlContent),
    text: `Bonjour ${name},\n\nVous avez demandé la réinitialisation de votre mot de passe.\n\nCliquez sur ce lien : ${resetLink}\n\nCe lien expire dans 1 heure.\n\nSi vous n'avez pas demandé cette réinitialisation, ignorez cet email.`
  };
};

const otp = (name, otpCode, purpose) => {
  const titles = {
    email_verification: 'Code de vérification',
    login: 'Code de connexion',
    '2fa': 'Code d\'authentification',
    email_change: 'Code de changement d\'email',
    password_reset: 'Code de réinitialisation'
  };
  const title = titles[purpose] || 'Code de vérification';
  const htmlContent = `
    <h2 class="text-center">${title}</h2>
    <p class="text-center subtitle">Utilisez le code ci-dessous pour finaliser votre action.</p>
    <div class="divider"></div>
    <p>Bonjour ${name},</p>
    <p>Voici votre code de vérification :</p>
    <div style="background:rgba(212,175,55,0.1);border:2px dashed rgba(212,175,55,0.4);border-radius:12px;padding:20px;text-align:center;margin:24px 0;">
      <div style="font-size:42px;font-weight:900;letter-spacing:12px;color:#D4AF37;font-family:monospace;">${otpCode}</div>
    </div>
    <p style="color:#6b7280;font-size:12px;">Ce code expire dans <strong>10 minutes</strong>.</p>
    <p style="color:#6b7280;font-size:12px;">Si vous n'êtes pas à l'origine de cette action, ignorez cet email.</p>`;
  return {
    html: baseHtml(htmlContent),
    text: `Bonjour ${name},\n\nVotre code de vérification est : ${otpCode}\n\nCe code expire dans 10 minutes.\n\nSi vous n'êtes pas à l'origine de cette action, ignorez cet email.`
  };
};

const investmentConfirmation = (name, amount, pack, roi, estimatedEarnings, reference) => {
  const htmlContent = `
    <h2 class="text-center">Investissement confirmé</h2>
    <p class="text-center subtitle">Votre investissement a été validé avec succès.</p>
    <div class="divider"></div>
    <p>Bonjour ${name},</p>
    <p>Votre investissement a été confirmé. Voici les détails :</p>
    <div style="background:rgba(212,175,55,0.05);border-radius:8px;padding:20px;margin:20px 0;">
      <table style="width:100%;border-collapse:collapse;">
        <tr><td style="color:#9ca3af;padding:8px 0;font-size:13px;">Pack</td><td style="color:#fff;padding:8px 0;font-size:13px;text-align:right;font-weight:600;">${pack}</td></tr>
        <tr><td style="color:#9ca3af;padding:8px 0;font-size:13px;">Montant</td><td style="color:#D4AF37;padding:8px 0;font-size:13px;text-align:right;font-weight:700;">${Number(amount).toFixed(2)} USD</td></tr>
        <tr><td style="color:#9ca3af;padding:8px 0;font-size:13px;">ROI</td><td style="color:#fff;padding:8px 0;font-size:13px;text-align:right;">${roi}%</td></tr>
        <tr><td style="color:#9ca3af;padding:8px 0;font-size:13px;">Estimation gains</td><td style="color:#D4AF37;padding:8px 0;font-size:13px;text-align:right;font-weight:700;">${Number(estimatedEarnings).toFixed(2)} USD</td></tr>
        <tr><td style="color:#9ca3af;padding:8px 0;font-size:13px;border-bottom:none;">Référence</td><td style="color:#6b7280;padding:8px 0;font-size:11px;text-align:right;border-bottom:none;">${reference}</td></tr>
      </table>
    </div>
    <div class="text-center" style="margin:20px 0;">
      <a href="${FRONTEND_URL}/dashboard" class="btn">Voir mon investissement</a>
    </div>`;
  return {
    html: baseHtml(htmlContent),
    text: `Bonjour ${name},\n\nVotre investissement a été confirmé :\nPack: ${pack}\nMontant: ${Number(amount).toFixed(2)} USD\nROI: ${roi}%\nEstimation gains: ${Number(estimatedEarnings).toFixed(2)} USD\nRéférence: ${reference}\n\nSuivez votre investissement : ${FRONTEND_URL}/dashboard`
  };
};

const withdrawalConfirmation = (name, amount, method, reference) => {
  const htmlContent = `
    <h2 class="text-center">Retrait soumis</h2>
    <p class="text-center subtitle">Votre demande de retrait a été reçue et est en cours de traitement.</p>
    <div class="divider"></div>
    <p>Bonjour ${name},</p>
    <p>Votre demande de retrait a été soumise avec succès. Voici les détails :</p>
    <div style="background:rgba(212,175,55,0.05);border-radius:8px;padding:20px;margin:20px 0;">
      <table style="width:100%;border-collapse:collapse;">
        <tr><td style="color:#9ca3af;padding:8px 0;font-size:13px;">Montant</td><td style="color:#D4AF37;padding:8px 0;font-size:13px;text-align:right;font-weight:700;">${Number(amount).toFixed(2)} USD</td></tr>
        <tr><td style="color:#9ca3af;padding:8px 0;font-size:13px;">Méthode</td><td style="color:#fff;padding:8px 0;font-size:13px;text-align:right;text-transform:capitalize;">${method}</td></tr>
        <tr><td style="color:#9ca3af;padding:8px 0;font-size:13px;">Statut</td><td style="color:#fbbf24;padding:8px 0;font-size:13px;text-align:right;">En attente</td></tr>
        <tr><td style="color:#9ca3af;padding:8px 0;font-size:13px;border-bottom:none;">Référence</td><td style="color:#6b7280;padding:8px 0;font-size:11px;text-align:right;border-bottom:none;">${reference}</td></tr>
      </table>
    </div>
    <p style="color:#6b7280;font-size:12px;">Le traitement peut prendre jusqu'à 48 heures ouvrées.</p>`;
  return {
    html: baseHtml(htmlContent),
    text: `Bonjour ${name},\n\nVotre demande de retrait a été soumise :\nMontant: ${Number(amount).toFixed(2)} USD\nMéthode: ${method}\nStatut: En attente\nRéférence: ${reference}\n\nLe traitement peut prendre jusqu'à 48 heures.`
  };
};

const newProject = (name, projectTitle, projectDescription) => {
  const htmlContent = `
    <h2 class="text-center">Nouveau projet disponible</h2>
    <p class="text-center subtitle">Un nouveau projet d'investissement vient d'être publié.</p>
    <div class="divider"></div>
    <p>Bonjour ${name},</p>
    <p>Un nouveau projet est disponible sur IMC :</p>
    <div style="background:rgba(212,175,55,0.05);border-radius:8px;padding:20px;margin:20px 0;">
      <h3 style="color:#D4AF37;font-size:16px;margin:0 0 8px;">${projectTitle}</h3>
      <p style="color:#9ca3af;font-size:13px;margin:0;line-height:1.5;">${projectDescription}</p>
    </div>
    <div class="text-center" style="margin:20px 0;">
      <a href="${FRONTEND_URL}/invest" class="btn">Investir maintenant</a>
    </div>`;
  return {
    html: baseHtml(htmlContent),
    text: `Bonjour ${name},\n\nUn nouveau projet est disponible sur IMC :\n\n${projectTitle}\n${projectDescription}\n\nInvestissez maintenant : ${FRONTEND_URL}/invest`
  };
};

const securityAlert = (name, device, ip, location, time) => {
  const htmlContent = `
    <h2 class="text-center">Alerte de sécurité</h2>
    <p class="text-center subtitle">Une nouvelle connexion a été détectée sur votre compte.</p>
    <div class="divider"></div>
    <p>Bonjour ${name},</p>
    <p>Une connexion a été effectuée sur votre compte IMC :</p>
    <div style="background:rgba(212,175,55,0.05);border-radius:8px;padding:20px;margin:20px 0;">
      <table style="width:100%;border-collapse:collapse;">
        <tr><td style="color:#9ca3af;padding:6px 0;font-size:13px;">Appareil</td><td style="color:#fff;padding:6px 0;font-size:13px;text-align:right;">${device}</td></tr>
        <tr><td style="color:#9ca3af;padding:6px 0;font-size:13px;">Adresse IP</td><td style="color:#fff;padding:6px 0;font-size:13px;text-align:right;">${ip}</td></tr>
        <tr><td style="color:#9ca3af;padding:6px 0;font-size:13px;">Localisation</td><td style="color:#fff;padding:6px 0;font-size:13px;text-align:right;">${location}</td></tr>
        <tr><td style="color:#9ca3af;padding:6px 0;font-size:13px;border-bottom:none;">Date</td><td style="color:#fff;padding:6px 0;font-size:13px;text-align:right;border-bottom:none;">${time}</td></tr>
      </table>
    </div>
    <p style="color:#6b7280;font-size:12px;">Si c'était bien vous, ignorez cet email. Sinon, changez immédiatement votre mot de passe.</p>
    <div class="text-center" style="margin:20px 0;">
      <a href="${FRONTEND_URL}/profile" class="btn">Sécuriser mon compte</a>
    </div>`;
  return {
    html: baseHtml(htmlContent),
    text: `Alerte de sécurité - IMC\n\nBonjour ${name},\n\nUne nouvelle connexion a été détectée sur votre compte :\nAppareil: ${device}\nIP: ${ip}\nLocalisation: ${location}\nDate: ${time}\n\nSi c'était bien vous, ignorez cet email.\nSinon, changez immédiatement votre mot de passe : ${FRONTEND_URL}/profile`
  };
};

const passwordChanged = (name) => {
  const htmlContent = `
    <h2 class="text-center">Mot de passe modifié</h2>
    <p class="text-center subtitle">Votre mot de passe a été mis à jour avec succès.</p>
    <div class="divider"></div>
    <p>Bonjour ${name},</p>
    <p>Votre mot de passe IMC a été modifié avec succès.</p>
    <p>Si vous êtes à l'origine de cette modification, aucune action supplémentaire n'est nécessaire.</p>
    <p style="color:#6b7280;font-size:12px;">Si vous n'avez pas effectué cette modification, contactez immédiatement le support.</p>`;
  return {
    html: baseHtml(htmlContent),
    text: `Bonjour ${name},\n\nVotre mot de passe IMC a été modifié avec succès.\n\nSi vous n'avez pas effectué cette modification, contactez immédiatement le support.`
  };
};

const emailChanged = (name, newEmail) => {
  const htmlContent = `
    <h2 class="text-center">Adresse email modifiée</h2>
    <p class="text-center subtitle">Votre adresse email a été mise à jour.</p>
    <div class="divider"></div>
    <p>Bonjour ${name},</p>
    <p>L'adresse email associée à votre compte IMC a été modifiée avec succès.</p>
    <p>Nouvelle adresse : <strong style="color:#D4AF37;">${newEmail}</strong></p>
    <p>Si vous êtes à l'origine de cette modification, aucune action supplémentaire n'est nécessaire.</p>
    <p style="color:#6b7280;font-size:12px;">Si vous n'avez pas effectué cette modification, contactez immédiatement le support.</p>`;
  return {
    html: baseHtml(htmlContent),
    text: `Bonjour ${name},\n\nL'adresse email de votre compte IMC a été modifiée.\nNouvelle adresse : ${newEmail}\n\nSi vous n'avez pas effectué cette modification, contactez immédiatement le support.`
  };
};

module.exports = {
  welcome,
  verifyEmail,
  passwordReset,
  otp,
  investmentConfirmation,
  withdrawalConfirmation,
  newProject,
  securityAlert,
  passwordChanged,
  emailChanged
};
