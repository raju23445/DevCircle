import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { likePost, deletePost, commentPost, repost } from '../../features/posts/postsSlice';
import Avatar from '../common/Avatar';
import Tag from '../common/Tag';
import { format } from 'timeago.js';
import toast from 'react-hot-toast';

const PostCard = ({ post }) => {
  const dispatch = useDispatch();
  const { user } = useSelector(s => s.auth);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');

  const isLiked = user && post.likes?.includes(user._id);
  const isOwner = user && post.author?._id === user?._id;

  const handleLike = () => {
    if (!user) return toast.error('Login to like posts');
    dispatch(likePost(post._id));
  };

  const handleComment = (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    dispatch(commentPost({ postId: post._id, text: commentText }));
    setCommentText('');
  };

  const handleRepost = () => {
    if (!user) return toast.error('Login to repost');
    dispatch(repost(post._id)).then(() => toast.success('Reposted!'));
  };

  const handleDelete = () => {
    if (window.confirm('Delete this post?')) {
      dispatch(deletePost(post._id));
      toast.success('Post deleted');
    }
  };

  return (
    <div className="card fade-in" style={{ marginBottom: '1rem' }}>
      {post.isRepost && (
        <div style={{ fontSize: '0.8rem', color: 'var(--muted)', marginBottom: '0.75rem' }}>
          🔄 Reposted
        </div>
      )}
      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
        <Link to={`/profile/${post.author?.username}`}>
          <Avatar user={post.author} size="md" />
        </Link>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
            <Link to={`/profile/${post.author?.username}`} style={{ fontWeight: 600, fontSize: '0.95rem' }}>
              {post.author?.username}
            </Link>
            <span style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>{format(post.createdAt)}</span>
            {isOwner && (
              <button onClick={handleDelete} style={{ marginLeft:'auto', background:'none', border:'none', color:'var(--muted)', cursor:'pointer', fontSize:'0.8rem' }}>
                🗑 Delete
              </button>
            )}
          </div>

          <p style={{ lineHeight: 1.6, marginBottom: '0.75rem' }}>{post.text}</p>
          {post.image && (
            <img
            src={post.image}
            alt="post"
           style={{
           width: '100%',
           borderRadius: '8px',
           marginBottom: '0.75rem',
           maxHeight: '400px',
           objectFit: 'cover',
             }}
             />
           )}

          {post.video && (
  <video
    src={post.video}
    controls
    style={{
      width: '100%',
      borderRadius: '8px',
      marginBottom: '0.75rem',
      maxHeight: '400px',
      background: '#000',
    }}
  />
           )}

          {post.tags?.length > 0 && (
            <div style={{ display:'flex', flexWrap:'wrap', gap:'0.4rem', marginBottom:'0.75rem' }}>
              {post.tags.map(t => <Tag key={t} tag={t} />)}
            </div>
          )}

        
          <div style={{ display:'flex', gap:'0.5rem', alignItems:'center' }}>
            <button onClick={handleLike} className={`btn btn-ghost btn-sm ${isLiked ? 'active' : ''}`}
              style={{ color: isLiked ? 'var(--red)' : 'var(--muted)' }}>
              {isLiked ? '❤️' : '🤍'} {post.likes?.length || 0}
            </button>
            <button onClick={() => setShowComments(!showComments)} className="btn btn-ghost btn-sm" style={{ color:'var(--muted)' }}>
              💬 {post.comments?.length || 0}
            </button>
            <button onClick={handleRepost} className="btn btn-ghost btn-sm" style={{ color:'var(--muted)' }}>
              🔄 {post.reposts?.length || 0}
            </button>
            <span style={{ marginLeft:'auto', fontSize:'0.78rem', color:'var(--muted)' }}>
              👁 {post.viewCount || 0}
            </span>
          </div>

          {showComments && (
            <div style={{ marginTop: '1rem' }}>
              <div className="divider" />
              {post.comments?.map(c => (
                <div key={c._id} style={{ display:'flex', gap:'0.5rem', marginBottom:'0.75rem', alignItems:'flex-start' }}>
                  <Avatar user={c.user} size="sm" />
                  <div style={{ background:'var(--bg3)', borderRadius:'8px', padding:'0.5rem 0.75rem', flex:1 }}>
                    <span style={{ fontWeight:600, fontSize:'0.85rem' }}>{c.user?.username} </span>
                    <span style={{ fontSize:'0.9rem' }}>{c.text}</span>
                  </div>
                </div>
              ))}
              {user && (
                <form onSubmit={handleComment} style={{ display:'flex', gap:'0.5rem', marginTop:'0.5rem' }}>
                  <input value={commentText} onChange={e => setCommentText(e.target.value)}
                    className="input" placeholder="Write a comment..." style={{ flex:1 }} />
                  <button type="submit" className="btn btn-primary btn-sm">Send</button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PostCard;
