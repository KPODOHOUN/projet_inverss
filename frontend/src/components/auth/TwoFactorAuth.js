import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

export default function TwoFactorAuth() {
  const { user, setup2FA, verify2FA, disable2FA } = useAuth();

  const [step, setStep] = useState('initial');
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [disablePassword, setDisablePassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSetup = async () => {
    setLoading(true);
    setError('');

    const result = await setup2FA();

    if (result.success) {
      setQrCode(result.data.data.qrCode);
      setSecret(result.data.data.secret);
      setStep('setup');
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await verify2FA(verificationCode);

    if (result.success) {
      setSuccess('2FA activé avec succès !');
      setStep('initial');
      setVerificationCode('');
      setTimeout(() => setSuccess(''), 3000);
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  const handleDisable = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await disable2FA(disablePassword);

    if (result.success) {
      setSuccess('2FA désactivé');
      setDisablePassword('');
      setTimeout(() => setSuccess(''), 3000);
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  return (
    <div className="relative bg-[#0a0a0a] border border-yellow-900/20 rounded-lg p-6">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-yellow-500/40 to-transparent" />
      <h3 className="text-lg font-black text-white tracking-wide mb-5">
        Authentification à deux facteurs (2FA)
      </h3>

      {success && (
        <div className="mb-4 p-3 bg-green-950/50 border border-green-800/50 text-green-300 text-sm rounded animate-fadeIn">
          {success}
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-950/50 border border-red-800/50 text-red-300 text-sm rounded animate-fadeIn">
          {error}
        </div>
      )}

      {step === 'initial' && (
        <div>
          {user?.twoFactorEnabled ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-green-950/30 border border-green-800/40 rounded">
                <span className="text-2xl">✓</span>
                <div>
                  <p className="font-bold text-green-400 text-sm">2FA activé</p>
                  <p className="text-xs text-green-300/80">
                    Votre compte est protégé par l'authentification à deux facteurs
                  </p>
                </div>
              </div>

              <form onSubmit={handleDisable} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-yellow-600 tracking-widest uppercase mb-2">
                    Mot de passe (pour désactiver)
                  </label>
                  <input
                    type="password"
                    value={disablePassword}
                    onChange={(e) => setDisablePassword(e.target.value)}
                    className="w-full px-4 py-3 bg-black/50 border border-yellow-900/30 text-white placeholder-gray-700 focus:border-red-600/60 focus:outline-none focus:ring-1 focus:ring-red-500/20 transition-all text-sm rounded"
                    placeholder="Votre mot de passe"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 border border-red-700 text-red-500 font-bold text-xs tracking-widest uppercase hover:bg-red-600 hover:text-white transition-all disabled:opacity-50 rounded"
                >
                  {loading ? 'DÉSACTIVATION...' : 'DÉSACTIVER 2FA'}
                </button>
              </form>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-yellow-900/10 border border-yellow-900/30 rounded">
                <p className="text-sm text-yellow-200/90">
                  <strong className="text-yellow-400">Recommandé :</strong> Activez l'authentification à deux facteurs
                  pour une sécurité renforcée de votre compte.
                </p>
              </div>

              <ul className="space-y-1.5 text-sm text-gray-400 list-disc list-inside ml-1">
                <li>Protection supplémentaire contre les accès non autorisés</li>
                <li>Code unique généré toutes les 30 secondes</li>
                <li>Compatible avec Google Authenticator, Authy, etc.</li>
              </ul>

              <button
                onClick={handleSetup}
                disabled={loading}
                className="px-6 py-3 font-black text-black text-xs tracking-widest uppercase rounded disabled:opacity-50 transition-all bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-400 bg-[length:200%_100%] hover:animate-gradient"
              >
                {loading ? 'CONFIGURATION...' : 'ACTIVER 2FA'}
              </button>
            </div>
          )}
        </div>
      )}

      {step === 'setup' && (
        <div className="space-y-6">
          <div>
            <h4 className="font-bold text-yellow-500 text-sm tracking-wide mb-3">Étape 1 : Scannez le QR Code</h4>
            <p className="text-sm text-gray-500 mb-4">
              Utilisez une application d'authentification (Google Authenticator, Authy, etc.)
              pour scanner ce QR code :
            </p>

            {qrCode && (
              <div className="flex justify-center p-4 bg-white border border-yellow-900/30 rounded">
                <img src={qrCode} alt="QR Code 2FA" className="max-w-xs" />
              </div>
            )}
          </div>

          <div>
            <h4 className="font-bold text-yellow-500 text-sm tracking-wide mb-2">Ou entrez ce code manuellement :</h4>
            <div className="p-3 bg-black/50 font-mono text-sm text-gray-300 break-all border border-yellow-900/30 rounded">
              {secret}
            </div>
          </div>

          <div>
            <h4 className="font-bold text-yellow-500 text-sm tracking-wide mb-3">Étape 2 : Vérifiez le code</h4>
            <form onSubmit={handleVerify} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-yellow-600 tracking-widest uppercase mb-2">
                  Code de vérification
                </label>
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                  className="w-full px-4 py-3 bg-black/50 border border-yellow-900/30 text-white focus:border-yellow-500/60 focus:outline-none text-center text-2xl font-mono tracking-widest rounded"
                  placeholder="000000"
                  maxLength={6}
                  required
                />
                <p className="mt-2 text-xs text-gray-600">
                  Entrez le code à 6 chiffres affiché dans votre application
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={loading || verificationCode.length !== 6}
                  className="flex-1 py-3 font-black text-black text-xs tracking-widest uppercase rounded disabled:opacity-50 transition-all bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-400 bg-[length:200%_100%] hover:animate-gradient"
                >
                  {loading ? 'VÉRIFICATION...' : 'VÉRIFIER ET ACTIVER'}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setStep('initial');
                    setVerificationCode('');
                    setError('');
                  }}
                  className="px-6 py-3 border border-yellow-900/30 text-gray-400 font-bold text-xs tracking-widest uppercase hover:border-yellow-600 hover:text-yellow-500 transition-all rounded"
                >
                  ANNULER
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
