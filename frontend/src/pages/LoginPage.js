import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { login, clearError } from '../features/auth/authSlice';
import toast from 'react-hot-toast';

const LoginPage = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const dispatch = useDispatch();
  const nav = useNavigate();
  const { loading, error, user } = useSelector(s => s.auth);

  useEffect(() => { if (user) nav('/'); }, [user, nav]);
  useEffect(() => { if (error) { toast.error(error); dispatch(clearError()); } }, [error, dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(login(form));
  };

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--bg)' }}>
      <div className="card" style={{ width:'100%', maxWidth:'400px', padding:'2rem' }}>
        <div style={{ textAlign:'center', marginBottom:'2rem' }}>
          <div style={{ fontSize:'2.5rem' }}>⚙</div>
          <h1 style={{ fontSize:'1.5rem', fontWeight:700, color:'var(--accent)' }}>DevCircle</h1>
          <p style={{ color:'var(--muted)', marginTop:'0.25rem' }}>Sign in to your account</p>
        </div>
        <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
          <div>
            <label style={{ fontSize:'0.85rem', color:'var(--muted)', display:'block', marginBottom:'0.35rem' }}>Email</label>
            <input className="input" type="email" placeholder="you@example.com"
              value={form.email} onChange={e => setForm({...form, email:e.target.value})} required />
          </div>
          <div>
            <label style={{ fontSize:'0.85rem', color:'var(--muted)', display:'block', marginBottom:'0.35rem' }}>Password</label>
            <input className="input" type="password" placeholder="••••••••"
              value={form.password} onChange={e => setForm({...form, password:e.target.value})} required />
          </div>
          <button type="submit" disabled={loading} className="btn btn-primary" style={{ width:'100%', justifyContent:'center', marginTop:'0.5rem' }}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <p style={{ textAlign:'center', marginTop:'1.5rem', color:'var(--muted)', fontSize:'0.9rem' }}>
          No account? <Link to="/register" style={{ color:'var(--accent)', fontWeight:600 }}>Sign up</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
