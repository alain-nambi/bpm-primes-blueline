import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export default function SignUp() {
  const [form, setForm] = useState({ email: '', name: '', password: '', poste: '', department: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const data = { ...form };
      if (!data.poste) delete data.poste;
      if (!data.department) delete data.department;
      const res = await signup(data);
      setSuccess(res.message || 'Inscription réussie !');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Erreur lors de l\'inscription');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200">
      <div className="card w-full max-w-md bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-2xl font-bold text-center">Inscription</h2>
          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success} — Redirection vers la connexion...</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-control">
              <label className="label"><span className="label-text">Nom</span></label>
              <input type="text" name="name" className="input input-bordered" value={form.name} onChange={handleChange} required />
            </div>
            <div className="form-control">
              <label className="label"><span className="label-text">Email</span></label>
              <input type="email" name="email" className="input input-bordered" value={form.email} onChange={handleChange} required />
            </div>
            <div className="form-control">
              <label className="label"><span className="label-text">Mot de passe</span></label>
              <input type="password" name="password" className="input input-bordered" value={form.password} onChange={handleChange} required />
            </div>
            <div className="form-control">
              <label className="label"><span className="label-text">Poste (optionnel)</span></label>
              <input type="text" name="poste" className="input input-bordered" value={form.poste} onChange={handleChange} />
            </div>
            <div className="form-control">
              <label className="label"><span className="label-text">Département </span></label>
              <input type="text" name="department" className="input input-bordered" value={form.department} onChange={handleChange} />
            </div>

            <div className="form-control mt-6">
              <button className="btn btn-primary" type="submit">S'inscrire</button>
            </div>
          </form>
          <p className="text-center mt-4">
            Déjà un compte ? <Link to="/login" className="link link-primary">Se connecter</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
