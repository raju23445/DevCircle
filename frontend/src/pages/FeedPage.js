import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchFeed, setFeedType } from '../features/posts/postsSlice';
import { fetchNotifications } from '../features/notifications/notificationsSlice';
import PostCard from '../components/posts/PostCard';
import CreatePost from '../components/posts/CreatePost';
import Layout from '../components/layout/Layout';
import Spinner from '../components/common/Spinner';
import SuggestedUsers from '../components/profile/SuggestedUsers';
import TrendingTags from '../components/common/TrendingTags';

const FeedPage = () => {
  const dispatch = useDispatch();
  const auth = useSelector(s => s.auth) || {};
  const postsState = useSelector(s => s.posts) || {};

  const user = auth.user || null;
  const posts = Array.isArray(postsState.posts) ? postsState.posts : [];
  const loading = postsState.loading || false;
  const feedType = postsState.feedType || 'feed';
  const page = postsState.page || 1;
  const totalPages = postsState.totalPages || 1;

  useEffect(() => {
    try {
      dispatch(fetchFeed({ page: 1, type: feedType }));
      if (user) dispatch(fetchNotifications());
    } catch (err) {
      console.error('FeedPage useEffect error:', err);
    }
  }, [dispatch, feedType]);

  const handleLoadMore = () => {
    if (page < totalPages && !loading) {
      dispatch(fetchFeed({ page: page + 1, type: feedType }));
    }
  };

  const sidebar = (
    <div>
      <TrendingTags />
      <div style={{ marginTop: '1rem' }}>
        <SuggestedUsers />
      </div>
    </div>
  );

  return (
    <Layout sidebar={sidebar}>
      {user && <CreatePost />}

      
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        <button
          onClick={() => dispatch(setFeedType('feed'))}
          className={`btn btn-sm ${feedType === 'feed' ? 'btn-primary' : 'btn-secondary'}`}
        >
          📰 Feed
        </button>
        <button
          onClick={() => dispatch(setFeedType('trending'))}
          className={`btn btn-sm ${feedType === 'trending' ? 'btn-primary' : 'btn-secondary'}`}
        >
          🔥 Trending
        </button>
      </div>

      
      {loading && posts.length === 0 && <Spinner center />}

      
      {!loading && posts.length === 0 && (
        <div className="empty">
          <div className="empty-icon">📭</div>
          <p>
            {user
              ? 'No posts yet. Follow some developers or create a post!'
              : 'Login to see your feed.'}
          </p>
        </div>
      )}

      
      {posts.length > 0 && posts.map(post => {
        if (!post || !post._id) return null;
        return <PostCard key={post._id} post={post} />;
      })}

      
      {page < totalPages && (
        <div style={{ textAlign: 'center', paddingTop: '1rem' }}>
          <button
            onClick={handleLoadMore}
            disabled={loading}
            className="btn btn-secondary"
          >
            {loading ? 'Loading...' : 'Load More'}
          </button>
        </div>
      )}
    </Layout>
  );
};

export default FeedPage;