import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';

const TrendingTags = () => {
  const [tags, setTags] = useState([]);
  const nav = useNavigate();

  useEffect(() => {
    api.get('/questions/tags/trending').then(r => setTags(r.data.tags || [])).catch(() => {});
  }, []);

  if (!tags.length) return null;

  return (
    <div className="card">
      <h3 style={{ fontWeight:700, marginBottom:'1rem', fontSize:'0.95rem' }}>🔥 Trending Tags</h3>
      {tags.slice(0, 10).map(t => (
        <div key={t._id} onClick={() => nav(`/questions?tag=${t._id}`)}
          style={{ display:'flex', justifyContent:'space-between', padding:'0.4rem 0', cursor:'pointer', borderBottom:'1px solid var(--border)' }}>
          <span className="tag">#{t._id}</span>
          <span style={{ color:'var(--muted)', fontSize:'0.8rem' }}>{t.count}</span>
        </div>
      ))}
    </div>
  );
};

export default TrendingTags;
