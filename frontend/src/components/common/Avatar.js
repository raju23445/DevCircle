import React from 'react';

const Avatar = ({ user, size = 'md', className = '' }) => {
  const initial = user?.username?.[0]?.toUpperCase() || '?';
  const cls = `avatar avatar-${size} ${className}`;
  if (user?.avatar) return <img src={user.avatar} alt={user.username} className={cls} style={{ borderRadius: '50%' }} />;
  return <div className={cls}>{initial}</div>;
};

export default Avatar;
