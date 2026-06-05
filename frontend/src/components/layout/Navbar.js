import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../features/auth/authSlice';
import Avatar from '../common/Avatar';
import useTheme from '../../hooks/useTheme';

const Navbar = () => {
  const { theme, toggleTheme } = useTheme();         
  const { user } = useSelector(s => s.auth);
  const { unreadCount: notifCount } = useSelector(s => s.notifications);
  const { unreadCount: msgCount } = useSelector(s => s.messages);
  const dispatch = useDispatch();
  const nav = useNavigate();
  const loc = useLocation();

  const isActive = (path) => loc.pathname === path;

  return (
    <nav style={{
      background: 'rgba(10,15,30,0.95)', backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, zIndex: 100
    }}>
      <div className="container" style={{ display:'flex', alignItems:'center', height:'60px', gap:'1rem' }}>

        
        <Link to="/" style={{ fontWeight:700, fontSize:'1.3rem', color:'var(--accent)', marginRight:'1rem', display:'flex', alignItems:'center', gap:'0.4rem' }}>
          <span style={{ fontSize:'1.5rem' }}>🔧</span> DevCircle
        </Link>

        
        <div style={{ display:'flex', gap:'0.25rem', flex:1 }}>
          {[
            { to:'/', label:'Feed' },
            { to:'/questions', label:'Q&A' },
            { to:'/trending', label:'Trending' },
          ].map(({ to, label }) => (
            <Link key={to} to={to} style={{
              padding:'0.4rem 0.9rem', borderRadius:'8px', fontSize:'0.9rem', fontWeight:500,
              background: isActive(to) ? 'var(--bg3)' : 'transparent',
              color: isActive(to) ? 'var(--text)' : 'var(--muted)',
              transition: 'all 0.2s'
            }}>{label}</Link>
          ))}
        </div>

        
        {user ? (
          <div style={{ display:'flex', alignItems:'center', gap:'0.5rem' }}>

            
            <button
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              style={{
                background: 'none',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                padding: '0.4rem 0.6rem',
                cursor: 'pointer',
                fontSize: '1rem',
                color: 'var(--text)',
                transition: 'all 0.2s',
              }}
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>

            <Link to="/notifications" style={{ position:'relative', padding:'0.4rem', borderRadius:'8px', color:'var(--muted)' }}>
              🔔 {notifCount > 0 && <span className="badge" style={{ position:'absolute', top:0, right:0 }}>{notifCount}</span>}
            </Link>
            <Link to="/messages" style={{ position:'relative', padding:'0.4rem', borderRadius:'8px', color:'var(--muted)' }}>
              💬 {msgCount > 0 && <span className="badge" style={{ position:'absolute', top:0, right:0 }}>{msgCount}</span>}
            </Link>
            <Link to={`/profile/${user.username}`}>
              <Avatar user={user} size="sm" />
            </Link>
            <button className="btn btn-ghost btn-sm" onClick={() => { dispatch(logout()); nav('/login'); }}>
              Logout
            </button>
          </div>
        ) : (
          <div style={{ display:'flex', gap:'0.5rem' }}>

            
            <button
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              style={{
                background: 'none',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                padding: '0.4rem 0.6rem',
                cursor: 'pointer',
                fontSize: '1rem',
                color: 'var(--text)',
                transition: 'all 0.2s',
              }}
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>

            <Link to="/login" className="btn btn-secondary btn-sm">Login</Link>
            <Link to="/register" className="btn btn-primary btn-sm">Sign Up</Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;