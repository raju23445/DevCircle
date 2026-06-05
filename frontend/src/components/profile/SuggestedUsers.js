import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import api from '../../utils/api';
import Avatar from '../common/Avatar';

const SuggestedUsers = () => {
  const user = useSelector(s => s.auth?.user);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    if (!user) return;
    api.get('/users/suggested')
      .then(r => setUsers(r.data?.users || []))
      .catch(() => setUsers([]));  
  }, [user]);

  if (!user || !users || users.length === 0) return null;

  return (
    <div className="card">
      <h3 style={{ fontWeight: 700, marginBottom: '1rem', fontSize: '0.95rem' }}>
        👥 Suggested Developers
      </h3>
      {users.map(u => (
        <Link
          key={u._id}
          to={`/profile/${u.username}`}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.4rem 0',
            borderBottom: '1px solid var(--border)'
          }}
        >
          <Avatar user={u} size="sm" />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontWeight: 600,
              fontSize: '0.9rem',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {u.username}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
              {u.followers?.length || 0} followers
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default SuggestedUsers;