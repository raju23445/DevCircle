import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchNotifications, markAllRead } from '../features/notifications/notificationsSlice';
import Layout from '../components/layout/Layout';
import Avatar from '../components/common/Avatar';
import { format } from 'timeago.js';

const icons = { like:'❤️', comment:'💬', follow:'👤', answer:'✅', repost:'🔄' };

const NotificationsPage = () => {
  const dispatch = useDispatch();
  const { notifications, unreadCount } = useSelector(s => s.notifications);

  useEffect(() => { dispatch(fetchNotifications()); }, [dispatch]);
  const handleMarkRead = () => dispatch(markAllRead());

  return (
    <Layout>
      <div style={{ maxWidth: '600px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h1 style={{ fontWeight: 700, fontSize: '1.4rem' }}>Notifications {unreadCount > 0 && <span className="badge" style={{ marginLeft: '0.5rem' }}>{unreadCount}</span>}</h1>
          {unreadCount > 0 && <button onClick={handleMarkRead} className="btn btn-secondary btn-sm">Mark all read</button>}
        </div>
        {notifications.length === 0 ? (
          <div className="empty"><div className="empty-icon">🔔</div><p>No notifications yet</p></div>
        ) : notifications.map(n => (
          <div key={n._id} className="card fade-in" style={{ marginBottom: '0.75rem', display: 'flex', gap: '0.75rem', alignItems: 'center', opacity: n.read ? 0.6 : 1, background: n.read ? 'var(--card)' : 'var(--bg3)' }}>
            <span style={{ fontSize: '1.5rem' }}>{icons[n.type] || '🔔'}</span>
            <Avatar user={n.sender} size="sm" />
            <div style={{ flex: 1 }}>
              <span style={{ fontWeight: 600 }}>{n.sender?.username}</span>{' '}
              <span style={{ color: 'var(--muted)' }}>
                {n.type === 'like' && 'liked your post'}
                {n.type === 'comment' && 'commented on your post'}
                {n.type === 'follow' && 'followed you'}
                {n.type === 'answer' && 'answered your question'}
                {n.type === 'repost' && 'reposted your post'}
              </span>
              <div style={{ fontSize: '0.78rem', color: 'var(--muted)', marginTop: '0.2rem' }}>{format(n.createdAt)}</div>
            </div>
          </div>
        ))}
      </div>
    </Layout>
  );
};

export default NotificationsPage;
