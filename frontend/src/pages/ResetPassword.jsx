import { useState } from 'react';
import { resetPassword } from '../services/api';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password !== confirm) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }
    try {
      await resetPassword(token, password);
      setSuccess('Mot de passe réinitialisé ! Redirection...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Token invalide ou expiré');
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-200">
        <div className="card w-full max-w-md bg-base-100 shadow-xl">
          <div className="card-body text-center">
            <h2 className="card-title text-2xl font-bold">Lien invalide</h2>
            <p className="mt-4">Ce lien de réinitialisation est invalide.</p>
            <Link to="/forgot-password" className="link link-primary mt-4">Demander un nouveau lien</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200">
      <div className="card w-full max-w-md bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-2xl font-bold text-center">Nouveau mot de passe</h2>
          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}
          {!success && (
            <form onSubmit={handleSubmit}>
              <div className="form-control">
                <label className="label"><span className="label-text">Nouveau mot de passe</span></label>
                <input type="password" className="input input-bordered" value={password} onChange={e => setPassword(e.target.value)} required />
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text">Confirmer le mot de passe</span></label>
                <input type="password" className="input input-bordered" value={confirm} onChange={e => setConfirm(e.target.value)} required />
              </div>
              <div className="form-control mt-6">
                <button className="btn btn-primary" type="submit">Réinitialiser</button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
