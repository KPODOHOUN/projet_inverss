import React, { useState, useEffect } from 'react';
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
    <div className="bg-white p-6 border border-gray-200 shadow-sm">
      <h3 className="text-xl font-bold mb-4">
        Authentification à deux facteurs (2FA)
      </h3>

      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 text-sm">
          {success}
        </div>
      )}

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      {step === 'initial' && (
        <div>
          {user?.twoFactorEnabled ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200">
                <span className="text-2xl">✓</span>
                <div>
                  <p className="font-bold text-green-800">2FA activé</p>
                  <p className="text-sm text-green-700">
                    Votre compte est protégé par l'authentification à deux facteurs
                  </p>
                </div>
              </div>

              <form onSubmit={handleDisable} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    MOT DE PASSE (pour désactiver)
                  </label>
                  <input
                    type="password"
                    value={disablePassword}
                    onChange={(e) => setDisablePassword(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 focus:border-blue-600 focus:outline-none"
                    placeholder="Votre mot de passe"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 border-2 border-red-600 text-red-600 font-bold hover:bg-red-50 transition-colors disabled:opacity-50"
                >
                  {loading ? 'DÉSACTIVATION...' : 'DÉSACTIVER 2FA'}
                </button>
              </form>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-200">
                <p className="text-sm text-blue-800">
                  <strong>Recommandé :</strong> Activez l'authentification à deux facteurs
                  pour une sécurité renforcée de votre compte.
                </p>
              </div>

              <div className="space-y-2 text-sm text-gray-700">
                <p><strong>Avantages :</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Protection supplémentaire contre les accès non autorisés</li>
                  <li>Code unique généré toutes les 30 secondes</li>
                  <li>Compatible avec Google Authenticator, Authy, etc.</li>
                </ul>
              </div>

              <button
                onClick={handleSetup}
                disabled={loading}
                className="px-6 py-3 bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors disabled:opacity-50"
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
            <h4 className="font-bold mb-4">Étape 1 : Scannez le QR Code</h4>
            <p className="text-sm text-gray-600 mb-4">
              Utilisez une application d'authentification (Google Authenticator, Authy, etc.)
              pour scanner ce QR code :
            </p>

            {qrCode && (
              <div className="flex justify-center p-4 bg-gray-50 border border-gray-200">
                <img src={qrCode} alt="QR Code 2FA" className="max-w-xs" />
              </div>
            )}
          </div>

          <div>
            <h4 className="font-bold mb-2">Ou entrez ce code manuellement :</h4>
            <div className="p-3 bg-gray-100 font-mono text-sm break-all border border-gray-300">
              {secret}
            </div>
          </div>

          <div>
            <h4 className="font-bold mb-4">Étape 2 : Vérifiez le code</h4>
            <form onSubmit={handleVerify} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  CODE DE VÉRIFICATION
                </label>
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                  className="w-full px-4 py-3 border border-gray-300 focus:border-blue-600 focus:outline-none text-center text-2xl font-mono tracking-widest"
                  placeholder="000000"
                  maxLength={6}
                  required
                />
                <p className="mt-2 text-xs text-gray-500">
                  Entrez le code à 6 chiffres affiché dans votre application
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={loading || verificationCode.length !== 6}
                  className="flex-1 py-3 bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors disabled:opacity-50"
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
                  className="px-6 py-3 border-2 border-gray-300 font-bold hover:bg-gray-50 transition-colors"
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