import { useState } from 'react';
import { forgotPassword } from '../services/api';
import { Link } from 'react-router-dom';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await forgotPassword(email);
      setSent(true);
    } catch {
      setError('Erreur lors de l\'envoi');
    }
  };

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-200">
        <div className="card w-full max-w-md bg-base-100 shadow-xl">
          <div className="card-body text-center">
            <h2 className="card-title text-2xl font-bold">Email envoyé</h2>
            <p className="mt-4">Si un compte existe avec cet email, vous recevrez un lien de réinitialisation.</p>
            <Link to="/login" className="link link-primary mt-4">Retour à la connexion</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200">
      <div className="card w-full max-w-md bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-2xl font-bold text-center">Mot de passe oublié</h2>
          {error && <div className="alert alert-error">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-control">
              <label className="label"><span className="label-text">Email</span></label>
              <input type="email" className="input input-bordered" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div className="form-control mt-6">
              <button className="btn btn-primary" type="submit">Envoyer</button>
            </div>
          </form>
          <p className="text-center mt-4">
            <Link to="/login" className="link link-primary">Retour à la connexion</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
