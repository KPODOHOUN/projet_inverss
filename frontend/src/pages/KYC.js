import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function KYC() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [kycStatus, setKycStatus] = useState(null);
  
  const [files, setFiles] = useState({
    idDocument: null,
    selfie: null
  });

  const [previews, setPreviews] = useState({
    idDocument: null,
    selfie: null
  });

  useEffect(() => {
    fetchKYCStatus();
  }, []);

  const fetchKYCStatus = async () => {
    try {
      const token = localStorage.getItem('neliaxaToken');
      const response = await fetch('http://localhost:5000/api/kyc/status', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      if (data.success) {
        setKycStatus(data.data);
      }
    } catch (err) {
      console.error('Error fetching KYC status:', err);
    }
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('Le fichier ne doit pas dépasser 5MB');
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      setError('Seuls les fichiers JPEG, PNG et PDF sont autorisés');
      return;
    }

    setFiles(prev => ({ ...prev, [type]: file }));

    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviews(prev => ({ ...prev, [type]: reader.result }));
      };
      reader.readAsDataURL(file);
    } else {
      setPreviews(prev => ({ ...prev, [type]: null }));
    }

    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!files.idDocument || !files.selfie) {
      setError('Veuillez télécharger les deux documents');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('idDocument', files.idDocument);
      formData.append('selfie', files.selfie);

      const token = localStorage.getItem('neliaxaToken');
      const response = await fetch('http://localhost:5000/api/kyc/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('Documents téléchargés avec succès ! Vérification en cours...');
        setTimeout(() => {
          fetchKYCStatus();
        }, 2000);
      } else {
        setError(data.message || 'Erreur lors du téléchargement');
      }
    } catch (err) {
      console.error('KYC upload error:', err);
      setError('Erreur lors du téléchargement des documents');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: {
        bg: 'bg-yellow-100',
        text: 'text-yellow-800',
        border: 'border-yellow-300',
        label: 'En attente',
        icon: '⏳'
      },
      verified: {
        bg: 'bg-green-100',
        text: 'text-green-800',
        border: 'border-green-300',
        label: 'Vérifié',
        icon: '✓'
      },
      rejected: {
        bg: 'bg-red-100',
        text: 'text-red-800',
        border: 'border-red-300',
        label: 'Rejeté',
        icon: '✗'
      }
    };

    const badge = badges[status] || badges.pending;

    return (
      <div className={`inline-flex items-center gap-2 px-4 py-2 ${badge.bg} ${badge.text} border-2 ${badge.border} font-bold`}>
        <span className="text-xl">{badge.icon}</span>
        <span>{badge.label}</span>
      </div>
    );
  };

  if (kycStatus?.kycStatus === 'verified') {
    return (
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="text-center space-y-6">
          <div className="text-6xl">✅</div>
          <h2 className="text-3xl font-black">KYC Vérifié !</h2>
          <p className="text-gray-600">
            Votre identité a été vérifiée avec succès. Vous pouvez maintenant accéder à toutes les fonctionnalités.
          </p>
          {getStatusBadge('verified')}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-black mb-4">Vérification d'Identité (KYC)</h1>
          <p className="text-gray-600 text-lg">
            Pour des raisons de sécurité et de conformité, nous devons vérifier votre identité avant que vous puissiez investir.
          </p>
        </div>

        {kycStatus && (
          <div className="bg-white border-2 border-gray-200 p-6">
            <h3 className="text-xl font-bold mb-4">Statut Actuel</h3>
            <div className="space-y-4">
              {getStatusBadge(kycStatus.kycStatus)}
              
              {kycStatus.kycStatus === 'pending' && (
                <p className="text-gray-600">
                  Vos documents sont en cours de vérification. Cela peut prendre jusqu'à 24 heures.
                </p>
              )}

              {kycStatus.kycStatus === 'rejected' && kycStatus.rejectionReason && (
                <div className="p-4 bg-red-50 border border-red-200">
                  <p className="text-red-800 font-semibold mb-2">Raison du rejet :</p>
                  <p className="text-red-700">{kycStatus.rejectionReason}</p>
                  <p className="text-red-600 text-sm mt-2">
                    Veuillez soumettre de nouveaux documents en suivant les instructions ci-dessous.
                  </p>
                </div>
              )}

              {kycStatus.kycDocuments && (
                <div className="text-sm text-gray-500">
                  Documents soumis le : {new Date(kycStatus.kycDocuments.uploadedAt).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {(!kycStatus || kycStatus.kycStatus === 'rejected') && (
          <div className="bg-white border-2 border-gray-200 p-8">
            <h3 className="text-2xl font-bold mb-6">Télécharger vos Documents</h3>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700">
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              <div>
                <label className="block text-lg font-bold text-gray-900 mb-3">
                  1. Pièce d'Identité *
                </label>
                <p className="text-gray-600 mb-4">
                  Carte d'identité nationale, passeport ou permis de conduire (recto-verso)
                </p>
                
                <div className="border-2 border-dashed border-gray-300 p-6 text-center hover:border-blue-600 transition-colors">
                  <input
                    type="file"
                    id="idDocument"
                    accept="image/jpeg,image/jpg,image/png,application/pdf"
                    onChange={(e) => handleFileChange(e, 'idDocument')}
                    className="hidden"
                  />
                  <label htmlFor="idDocument" className="cursor-pointer">
                    {previews.idDocument ? (
                      <div>
                        <img src={previews.idDocument} alt="Prévisualisation" className="max-h-48 mx-auto mb-4" />
                        <p className="text-green-600 font-semibold">✓ {files.idDocument.name}</p>
                      </div>
                    ) : files.idDocument ? (
                      <div>
                        <p className="text-2xl mb-2">📄</p>
                        <p className="text-green-600 font-semibold">✓ {files.idDocument.name}</p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-4xl mb-2">📁</p>
                        <p className="font-semibold mb-2">Cliquez pour sélectionner un fichier</p>
                        <p className="text-sm text-gray-500">JPEG, PNG ou PDF - Max 5MB</p>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-lg font-bold text-gray-900 mb-3">
                  2. Selfie avec votre Pièce d'Identité *
                </label>
                <p className="text-gray-600 mb-4">
                  Photo de vous tenant votre pièce d'identité à côté de votre visage
                </p>

                <div className="border-2 border-dashed border-gray-300 p-6 text-center hover:border-blue-600 transition-colors">
                  <input
                    type="file"
                    id="selfie"
                    accept="image/jpeg,image/jpg,image/png"
                    onChange={(e) => handleFileChange(e, 'selfie')}
                    className="hidden"
                  />
                  <label htmlFor="selfie" className="cursor-pointer">
                    {previews.selfie ? (
                      <div>
                        <img src={previews.selfie} alt="Prévisualisation" className="max-h-48 mx-auto mb-4" />
                        <p className="text-green-600 font-semibold">✓ {files.selfie.name}</p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-4xl mb-2">🤳</p>
                        <p className="font-semibold mb-2">Cliquez pour sélectionner un fichier</p>
                        <p className="text-sm text-gray-500">JPEG ou PNG - Max 5MB</p>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 p-6">
                <h4 className="font-bold text-blue-900 mb-3">⚠️ Instructions Importantes :</h4>
                <ul className="space-y-2 text-blue-800 text-sm">
                  <li>• Les documents doivent être clairs et lisibles</li>
                  <li>• Assurez-vous que toutes les informations sont visibles</li>
                  <li>• Le selfie doit montrer clairement votre visage et votre pièce d'identité</li>
                  <li>• Les documents ne doivent pas être expirés</li>
                  <li>• La vérification prend généralement 24h</li>
                </ul>
              </div>

              <button
                type="submit"
                disabled={loading || !files.idDocument || !files.selfie}
                className="w-full py-4 bg-black text-white font-bold hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? 'TÉLÉCHARGEMENT...' : 'SOUMETTRE LES DOCUMENTS'}
              </button>
            </form>
          </div>
        )}

        <div className="bg-gray-50 border border-gray-200 p-6">
          <h3 className="text-xl font-bold mb-4">Pourquoi le KYC est-il nécessaire ?</h3>
          <ul className="space-y-3 text-gray-700">
            <li className="flex items-start gap-3">
              <span className="text-green-600 font-bold">✓</span>
              <span><strong>Sécurité :</strong> Protège votre compte contre la fraude et le vol d'identité</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-green-600 font-bold">✓</span>
              <span><strong>Conformité :</strong> Respect des réglementations anti-blanchiment (AML/KYC)</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-green-600 font-bold">✓</span>
              <span><strong>Confiance :</strong> Crée un écosystème transparent et sécurisé pour tous</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
