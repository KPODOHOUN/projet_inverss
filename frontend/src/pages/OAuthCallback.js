import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function OAuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { loginWithToken } = useAuth();
  const [error, setError] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      navigate('/login?error=oauth_missing_token', { replace: true });
      return;
    }

    loginWithToken(token).then(result => {
      if (!result.success) {
        setError(result.error);
        setTimeout(() => navigate('/login', { replace: true }), 2000);
        return;
      }
      if (!result.user.emailVerified) {
        navigate('/verify-email', { replace: true });
      } else if (result.user.role === 'admin' || result.user.role === 'superadmin') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050505] px-4">
      <div className="text-center">
        {error ? (
          <p className="text-red-400 text-sm">{error}</p>
        ) : (
          <>
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-yellow-500 border-t-transparent"></div>
            <p className="mt-4 text-gray-400 font-semibold">Connexion en cours...</p>
          </>
        )}
      </div>
    </div>
  );
}
