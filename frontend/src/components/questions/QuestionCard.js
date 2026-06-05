import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { voteQuestion } from '../../features/questions/questionsSlice';
import Avatar from '../common/Avatar';
import Tag from '../common/Tag';
import { format } from 'timeago.js';

const QuestionCard = ({ question }) => {
  const dispatch = useDispatch();
  const { user } = useSelector(s => s.auth);

 
  const score = question._upvoteCount !== undefined
    ? question._upvoteCount - (question._downvoteCount || 0)
    : (question.upvotes?.length || 0) - (question.downvotes?.length || 0);

  const isUpvoted = user && (question.upvotes?.includes(user._id));
  const isDownvoted = user && (question.downvotes?.includes(user._id));
  const hasAccepted = question.answers?.some(a => a.isAccepted);

  
  const handleUpvote = () => {
    if (!user) return;
    dispatch(voteQuestion({ id: question._id, type: 'up', userId: user._id }));
  };

  const handleDownvote = () => {
    if (!user) return;
    dispatch(voteQuestion({ id: question._id, type: 'down', userId: user._id }));
  };

  return (
    <div className="card fade-in" style={{
      marginBottom: '1rem',
      display: 'flex',
      gap: '1rem',
      transition: 'transform 0.2s, box-shadow 0.2s',
    }}
      onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
      onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
    >

      
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.3rem',
        minWidth: '52px',
      }}>

        
        <button
          onClick={handleUpvote}
          title={user ? 'Upvote' : 'Login to vote'}
          style={{
            width: '42px',
            height: '42px',
            borderRadius: '50%',
            border: isUpvoted ? '2px solid #10b981' : '2px solid var(--border)',
            background: isUpvoted
              ? 'linear-gradient(135deg, #10b981, #059669)'
              : 'var(--bg2)',
            color: isUpvoted ? 'white' : 'var(--muted)',
            fontSize: '1.1rem',
            cursor: user ? 'pointer' : 'not-allowed',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s',
            boxShadow: isUpvoted ? '0 0 12px rgba(16,185,129,0.4)' : 'none',
            transform: isUpvoted ? 'scale(1.1)' : 'scale(1)',
          }}
          onMouseEnter={e => {
            if (!isUpvoted && user) {
              e.currentTarget.style.borderColor = '#10b981';
              e.currentTarget.style.color = '#10b981';
            }
          }}
          onMouseLeave={e => {
            if (!isUpvoted) {
              e.currentTarget.style.borderColor = 'var(--border)';
              e.currentTarget.style.color = 'var(--muted)';
            }
          }}
        >
          ▲
        </button>

        
        <span style={{
          fontWeight: 800,
          fontSize: '1.1rem',
          color: score > 0 ? '#10b981' : score < 0 ? '#ef4444' : 'var(--muted)',
          minWidth: '24px',
          textAlign: 'center',
          transition: 'color 0.2s',
        }}>
          {score}
        </span>

        
        <button
          onClick={handleDownvote}
          title={user ? 'Downvote' : 'Login to vote'}
          style={{
            width: '42px',
            height: '42px',
            borderRadius: '50%',
            border: isDownvoted ? '2px solid #ef4444' : '2px solid var(--border)',
            background: isDownvoted
              ? 'linear-gradient(135deg, #ef4444, #dc2626)'
              : 'var(--bg2)',
            color: isDownvoted ? 'white' : 'var(--muted)',
            fontSize: '1.1rem',
            cursor: user ? 'pointer' : 'not-allowed',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s',
            boxShadow: isDownvoted ? '0 0 12px rgba(239,68,68,0.4)' : 'none',
            transform: isDownvoted ? 'scale(1.1)' : 'scale(1)',
          }}
          onMouseEnter={e => {
            if (!isDownvoted && user) {
              e.currentTarget.style.borderColor = '#ef4444';
              e.currentTarget.style.color = '#ef4444';
            }
          }}
          onMouseLeave={e => {
            if (!isDownvoted) {
              e.currentTarget.style.borderColor = 'var(--border)';
              e.currentTarget.style.color = 'var(--muted)';
            }
          }}
        >
          ▼
        </button>

      </div>

      
      <div style={{ flex: 1 }}>

        
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.5rem' }}>
          {hasAccepted && (
            <span title="Has accepted answer" style={{
              background: 'linear-gradient(135deg, #10b981, #059669)',
              color: 'white',
              borderRadius: '50%',
              width: '22px',
              height: '22px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.75rem',
              flexShrink: 0,
              marginTop: '2px',
            }}>✓</span>
          )}
          <Link to={`/questions/${question._id}`} style={{
            fontWeight: 700,
            fontSize: '1rem',
            lineHeight: 1.4,
            flex: 1,
            color: 'var(--text)',
            transition: 'color 0.2s',
          }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text)'}
          >
            {question.title}
          </Link>
        </div>

        
        <p style={{
          color: 'var(--muted)',
          fontSize: '0.875rem',
          marginBottom: '0.75rem',
          lineHeight: 1.5,
        }}>
          {question.body?.slice(0, 150)}{question.body?.length > 150 ? '...' : ''}
        </p>

        
        {question.tags?.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.75rem' }}>
            {question.tags.map(t => <Tag key={t} tag={t} />)}
          </div>
        )}

        
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          fontSize: '0.8rem',
          color: 'var(--muted)',
        }}>

          
          <span style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.3rem',
            background: question.answers?.length > 0 ? 'rgba(59,130,246,0.1)' : 'var(--bg3)',
            color: question.answers?.length > 0 ? 'var(--accent)' : 'var(--muted)',
            borderRadius: '999px',
            padding: '0.2rem 0.6rem',
            fontWeight: 600,
          }}>
            💬 {question.answers?.length || 0} answers
          </span>

          
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            👁 {question.views || 0} views
          </span>

          
          <div style={{
            marginLeft: 'auto',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
          }}>
            <Avatar user={question.author} size="sm" />
            <Link to={`/profile/${question.author?.username}`}
              style={{ fontWeight: 600, color: 'var(--text)' }}>
              {question.author?.username}
            </Link>
            <span>· {format(question.createdAt)}</span>
          </div>

        </div>
      </div>
    </div>
  );
};

export default QuestionCard;