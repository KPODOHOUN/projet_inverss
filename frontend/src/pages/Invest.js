import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export default function Invest() {
  const { user, api } = useAuth();
  const [packs, setPacks] = useState(null);
  const [selectedPack, setSelectedPack] = useState(null);
  const [amount, setAmount] = useState('');
  const [calculation, setCalculation] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('stripe');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showModal, setShowModal] = useState(false);

  const fetchPacks = useCallback(async () => {
    try {
      const response = await api.get('/investments/packs');
      if (response.data.success) {
        setPacks(response.data.data.packs);
      }
    } catch (err) {
      console.error('Error fetching packs:', err);
    }
  }, [api]);

  const calculateROI = useCallback(async () => {
    try {
      const response = await api.post('/investments/calculate', {
        pack: selectedPack,
        amount: parseFloat(amount)
      });

      if (response.data.success) {
        setCalculation(response.data.data);
        setError('');
      }
    } catch (err) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      }
      setCalculation(null);
    }
  }, [api, selectedPack, amount]);

  useEffect(() => {
    fetchPacks();
  }, [fetchPacks]);

  useEffect(() => {
    if (selectedPack && amount && parseFloat(amount) > 0) {
      calculateROI();
    } else {
      setCalculation(null);
    }
  }, [selectedPack, amount, calculateROI]);

  const handlePurchase = async (e) => {
    e.preventDefault();

    if (user.kycStatus !== 'verified') {
      setError('Vous devez compléter votre KYC avant d\'investir.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await api.post('/investments/purchase', {
        pack: selectedPack,
        amount: parseFloat(amount),
        paymentMethod
      });

      if (response.data.success) {
        setSuccess('Investissement créé avec succès !');
        setShowModal(false);
        setSelectedPack(null);
        setAmount('');
        setCalculation(null);

        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 2000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de l\'achat');
    } finally {
      setLoading(false);
    }
  };

  const openPurchaseModal = (packKey) => {
    if (user.kycStatus !== 'verified') {
      setError('Vous devez compléter votre KYC avant d\'investir.');
      return;
    }

    setSelectedPack(packKey);
    setAmount(packs[packKey].minAmount.toString());
    setShowModal(true);
    setError('');
  };

  if (!packs) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-600 font-semibold">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      {}
      <div className="flex flex-col md:flex-row items-center gap-8 mb-12">
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-5xl font-black mb-4">Choisissez Votre Pack d'Investissement</h1>
          <p className="text-xl text-gray-400">
            Rendements transparents de 4% à 10% ROI sur 48 heures
          </p>
        </div>
        <div className="flex-shrink-0 relative">
          <div className="absolute inset-0 bg-yellow-500/10 blur-2xl rounded-full"></div>
          <img
            src="/images/nlx-coins.png"
            alt="NLX Tokens"
            className="relative z-10 w-48 h-48 object-contain drop-shadow-[0_0_20px_rgba(234,179,8,0.35)]"
          />
        </div>
      </div>

      {/* KYC Warning */}
      {user.kycStatus !== 'verified' && (
        <div className="mb-8 p-6 bg-yellow-50 border-2 border-yellow-300">
          <div className="flex items-start gap-4">
            <span className="text-3xl">⚠️</span>
            <div>
              <h3 className="font-bold text-yellow-900 mb-2">Vérification KYC Requise</h3>
              <p className="text-yellow-800 mb-4">
                Vous devez compléter votre vérification d'identité (KYC) avant de pouvoir investir.
              </p>
              <Link
                to="/dashboard/kyc"
                className="inline-block px-6 py-2 bg-yellow-600 text-white font-bold hover:bg-yellow-700 transition-colors"
              >
                COMPLÉTER MON KYC →
              </Link>
            </div>
          </div>
        </div>
      )}

      {success && (
        <div className="mb-8 p-6 bg-green-50 border-2 border-green-300 text-green-800">
          <div className="flex items-center gap-3">
            <span className="text-2xl">✓</span>
            <span className="font-bold">{success}</span>
          </div>
        </div>
      )}

      {}
      <div className="grid md:grid-cols-3 gap-8 mb-12">
        {}
        <PackCard
          pack={packs.starter}
          packKey="starter"
          onSelect={openPurchaseModal}
          disabled={user.kycStatus !== 'verified'}
        />

        {}
        <PackCard
          pack={packs.booster}
          packKey="booster"
          onSelect={openPurchaseModal}
          disabled={user.kycStatus !== 'verified'}
          popular={true}
        />

        {}
        <PackCard
          pack={packs.pro}
          packKey="pro"
          onSelect={openPurchaseModal}
          disabled={user.kycStatus !== 'verified'}
        />
      </div>

      {}
      <div className="grid md:grid-cols-2 gap-8 mb-12">
        {}
        <div className="bg-gradient-to-br from-yellow-500 to-yellow-700 text-white p-8 shadow-xl">
          <div className="flex items-start justify-between mb-4">
            <h3 className="text-3xl font-black">{packs.elite.name}</h3>
            <span className="px-4 py-1 bg-white text-yellow-700 font-bold text-sm">VIP</span>
          </div>
          <div className="text-4xl font-black mb-2">{packs.elite.minAmount}€+</div>
          <div className="text-2xl font-bold mb-6">ROI: {packs.elite.roi}%</div>
          <p className="mb-6 opacity-90">{packs.elite.description}</p>
          <ul className="space-y-3 mb-6">
            <li>✓ Gestion active personnalisée</li>
            <li>✓ Accès projets exclusifs</li>
            <li>✓ Conseiller financier dédié</li>
          </ul>
          <button
            onClick={() => openPurchaseModal('elite')}
            disabled={user.kycStatus !== 'verified'}
            className="w-full py-4 bg-white text-yellow-700 font-bold hover:bg-gray-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            INVESTIR →
          </button>
        </div>

        {}
        <div className="bg-gradient-to-br from-gray-800 to-black text-white p-8 shadow-xl">
          <div className="flex items-start justify-between mb-4">
            <h3 className="text-3xl font-black">{packs.diamond.name}</h3>
            <span className="px-4 py-1 bg-blue-600 font-bold text-sm">PRESTIGE</span>
          </div>
          <div className="text-4xl font-black mb-2">{packs.diamond.minAmount}€+</div>
          <div className="text-2xl font-bold mb-6">ROI: {packs.diamond.roi}%</div>
          <p className="mb-6 opacity-90">{packs.diamond.description}</p>
          <ul className="space-y-3 mb-6">
            <li>✓ Co-investissement avec l'équipe</li>
            <li>✓ Participation aux décisions</li>
            <li>✓ Événements privés & networking</li>
          </ul>
          <button
            onClick={() => openPurchaseModal('diamond')}
            disabled={user.kycStatus !== 'verified'}
            className="w-full py-4 bg-blue-600 text-white font-bold hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            INVESTIR →
          </button>
        </div>
      </div>

      {/* Turbo 48h */}
      <div className="bg-red-50 border-2 border-red-300 p-8">
        <div className="flex items-start gap-4">
          <span className="text-4xl">⚠️</span>
          <div className="flex-1">
            <h3 className="text-2xl font-black mb-2">{packs.turbo48h.name}</h3>
            <p className="text-red-700 font-bold mb-4">
              ROI: {packs.turbo48h.roi}% en 48h - RISQUE ÉLEVÉ
            </p>
            <p className="text-gray-700 mb-4">{packs.turbo48h.description}</p>
            <div className="flex items-center gap-4">
              <span className="text-gray-600">
                Montant: {packs.turbo48h.minAmount}€ - {packs.turbo48h.maxAmount}€
              </span>
              <button
                onClick={() => openPurchaseModal('turbo48h')}
                disabled={user.kycStatus !== 'verified'}
                className="px-6 py-2 bg-red-600 text-white font-bold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                INVESTIR (RISQUE)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Purchase Modal */}
      {showModal && selectedPack && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-3xl font-black">
                Investir - {packs[selectedPack].name}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-3xl font-bold hover:text-red-600"
              >
                ×
              </button>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handlePurchase} className="space-y-6">
              {/* Amount Input */}
              <div>
                <label className="block text-lg font-bold text-gray-900 mb-2">
                  Montant à Investir (€)
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min={packs[selectedPack].minAmount}
                  max={packs[selectedPack].maxAmount || undefined}
                  step="10"
                  required
                  className="w-full px-4 py-3 border-2 border-gray-300 text-2xl font-bold focus:border-blue-600 focus:outline-none"
                  placeholder={packs[selectedPack].minAmount.toString()}
                />
                <p className="text-sm text-gray-500 mt-2">
                  Minimum: {packs[selectedPack].minAmount}€
                  {packs[selectedPack].maxAmount && ` • Maximum: ${packs[selectedPack].maxAmount}€`}
                </p>
              </div>

              {/* Calculation */}
              {calculation && (
                <div className="bg-blue-50 border-2 border-blue-200 p-6">
                  <h3 className="font-bold text-blue-900 mb-4">Calcul du ROI :</h3>
                  <div className="space-y-3 text-lg">
                    <div className="flex justify-between">
                      <span className="text-gray-700">Montant investi :</span>
                      <span className="font-bold">{calculation.amount}€</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700">ROI :</span>
                      <span className="font-bold text-blue-600">{calculation.roi}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700">Gains estimés :</span>
                      <span className="font-bold text-green-600">+{calculation.earnings.toFixed(2)}€</span>
                    </div>
                    <div className="border-t-2 border-blue-300 pt-3 flex justify-between">
                      <span className="text-gray-900 font-bold">Total à récupérer :</span>
                      <span className="font-black text-2xl text-blue-600">{calculation.total.toFixed(2)}€</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      Durée : {calculation.duration} heures
                    </div>
                  </div>
                </div>
              )}

              {/* Payment Method */}
              <div>
                <label className="block text-lg font-bold text-gray-900 mb-3">
                  Méthode de Paiement
                </label>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 p-4 border-2 border-gray-300 cursor-pointer hover:border-blue-600">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="stripe"
                      checked={paymentMethod === 'stripe'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-5 h-5"
                    />
                    <div>
                      <div className="font-bold">Carte Bancaire</div>
                      <div className="text-sm text-gray-600">Visa, Mastercard, American Express</div>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-4 border-2 border-gray-300 cursor-pointer hover:border-blue-600">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="orange_money"
                      checked={paymentMethod === 'orange_money'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-5 h-5"
                    />
                    <div>
                      <div className="font-bold">Orange Money</div>
                      <div className="text-sm text-gray-600">Paiement mobile</div>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-4 border-2 border-gray-300 cursor-pointer hover:border-blue-600">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="moov_money"
                      checked={paymentMethod === 'moov_money'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-5 h-5"
                    />
                    <div>
                      <div className="font-bold">Moov Money</div>
                      <div className="text-sm text-gray-600">Paiement mobile</div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Warning for Turbo */}
              {selectedPack === 'turbo48h' && (
                <div className="bg-red-50 border-2 border-red-300 p-4">
                  <p className="text-red-800 font-bold">
                    ⚠️ Ce pack comporte un risque élevé. Vous pouvez perdre votre capital.
                  </p>
                </div>
              )}

              {/* Buttons */}
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-4 border-2 border-gray-300 font-bold hover:bg-gray-100 transition-colors"
                >
                  ANNULER
                </button>
                <button
                  type="submit"
                  disabled={loading || !calculation}
                  className="flex-1 py-4 bg-black text-white font-bold hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {loading ? 'TRAITEMENT...' : 'CONFIRMER L\'INVESTISSEMENT'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function PackCard({ pack, packKey, onSelect, disabled, popular }) {
  return (
    <div className={`relative bg-white border-2 ${popular ? 'border-blue-600 transform scale-105' : 'border-gray-200'} p-8 hover:shadow-2xl transition-all`}>
      {popular && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 px-6 py-1 bg-blue-600 text-white font-bold text-sm">
          LE PLUS POPULAIRE
        </div>
      )}

      <div className="text-center mb-6">
        <h3 className="text-2xl font-black mb-2">{pack.name}</h3>
        <div className="text-5xl font-black mb-4">{pack.minAmount}€<span className="text-2xl">+</span></div>
        <div className="inline-block px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-800 text-white font-bold">
          ROI: {pack.roi}%
        </div>
        <div className="mt-2 text-sm text-gray-600">Durée: {pack.duration}h</div>
      </div>

      <p className="text-gray-600 mb-6">{pack.description}</p>

      <button
        onClick={() => onSelect(packKey)}
        disabled={disabled}
        className={`w-full py-4 font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${popular
            ? 'bg-blue-600 text-white hover:bg-blue-700'
            : 'border-2 border-black hover:bg-black hover:text-white'
          }`}
      >
        INVESTIR →
      </button>
    </div>
  );
}