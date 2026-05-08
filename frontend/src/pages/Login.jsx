import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      navigate('/');
    } catch {
      setError('Email ou mot de passe incorrect');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200">
      <div className="card w-full max-w-md bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-2xl font-bold text-center">Connexion</h2>
          {error && <div className="alert alert-error">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-control">
              <label className="label"><span className="label-text">Email</span></label>
              <input type="email" className="input input-bordered" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div className="form-control">
              <label className="label"><span className="label-text">Mot de passe</span></label>
              <input type="password" className="input input-bordered" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
            <div className="form-control mt-6">
              <button className="btn btn-primary" type="submit">Se connecter</button>
            </div>
          </form>
          <p className="text-center mt-4">
            Pas encore de compte ? <Link to="/signup" className="link link-primary">S'inscrire</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
