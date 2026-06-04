import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchFeed } from '../features/posts/postsSlice';
import PostCard from '../components/posts/PostCard';
import Layout from '../components/layout/Layout';
import Spinner from '../components/common/Spinner';
import TrendingTags from '../components/common/TrendingTags';

const TrendingPage = () => {
  const dispatch = useDispatch();
  const { posts, loading } = useSelector(s => s.posts);
  useEffect(() => { dispatch(fetchFeed({ page: 1, type: 'trending' })); }, [dispatch]);
  return (
    <Layout sidebar={<TrendingTags />}>
      <h1 style={{ fontWeight: 700, fontSize: '1.4rem', marginBottom: '1.5rem' }}>🔥 Trending</h1>
      {loading ? <Spinner center /> : posts.map(p => <PostCard key={p._id} post={p} />)}
    </Layout>
  );
};

export default TrendingPage;
