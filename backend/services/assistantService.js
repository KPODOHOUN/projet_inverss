const FAQ = require('../models/FAQ');
const Transaction = require('../models/Transaction');
const PlatformConfig = require('../models/PlatformConfig');

const API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';
const MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash-lite';
const ESCALATE_MARKER = '[ESCALATE]';

const SYSTEM_PROMPT = `Tu es l'assistant d'aide d'IMC Corporation, une plateforme d'investissement. Tu réponds UNIQUEMENT aux questions sur : le fonctionnement du compte, les dépôts, les retraits, l'investissement, le trading, le parrainage, la vérification (KYC) et l'académie de formation.

Règles strictes :
- Tu ne modifies JAMAIS un solde, ne valides JAMAIS un dépôt ou un retrait, et n'effectues AUCUNE opération financière. Tu expliques et informes uniquement.
- Base tes réponses sur la FAQ et les informations de compte fournies ci-dessous. Ne jamais inventer un fait précis (montant, délai, taux) qui n'est pas dans ce contexte.
- Si la question sort du périmètre de la plateforme, ou si tu ne peux pas résoudre le problème avec les informations disponibles, commence ta réponse par exactement "${ESCALATE_MARKER}" suivi d'une courte phrase expliquant que tu transmets au support.
- Réponds en français, de façon brève et directe.`;

const buildFaqContext = async () => {
  const faqs = await FAQ.find({ active: true }).sort({ category: 1, order: 1 });
  if (!faqs.length) return 'Aucune FAQ disponible pour le moment.';
  return faqs.map(f => `Q: ${f.question}\nR: ${f.answer}`).join('\n\n');
};

// Grounds the assistant in the user's actual, current account state instead
// of letting it guess — this is what lets it correctly answer something
// like "pourquoi mon dépôt n'est pas confirmé ?" from real data.
const buildAccountContext = async (user) => {
  if (!user) return "L'utilisateur n'est pas connecté — pas d'informations de compte disponibles.";
  const recentTx = await Transaction.find({ userId: user._id }).sort({ createdAt: -1 }).limit(5);
  const txLines = recentTx.length
    ? recentTx.map(t => `- ${t.type}, ${t.amount} USD, statut: ${t.status}, le ${t.createdAt.toISOString().slice(0, 10)}`).join('\n')
    : 'Aucune transaction.';
  return `Statut KYC: ${user.kycStatus}\nSolde disponible: ${user.balance} USD\nTransactions récentes:\n${txLines}`;
};

const sendMessage = async ({ user, history, message }) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('Assistant non configuré');

  const [faqContext, accountContext] = await Promise.all([buildFaqContext(), buildAccountContext(user)]);

  const contents = [
    ...history.map(m => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] })),
    { role: 'user', parts: [{ text: message }] }
  ];

  const res = await fetch(`${API_BASE}/${MODEL}:generateContent`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: `${SYSTEM_PROMPT}\n\n--- FAQ ---\n${faqContext}\n\n--- Compte de l'utilisateur ---\n${accountContext}` }] },
      contents,
      generationConfig: { maxOutputTokens: 500, temperature: 0.3 }
    }),
    signal: AbortSignal.timeout(20000)
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error?.message || `Assistant indisponible (${res.status})`);
  }

  const raw = data?.candidates?.[0]?.content?.parts?.map(p => p.text).join('') || '';
  const escalated = raw.startsWith(ESCALATE_MARKER);
  const reply = (escalated ? raw.slice(ESCALATE_MARKER.length) : raw).trim()
    || "Je ne peux pas résoudre ce problème automatiquement. Voulez-vous contacter notre service client ?";

  let supportContactUrl = null;
  if (escalated) {
    const config = await PlatformConfig.findOne();
    supportContactUrl = config?.supportContactUrl || `mailto:${config?.supportEmail || 'support@imc.com'}`;
  }

  return { reply, escalated, supportContactUrl };
};

module.exports = { sendMessage };
