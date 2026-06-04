import React, { useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchConversations, fetchMessages, sendMessage, addRealtimeMessage } from '../features/messages/messagesSlice';
import Layout from '../components/layout/Layout';
import Avatar from '../components/common/Avatar';
import { getSocket, joinSocket } from '../utils/socket';
import { format } from 'timeago.js';

const MessagesPage = () => {
  const { userId } = useParams();
  const dispatch = useDispatch();
  const { user } = useSelector(s => s.auth);
  const { conversations, messages } = useSelector(s => s.messages);
  const [text, setText] = useState('');
  const [typing, setTyping] = useState(false);
  const [otherUser, setOtherUser] = useState(null);
  const bottomRef = useRef();
  const currentMessages = userId ? (messages[userId] || []) : [];

  useEffect(() => {
    dispatch(fetchConversations());
    if (user) {
      const socket = joinSocket(user._id);
      socket.on('newMessage', (msg) => dispatch(addRealtimeMessage({ message: msg })));
      socket.on('typing', ({ username }) => setTyping(username));
      socket.on('stopTyping', () => setTyping(false));
      return () => { socket.off('newMessage'); socket.off('typing'); socket.off('stopTyping'); };
    }
  }, [user, dispatch]);

  useEffect(() => {
    if (userId) {
      dispatch(fetchMessages(userId));
      // find other user from conversations
      const conv = conversations.find(c => c._id === userId || c.user?._id === userId);
      if (conv?.user) setOtherUser(conv.user);
    }
  }, [userId, dispatch, conversations]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [currentMessages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    dispatch(sendMessage({ userId, text }));
    const socket = getSocket();
    socket.emit('stopTyping', { to: userId });
    setText('');
  };

  const handleTyping = (e) => {
    setText(e.target.value);
    const socket = getSocket();
    if (e.target.value) socket.emit('typing', { to: userId, username: user.username });
    else socket.emit('stopTyping', { to: userId });
  };

  return (
    <Layout>
      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '1rem', height: 'calc(100vh - 100px)' }}>
        {/* Conversations list */}
        <div className="card" style={{ overflow: 'auto', padding: '0' }}>
          <div style={{ padding: '1rem', borderBottom: '1px solid var(--border)', fontWeight: 700 }}>Messages</div>
          {conversations.length === 0 && <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--muted)' }}>No conversations yet</div>}
          {conversations.map(conv => (
            <Link key={conv._id} to={`/messages/${conv._id}`}
              style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.85rem 1rem', borderBottom: '1px solid var(--border)', background: userId === conv._id ? 'var(--bg3)' : 'transparent' }}>
              <div style={{ position: 'relative' }}>
                <Avatar user={conv.user} size="md" />
                {conv.user?.isOnline && <span className="online-dot" style={{ position: 'absolute', bottom: 0, right: 0 }} />}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{conv.user?.username}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {conv.lastMessage?.text}
                </div>
              </div>
              {conv.unreadCount > 0 && <span className="badge">{conv.unreadCount}</span>}
            </Link>
          ))}
        </div>

        {/* Chat area */}
        {userId ? (
          <div className="card" style={{ display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '1rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              {otherUser && <><Avatar user={otherUser} size="sm" /><span style={{ fontWeight: 700 }}>{otherUser.username}</span>
                {otherUser.isOnline && <span style={{ fontSize: '0.78rem', color: 'var(--green)' }}>● Online</span>}</>}
            </div>
            <div style={{ flex: 1, overflow: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {currentMessages.map((msg, i) => {
                const isMe = (msg.sender?._id || msg.sender) === user?._id;
                return (
                  <div key={i} style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
                    <div style={{ maxWidth: '65%', background: isMe ? 'var(--accent)' : 'var(--bg3)', borderRadius: '12px', padding: '0.6rem 0.9rem', fontSize: '0.9rem' }}>
                      <div>{msg.text}</div>
                      <div style={{ fontSize: '0.7rem', opacity: 0.7, marginTop: '0.2rem', textAlign: isMe ? 'right' : 'left' }}>{format(msg.createdAt)}</div>
                    </div>
                  </div>
                );
              })}
              {typing && <div style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>{typing} is typing...</div>}
              <div ref={bottomRef} />
            </div>
            <form onSubmit={handleSend} style={{ padding: '1rem', borderTop: '1px solid var(--border)', display: 'flex', gap: '0.5rem' }}>
              <input className="input" value={text} onChange={handleTyping} placeholder="Type a message..." />
              <button type="submit" className="btn btn-primary">Send</button>
            </form>
          </div>
        ) : (
          <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="empty"><div className="empty-icon">💬</div><p>Select a conversation</p></div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default MessagesPage;
