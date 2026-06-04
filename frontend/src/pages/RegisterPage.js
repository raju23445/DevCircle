import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { register, clearError } from '../features/auth/authSlice';
import toast from 'react-hot-toast';

const RegisterPage = () => {
  const [form, setForm] = useState({ username:'', email:'', password:'' });
  const dispatch = useDispatch();
  const nav = useNavigate();
  const { loading, error, user } = useSelector(s => s.auth);

  useEffect(() => { if (user) nav('/'); }, [user, nav]);
  useEffect(() => { if (error) { toast.error(error); dispatch(clearError()); } }, [error, dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    dispatch(register(form));
  };

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--bg)' }}>
      <div className="card" style={{ width:'100%', maxWidth:'400px', padding:'2rem' }}>
        <div style={{ textAlign:'center', marginBottom:'2rem' }}>
          <div style={{ fontSize:'2.5rem' }}>⚙</div>
          <h1 style={{ fontSize:'1.5rem', fontWeight:700, color:'var(--accent)' }}>Join DevCircle</h1>
          <p style={{ color:'var(--muted)', marginTop:'0.25rem' }}>Create your developer account</p>
        </div>
        <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
          {[
            { key:'username', label:'Username', type:'text', placeholder:'cooldev42' },
            { key:'email', label:'Email', type:'email', placeholder:'you@example.com' },
            { key:'password', label:'Password', type:'password', placeholder:'Min. 6 characters' },
          ].map(({ key, label, type, placeholder }) => (
            <div key={key}>
              <label style={{ fontSize:'0.85rem', color:'var(--muted)', display:'block', marginBottom:'0.35rem' }}>{label}</label>
              <input className="input" type={type} placeholder={placeholder}
                value={form[key]} onChange={e => setForm({...form, [key]:e.target.value})} required />
            </div>
          ))}
          <button type="submit" disabled={loading} className="btn btn-primary" style={{ width:'100%', justifyContent:'center', marginTop:'0.5rem' }}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>
        <p style={{ textAlign:'center', marginTop:'1.5rem', color:'var(--muted)', fontSize:'0.9rem' }}>
          Already have an account? <Link to="/login" style={{ color:'var(--accent)', fontWeight:600 }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
