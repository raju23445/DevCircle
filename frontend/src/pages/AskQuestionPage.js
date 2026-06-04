import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { createQuestion } from '../features/questions/questionsSlice';
import Layout from '../components/layout/Layout';
import api from '../utils/api';
import toast from 'react-hot-toast';

const AskQuestionPage = () => {
  const dispatch = useDispatch();
  const nav = useNavigate();
  const [form, setForm] = useState({ title:'', body:'', tags:[] });
  const [tagInput, setTagInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [aiWarning, setAiWarning] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);

  const addTag = (e) => {
    if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) {
      e.preventDefault();
      setForm(f => ({ ...f, tags: [...new Set([...f.tags, tagInput.trim().toLowerCase()])] }));
      setTagInput('');
    }
  };

  const handleValidate = async () => {
    if (!form.title || !form.body) return toast.error('Fill in title and body first');
    setAiLoading(true);
    try {
      const res = await api.post('/ai/validate-question', { title: form.title, body: form.body });
      if (!res.data.isGood) setAiWarning(res.data.warning || 'Your question may be too vague.');
      else { setAiWarning(null); toast.success('✅ Question looks great!'); }
    } catch { toast.error('AI unavailable'); }
    setAiLoading(false);
  };

  const handleSuggestTags = async () => {
    const text = `${form.title} ${form.body}`;
    if (text.trim().length < 20) return toast.error('Add more content first');
    setAiLoading(true);
    try {
      const res = await api.post('/ai/suggest-tags', { text });
      setForm(f => ({ ...f, tags: res.data.tags || [] }));
      toast.success('Tags suggested!');
    } catch { toast.error('AI unavailable'); }
    setAiLoading(false);
  };

  const handleImprove = async () => {
    if (!form.body || form.body.length < 20) return;
    setAiLoading(true);
    try {
      const res = await api.post('/ai/improve', { text: form.body, type: 'question' });
      setForm(f => ({ ...f, body: res.data.improved }));
      toast.success('✨ Question improved!');
    } catch { toast.error('AI unavailable'); }
    setAiLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const result = await dispatch(createQuestion(form));
    setLoading(false);
    if (!result.error) { toast.success('Question posted!'); nav(`/questions/${result.payload._id}`); }
    else toast.error(result.payload);
  };

  return (
    <Layout>
      <div style={{ maxWidth:'750px', margin:'0 auto' }}>
        <h1 style={{ fontWeight:700, fontSize:'1.5rem', marginBottom:'0.5rem' }}>Ask a Question</h1>
        <p style={{ color:'var(--muted)', marginBottom:'1.5rem' }}>Be specific. Use code examples. The community will help.</p>

        {aiWarning && (
          <div style={{ background:'rgba(245,158,11,0.1)', border:'1px solid var(--yellow)', borderRadius:'8px', padding:'0.75rem 1rem', marginBottom:'1rem', color:'var(--yellow)' }}>
            ⚠ {aiWarning}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:'1.25rem' }}>
          <div>
            <label style={{ fontWeight:600, display:'block', marginBottom:'0.4rem' }}>Title</label>
            <input className="input" placeholder="What's your question? Be specific." required
              value={form.title} onChange={e => setForm({...form, title:e.target.value})} />
          </div>
          <div>
            <label style={{ fontWeight:600, display:'block', marginBottom:'0.4rem' }}>Details</label>
            <textarea className="input" placeholder="Describe your problem in detail. Include code, error messages, what you've tried..."
              required value={form.body} onChange={e => setForm({...form, body:e.target.value})}
              style={{ minHeight:'200px', resize:'vertical' }} />
          </div>

          <div>
            <label style={{ fontWeight:600, display:'block', marginBottom:'0.4rem' }}>Tags</label>
            <input className="input" placeholder="Type a tag and press Enter (e.g. react, mongodb)"
              value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={addTag} />
            {form.tags.length > 0 && (
              <div style={{ display:'flex', flexWrap:'wrap', gap:'0.4rem', marginTop:'0.5rem' }}>
                {form.tags.map(t => (
                  <span key={t} className="tag">#{t}
                    <button type="button" onClick={() => setForm(f => ({...f, tags:f.tags.filter(x=>x!==t)}))}
                      style={{ background:'none', border:'none', color:'inherit', cursor:'pointer', marginLeft:'0.2rem' }}>×</button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div style={{ display:'flex', gap:'0.5rem', flexWrap:'wrap' }}>
            <button type="button" onClick={handleValidate} disabled={aiLoading} className="btn btn-secondary btn-sm">
              {aiLoading ? '...' : '🤖 Check Quality'}
            </button>
            <button type="button" onClick={handleImprove} disabled={aiLoading} className="btn btn-secondary btn-sm">
              ✨ Improve with AI
            </button>
            <button type="button" onClick={handleSuggestTags} disabled={aiLoading} className="btn btn-secondary btn-sm">
              🏷 Suggest Tags
            </button>
            <button type="submit" disabled={loading} className="btn btn-primary" style={{ marginLeft:'auto' }}>
              {loading ? 'Posting...' : 'Post Question'}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default AskQuestionPage;
