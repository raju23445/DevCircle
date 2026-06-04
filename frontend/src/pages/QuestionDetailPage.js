import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchQuestion, postAnswer, voteQuestion, voteAnswer } from '../features/questions/questionsSlice';
import Layout from '../components/layout/Layout';
import Avatar from '../components/common/Avatar';
import Tag from '../components/common/Tag';
import Spinner from '../components/common/Spinner';
import { format } from 'timeago.js';
import api from '../utils/api';
import toast from 'react-hot-toast';

const QuestionDetailPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { current: question, loading } = useSelector(s => s.questions);
  const { user } = useSelector(s => s.auth);
  const [answerBody, setAnswerBody] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { dispatch(fetchQuestion(id)); }, [dispatch, id]);

  const handleSubmitAnswer = async (e) => {
    e.preventDefault();
    if (!answerBody.trim()) return;
    setSubmitting(true);
    const r = await dispatch(postAnswer({ id, body: answerBody }));
    setSubmitting(false);
    if (!r.error) { setAnswerBody(''); toast.success('Answer posted!'); }
  };

  const handleAccept = async (answerId) => {
    try {
      await api.post(`/questions/${id}/answers/${answerId}/accept`);
      dispatch(fetchQuestion(id));
      toast.success('Answer accepted!');
    } catch { toast.error('Failed'); }
  };

  
  const handleVoteAnswer = (answerId, type) => {
    if (!user) return toast.error('Login to vote');
    dispatch(voteAnswer({ questionId: id, answerId, type, userId: user._id }));
  };

  if (loading && !question) return <Layout><Spinner center /></Layout>;
  if (!question) return <Layout><div className="empty">Question not found.</div></Layout>;

  
  const score = question._upvoteCount !== undefined
    ? question._upvoteCount - (question._downvoteCount || 0)
    : (question.upvotes?.length || 0) - (question.downvotes?.length || 0);

  const isUpvoted = user && question.upvotes?.includes(user._id);
  const isDownvoted = user && question.downvotes?.includes(user._id);

  return (
    <Layout>
      <div style={{ maxWidth: '800px' }}>

        
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', gap: '1rem' }}>

            
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem', minWidth: '52px' }}>

              
              <button
                onClick={() => user ? dispatch(voteQuestion({ id, type: 'up', userId: user._id })) : toast.error('Login to vote')}
                title={user ? 'Upvote' : 'Login to vote'}
                style={{
                  width: '42px', height: '42px', borderRadius: '50%',
                  border: isUpvoted ? '2px solid #10b981' : '2px solid var(--border)',
                  background: isUpvoted ? 'linear-gradient(135deg, #10b981, #059669)' : 'var(--bg2)',
                  color: isUpvoted ? 'white' : 'var(--muted)',
                  fontSize: '1.1rem', cursor: user ? 'pointer' : 'not-allowed',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.2s',
                  boxShadow: isUpvoted ? '0 0 12px rgba(16,185,129,0.4)' : 'none',
                  transform: isUpvoted ? 'scale(1.1)' : 'scale(1)',
                }}
                onMouseEnter={e => { if (!isUpvoted && user) { e.currentTarget.style.borderColor = '#10b981'; e.currentTarget.style.color = '#10b981'; } }}
                onMouseLeave={e => { if (!isUpvoted) { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--muted)'; } }}
              >▲</button>

              
              <span style={{
                fontWeight: 800, fontSize: '1.3rem',
                color: score > 0 ? '#10b981' : score < 0 ? '#ef4444' : 'var(--muted)',
                minWidth: '24px', textAlign: 'center', transition: 'color 0.2s',
              }}>
                {score}
              </span>

              
              <button
                onClick={() => user ? dispatch(voteQuestion({ id, type: 'down', userId: user._id })) : toast.error('Login to vote')}
                title={user ? 'Downvote' : 'Login to vote'}
                style={{
                  width: '42px', height: '42px', borderRadius: '50%',
                  border: isDownvoted ? '2px solid #ef4444' : '2px solid var(--border)',
                  background: isDownvoted ? 'linear-gradient(135deg, #ef4444, #dc2626)' : 'var(--bg2)',
                  color: isDownvoted ? 'white' : 'var(--muted)',
                  fontSize: '1.1rem', cursor: user ? 'pointer' : 'not-allowed',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.2s',
                  boxShadow: isDownvoted ? '0 0 12px rgba(239,68,68,0.4)' : 'none',
                  transform: isDownvoted ? 'scale(1.1)' : 'scale(1)',
                }}
                onMouseEnter={e => { if (!isDownvoted && user) { e.currentTarget.style.borderColor = '#ef4444'; e.currentTarget.style.color = '#ef4444'; } }}
                onMouseLeave={e => { if (!isDownvoted) { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--muted)'; } }}
              >▼</button>

            </div>

        
            <div style={{ flex: 1 }}>
              <h1 style={{ fontWeight: 700, fontSize: '1.3rem', marginBottom: '1rem', lineHeight: 1.4 }}>
                {question.title}
              </h1>
              <p style={{ lineHeight: 1.7, whiteSpace: 'pre-wrap', marginBottom: '1rem' }}>
                {question.body}
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1rem' }}>
                {question.tags?.map(t => <Tag key={t} tag={t} />)}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.8rem', color: 'var(--muted)' }}>
                <Avatar user={question.author} size="sm" />
                <span>{question.author?.username}</span>
                <span>· {format(question.createdAt)}</span>
                <span>· 👁 {question.views} views</span>
              </div>
            </div>
          </div>
        </div>

        
        <h2 style={{ fontWeight: 700, marginBottom: '1rem' }}>
          {question.answers?.length || 0} Answers
        </h2>

        {question.answers?.map(ans => {
          
          const ansScore = ans._upvoteCount !== undefined
            ? ans._upvoteCount - (ans._downvoteCount || 0)
            : (ans.upvotes?.length || 0) - (ans.downvotes?.length || 0);

          const ansIsUpvoted = user && ans.upvotes?.includes(user._id);
          const ansIsDownvoted = user && ans.downvotes?.includes(user._id);

          return (
            <div key={ans._id}
              className={`card ${ans.isAccepted ? 'accepted' : ''}`}
              style={{ marginBottom: '1rem' }}
            >
              {ans.isAccepted && (
                <div style={{ color: 'var(--green)', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                  ✓ Accepted Answer
                </div>
              )}

              <div style={{ display: 'flex', gap: '1rem' }}>

                
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem', minWidth: '52px' }}>

                  <button
                    onClick={() => handleVoteAnswer(ans._id, 'up')}
                    title={user ? 'Upvote' : 'Login to vote'}
                    style={{
                      width: '38px', height: '38px', borderRadius: '50%',
                      border: ansIsUpvoted ? '2px solid #10b981' : '2px solid var(--border)',
                      background: ansIsUpvoted ? 'linear-gradient(135deg, #10b981, #059669)' : 'var(--bg2)',
                      color: ansIsUpvoted ? 'white' : 'var(--muted)',
                      fontSize: '1rem', cursor: user ? 'pointer' : 'not-allowed',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.2s',
                      boxShadow: ansIsUpvoted ? '0 0 10px rgba(16,185,129,0.4)' : 'none',
                      transform: ansIsUpvoted ? 'scale(1.1)' : 'scale(1)',
                    }}
                    onMouseEnter={e => { if (!ansIsUpvoted && user) { e.currentTarget.style.borderColor = '#10b981'; e.currentTarget.style.color = '#10b981'; } }}
                    onMouseLeave={e => { if (!ansIsUpvoted) { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--muted)'; } }}
                  >▲</button>

                  <span style={{
                    fontWeight: 800, fontSize: '1rem',
                    color: ansScore > 0 ? '#10b981' : ansScore < 0 ? '#ef4444' : 'var(--muted)',
                    minWidth: '24px', textAlign: 'center', transition: 'color 0.2s',
                  }}>
                    {ansScore}
                  </span>

                  <button
                    onClick={() => handleVoteAnswer(ans._id, 'down')}
                    title={user ? 'Downvote' : 'Login to vote'}
                    style={{
                      width: '38px', height: '38px', borderRadius: '50%',
                      border: ansIsDownvoted ? '2px solid #ef4444' : '2px solid var(--border)',
                      background: ansIsDownvoted ? 'linear-gradient(135deg, #ef4444, #dc2626)' : 'var(--bg2)',
                      color: ansIsDownvoted ? 'white' : 'var(--muted)',
                      fontSize: '1rem', cursor: user ? 'pointer' : 'not-allowed',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.2s',
                      boxShadow: ansIsDownvoted ? '0 0 10px rgba(239,68,68,0.4)' : 'none',
                      transform: ansIsDownvoted ? 'scale(1.1)' : 'scale(1)',
                    }}
                    onMouseEnter={e => { if (!ansIsDownvoted && user) { e.currentTarget.style.borderColor = '#ef4444'; e.currentTarget.style.color = '#ef4444'; } }}
                    onMouseLeave={e => { if (!ansIsDownvoted) { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--muted)'; } }}
                  >▼</button>

                </div>

                
                <div style={{ flex: 1 }}>
                  <p style={{ lineHeight: 1.7, whiteSpace: 'pre-wrap', marginBottom: '1rem' }}>
                    {ans.body}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.8rem', color: 'var(--muted)' }}>
                    <Avatar user={ans.author} size="sm" />
                    <span>{ans.author?.username}</span>
                    <span>· {format(ans.createdAt)}</span>
                    {!ans.isAccepted && user?._id === question.author?._id && (
                      <button
                        onClick={() => handleAccept(ans._id)}
                        className="btn btn-sm"
                        style={{ background: 'var(--green)', color: 'white', marginLeft: 'auto' }}
                      >
                        ✓ Accept
                      </button>
                    )}
                  </div>
                </div>

              </div>
            </div>
          );
        })}

        
        {user ? (
          <div className="card" style={{ marginTop: '1.5rem' }}>
            <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>Your Answer</h3>
            <form onSubmit={handleSubmitAnswer}>
              <textarea
                className="input"
                value={answerBody}
                onChange={e => setAnswerBody(e.target.value)}
                placeholder="Write your answer here..."
                style={{ minHeight: '150px', resize: 'vertical', marginBottom: '1rem' }}
              />
              <button type="submit" disabled={submitting} className="btn btn-primary">
                {submitting ? 'Posting...' : 'Post Answer'}
              </button>
            </form>
          </div>
        ) : (
          <div className="card" style={{ textAlign: 'center', padding: '1.5rem', marginTop: '1.5rem' }}>
            <p style={{ color: 'var(--muted)' }}>Login to post an answer</p>
          </div>
        )}

      </div>
    </Layout>
  );
};

export default QuestionDetailPage;