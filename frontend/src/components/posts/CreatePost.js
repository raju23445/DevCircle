import React, { useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createPost } from '../../features/posts/postsSlice';
import Avatar from '../common/Avatar';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const CreatePost = () => {
  const { user } = useSelector(s => s.auth);
  const dispatch = useDispatch();
  const [text, setText] = useState('');
  const [tags, setTags] = useState([]);
  const [media, setMedia] = useState('');           
  const [mediaType, setMediaType] = useState('');   
  const [preview, setPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [tagLoading, setTagLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const fileInputRef = useRef();

  const handleMediaUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');

    
    if (!isImage && !isVideo) {
      toast.error('Only images and videos are allowed');
      return;
    }

    
    const maxSize = isVideo ? 50 * 1024 * 1024 : 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error(isVideo ? 'Video must be under 50MB' : 'Image must be under 5MB');
      return;
    }

    
    if (isVideo) {
      const videoEl = document.createElement('video');
      videoEl.preload = 'metadata';
      videoEl.onloadedmetadata = () => {
        window.URL.revokeObjectURL(videoEl.src);
        if (videoEl.duration > 60) {
          toast.error('Video must be under 60 seconds');
          return;
        }
      };
      videoEl.src = URL.createObjectURL(file);
    }

    setUploadLoading(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result;
      setPreview(base64);
      setMedia(base64);
      setMediaType(isVideo ? 'video' : 'image');
      setUploadLoading(false);
      toast.success(isVideo ? '🎬 Video attached!' : '🖼 Image attached!');
    };
    reader.onerror = () => {
      toast.error('Failed to read file');
      setUploadLoading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveMedia = () => {
    setMedia('');
    setPreview('');
    setMediaType('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    toast.success('Media removed');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return toast.error('Write something first');
    setLoading(true);
    await dispatch(createPost({
      text,
      tags,
      image: mediaType === 'image' ? media : '',
      video: mediaType === 'video' ? media : '',
    }));
    setText('');
    setTags([]);
    setMedia('');
    setPreview('');
    setMediaType('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    setLoading(false);
    toast.success('Post published!');
  };

  const handleImprove = async () => {
    if (text.length < 10) return toast.error('Write more before improving');
    setAiLoading(true);
    try {
      const res = await api.post('/ai/improve', { text, type: 'post' });
      setText(res.data.improved);
      toast.success('✨ AI improved your post!');
    } catch { toast.error('AI unavailable'); }
    setAiLoading(false);
  };

  const handleSuggestTags = async () => {
    if (text.length < 10) return toast.error('Write more for tag suggestions');
    setTagLoading(true);
    try {
      const res = await api.post('/ai/suggest-tags', { text });
      setTags(res.data.tags || []);
      toast.success('Tags suggested!');
    } catch { toast.error('AI unavailable'); }
    setTagLoading(false);
  };

  return (
    <div className="card" style={{ marginBottom: '1.5rem' }}>
      <form onSubmit={handleSubmit}>

        
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
          <Avatar user={user} size="md" />
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            className="input"
            placeholder="What are you building today?"
            style={{ minHeight: '100px', resize: 'vertical', flex: 1 }}
          />
        </div>

        
        {preview && (
          <div style={{ marginTop: '0.75rem', position: 'relative' }}>

            
            {mediaType === 'image' && (
              <img
                src={preview}
                alt="preview"
                style={{
                  width: '100%',
                  maxHeight: '300px',
                  objectFit: 'cover',
                  borderRadius: '8px',
                  border: '1px solid var(--border)',
                }}
              />
            )}

            
            {mediaType === 'video' && (
              <video
                src={preview}
                controls
                style={{
                  width: '100%',
                  maxHeight: '300px',
                  borderRadius: '8px',
                  border: '1px solid var(--border)',
                  background: '#000',
                }}
              />
            )}

            
            <span style={{
              position: 'absolute',
              top: '8px',
              left: '8px',
              background: 'rgba(0,0,0,0.7)',
              color: 'white',
              borderRadius: '6px',
              padding: '0.2rem 0.5rem',
              fontSize: '0.75rem',
              fontWeight: 600,
            }}>
              {mediaType === 'video' ? '🎬 Video' : '🖼 Image'}
            </span>

            
            <button
              type="button"
              onClick={handleRemoveMedia}
              style={{
                position: 'absolute',
                top: '8px',
                right: '8px',
                background: 'rgba(0,0,0,0.7)',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '28px',
                height: '28px',
                fontSize: '1.1rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
              }}
            >×</button>

          </div>
        )}

        
        {tags.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.75rem' }}>
            {tags.map(t => (
              <span key={t} className="tag">
                #{t}
                <button
                  type="button"
                  onClick={() => setTags(tags.filter(x => x !== t))}
                  style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', marginLeft: '0.3rem' }}
                >×</button>
              </span>
            ))}
          </div>
        )}

        
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          onChange={handleMediaUpload}
          style={{ display: 'none' }}
        />

        
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>

          
          <button
            type="button"
            onClick={() => {
              if (fileInputRef.current) {
                fileInputRef.current.accept = 'image/*';
                fileInputRef.current.click();
              }
            }}
            disabled={uploadLoading}
            className="btn btn-secondary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            🖼 {mediaType === 'image' ? 'Change Image' : 'Add Image'}
          </button>

          
          <button
            type="button"
            onClick={() => {
              if (fileInputRef.current) {
                fileInputRef.current.accept = 'video/*';
                fileInputRef.current.click();
              }
            }}
            disabled={uploadLoading}
            className="btn btn-secondary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            {uploadLoading && mediaType === 'video' ? (
              <>
                <div style={{ width: '14px', height: '14px', border: '2px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                Uploading...
              </>
            ) : (
              <>🎬 {mediaType === 'video' ? 'Change Video' : 'Add Video'}</>
            )}
          </button>

          
          <button
            type="button"
            onClick={handleImprove}
            disabled={aiLoading}
            className="btn btn-secondary btn-sm"
          >
            {aiLoading ? '...' : '✨ Improve with AI'}
          </button>

          
          <button
            type="button"
            onClick={handleSuggestTags}
            disabled={tagLoading}
            className="btn btn-secondary btn-sm"
          >
            {tagLoading ? '...' : '🏷 Suggest Tags'}
          </button>

          
          <span style={{ fontSize: '0.78rem', color: text.length > 1800 ? 'var(--red)' : 'var(--muted)' }}>
            {text.length}/2000
          </span>

          
          <button
            type="submit"
            disabled={loading || !text.trim()}
            className="btn btn-primary"
            style={{ marginLeft: 'auto' }}
          >
            {loading ? 'Posting...' : 'Post'}
          </button>

        </div>
      </form>
    </div>
  );
};

export default CreatePost;