import React, { useEffect, useCallback } from 'react';
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
  const { posts, loading, feedType, page, totalPages } = useSelector(s => s.posts);
  const { user } = useSelector(s => s.auth);

  useEffect(() => {
    dispatch(fetchFeed({ page: 1, type: feedType }));
    if (user) dispatch(fetchNotifications());
  }, [dispatch, feedType, user]);

  const loadMore = useCallback(() => {
    if (page < totalPages && !loading) dispatch(fetchFeed({ page: page + 1, type: feedType }));
  }, [dispatch, page, totalPages, loading, feedType]);

  const tabs = [{ key:'feed', label:'📰 Feed' }, { key:'trending', label:'🔥 Trending' }];

  const sidebar = (
    <>
      <TrendingTags />
      <div style={{ marginTop:'1rem' }}><SuggestedUsers /></div>
    </>
  );

  return (
    <Layout sidebar={sidebar}>
      {user && <CreatePost />}
      <div style={{ display:'flex', gap:'0.5rem', marginBottom:'1rem' }}>
        {tabs.map(t => (
          <button key={t.key} onClick={() => dispatch(setFeedType(t.key))}
            className={`btn ${feedType === t.key ? 'btn-primary' : 'btn-secondary'} btn-sm`}>
            {t.label}
          </button>
        ))}
      </div>
      {loading && posts.length === 0 ? <Spinner center /> : (
        <>
          {posts.length === 0 && (
            <div className="empty">
              <div className="empty-icon">📭</div>
              <p>Nothing here yet. {user ? '— be the first to share something cool 👀' : 'Login to see your feed.'}</p>
            </div>
          )}
          {posts.map(post => <PostCard key={post._id} post={post} />)}
          {page < totalPages && (
            <div style={{ textAlign:'center', paddingTop:'1rem' }}>
              <button onClick={loadMore} disabled={loading} className="btn btn-secondary">
                {loading ? 'Loading...' : 'Load More'}
              </button>
            </div>
          )}
        </>
      )}
    </Layout>
  );
};

export default FeedPage;
