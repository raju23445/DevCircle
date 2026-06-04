import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchQuestions } from '../features/questions/questionsSlice';
import QuestionCard from '../components/questions/QuestionCard';
import Layout from '../components/layout/Layout';
import Spinner from '../components/common/Spinner';
import TrendingTags from '../components/common/TrendingTags';

const QuestionsPage = () => {
  const dispatch = useDispatch();
  const { questions, loading, page, totalPages } = useSelector(s => s.questions);
  const { user } = useSelector(s => s.auth);
  const [searchParams] = useSearchParams();
  const tag = searchParams.get('tag');

  useEffect(() => { dispatch(fetchQuestions({ page: 1, tag })); }, [dispatch, tag]);

  return (
    <Layout sidebar={<TrendingTags />}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem' }}>
        <div>
          <h1 style={{ fontWeight:700, fontSize:'1.4rem' }}>
            {tag ? `#${tag}` : 'Questions'} {tag && <span style={{ fontSize:'1rem', color:'var(--muted)' }}>— filtered by tag</span>}
          </h1>
          <p style={{ color:'var(--muted)', fontSize:'0.875rem' }}>Get help from the community</p>
        </div>
        {user && <Link to="/questions/new" className="btn btn-primary">Ask Question</Link>}
      </div>

      {loading && questions.length === 0 ? <Spinner center /> : (
        <>
          {questions.length === 0 && <div className="empty"><div className="empty-icon">❓</div><p>No questions yet. Be the first to ask!</p></div>}
          {questions.map(q => <QuestionCard key={q._id} question={q} />)}
          {page < totalPages && (
            <div style={{ textAlign:'center', paddingTop:'1rem' }}>
              <button onClick={() => dispatch(fetchQuestions({ page: page + 1, tag }))} disabled={loading} className="btn btn-secondary">
                Load More
              </button>
            </div>
          )}
        </>
      )}
    </Layout>
  );
};

export default QuestionsPage;
