import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { updateProfile } from '../features/auth/authSlice';
import Layout from '../components/layout/Layout';
import PostCard from '../components/posts/PostCard';
import Avatar from '../components/common/Avatar';
import Spinner from '../components/common/Spinner';
import api from '../utils/api';
import toast from 'react-hot-toast';

const ProfilePage = () => {
  const { username } = useParams();
  const { user: me } = useSelector(s => s.auth);
  const dispatch = useDispatch();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    setLoading(true);
    api.get(`/users/${username}`).then(r => {
      setProfile(r.data.user);
      setFollowing(me && r.data.user.followers?.some(f => f._id === me._id || f === me._id));
    }).catch(() => toast.error('User not found')).finally(() => setLoading(false));
    api.get(`/users/${username === me?.username ? me._id : ''}/posts`).catch(() => {});
  }, [username, me]);

  useEffect(() => {
    if (!profile) return;
    api.get(`/users/${profile._id}/posts`).then(r => setPosts(r.data.posts || [])).catch(() => {});
  }, [profile]);

  const handleFollow = async () => {
    try {
      const r = await api.post(`/users/${profile._id}/follow`);
      setFollowing(r.data.isFollowing);
      setProfile(p => ({ ...p, followers: r.data.isFollowing ? [...(p.followers||[]), me._id] : (p.followers||[]).filter(f=>f!==me._id) }));
    } catch { toast.error('Failed'); }
  };

  const handleSaveProfile = async () => {
    const skillsArr = typeof editForm.skills === 'string' ? editForm.skills.split(',').map(s=>s.trim()).filter(Boolean) : editForm.skills;
    await dispatch(updateProfile({ ...editForm, skills: skillsArr }));
    setProfile(p => ({ ...p, ...editForm, skills: skillsArr }));
    setEditing(false);
    toast.success('Profile updated!');
  };

  if (loading) return <Layout><Spinner center /></Layout>;
  if (!profile) return <Layout><div className="empty">User not found</div></Layout>;

  const isMe = me?._id === profile._id;

  return (
    <Layout>
      <div style={{ maxWidth: '700px' }}>
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
            <Avatar user={profile} size="lg" />
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                <h1 style={{ fontWeight: 700, fontSize: '1.4rem' }}>{profile.username}</h1>
                {profile.isOnline && <span style={{ display:'flex', alignItems:'center', gap:'0.3rem', fontSize:'0.8rem', color:'var(--green)' }}><span className="online-dot"/>Online</span>}
                {isMe ? (
                  <button onClick={() => { setEditing(!editing); setEditForm({ bio: profile.bio, skills: profile.skills?.join(', '), githubLink: profile.githubLink, avatar: profile.avatar }); }}
                    className="btn btn-secondary btn-sm">{editing ? 'Cancel' : '✏ Edit'}</button>
                ) : me && (
                  <button onClick={handleFollow} className={`btn btn-sm ${following ? 'btn-secondary' : 'btn-primary'}`}>
                    {following ? 'Unfollow' : 'Follow'}
                  </button>
                )}
                {!isMe && me && <Link to={`/messages/${profile._id}`} className="btn btn-secondary btn-sm">💬 Message</Link>}
              </div>
              <p style={{ color: 'var(--muted)', margin: '0.5rem 0' }}>{profile.bio || 'No bio yet.'}</p>
              {profile.githubLink && <a href={profile.githubLink} target="_blank" rel="noreferrer" style={{ color: 'var(--accent)', fontSize: '0.875rem' }}>🐙 GitHub</a>}
              <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.75rem', fontSize: '0.875rem' }}>
                <span><strong>{profile.followers?.length || 0}</strong> <span style={{ color:'var(--muted)' }}>followers</span></span>
                <span><strong>{profile.following?.length || 0}</strong> <span style={{ color:'var(--muted)' }}>following</span></span>
              </div>
              {profile.skills?.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.75rem' }}>
                  {profile.skills.map(s => <span key={s} className="tag">{s}</span>)}
                </div>
              )}
            </div>
          </div>

          {editing && (
            <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--border)', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <input className="input" placeholder="Avatar URL" value={editForm.avatar || ''} onChange={e => setEditForm(f => ({...f, avatar: e.target.value}))} />
              <textarea className="input" placeholder="Bio" value={editForm.bio || ''} onChange={e => setEditForm(f => ({...f, bio: e.target.value}))} style={{ minHeight: '80px' }} />
              <input className="input" placeholder="Skills (comma separated)" value={editForm.skills || ''} onChange={e => setEditForm(f => ({...f, skills: e.target.value}))} />
              <input className="input" placeholder="GitHub URL" value={editForm.githubLink || ''} onChange={e => setEditForm(f => ({...f, githubLink: e.target.value}))} />
              <button onClick={handleSaveProfile} className="btn btn-primary">Save</button>
            </div>
          )}
        </div>

        <h2 style={{ fontWeight: 700, marginBottom: '1rem' }}>Posts</h2>
        {posts.length === 0 ? <div className="empty"><div className="empty-icon">📝</div><p>No posts yet.</p></div>
          : posts.map(p => <PostCard key={p._id} post={p} />)}
      </div>
    </Layout>
  );
};

export default ProfilePage;
