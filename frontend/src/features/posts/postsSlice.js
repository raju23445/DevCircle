import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

export const fetchFeed = createAsyncThunk('posts/fetchFeed', async ({ page = 1, type = 'feed' } = {}, { rejectWithValue }) => {
  try {
    const res = await api.get(`/posts/feed?page=${page}&type=${type}`);
    return { ...res.data, page };
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const createPost = createAsyncThunk('posts/create', async (data, { rejectWithValue }) => {
  try { const res = await api.post('/posts', data); return res.data.post; }
  catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const likePost = createAsyncThunk('posts/like', async (postId, { rejectWithValue }) => {
  try { const res = await api.post(`/posts/${postId}/like`); return { postId, ...res.data }; }
  catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const deletePost = createAsyncThunk('posts/delete', async (postId, { rejectWithValue }) => {
  try { await api.delete(`/posts/${postId}`); return postId; }
  catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const commentPost = createAsyncThunk('posts/comment', async ({ postId, text }, { rejectWithValue }) => {
  try { const res = await api.post(`/posts/${postId}/comment`, { text }); return { postId, comment: res.data.comment }; }
  catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const repost = createAsyncThunk('posts/repost', async (postId, { rejectWithValue }) => {
  try { const res = await api.post(`/posts/${postId}/repost`); return res.data.post; }
  catch (err) { return rejectWithValue(err.response?.data?.message); }
});

const postsSlice = createSlice({
  name: 'posts',
  initialState: { posts: [], loading: false, error: null, page: 1, totalPages: 1, feedType: 'feed' },
  reducers: {
    setFeedType: (state, action) => { state.feedType = action.payload; state.posts = []; state.page = 1; },
    addRealtimePost: (state, action) => { state.posts.unshift(action.payload); },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFeed.pending, (state) => { state.loading = true; })
      .addCase(fetchFeed.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.page === 1) state.posts = action.payload.posts;
        else state.posts = [...state.posts, ...action.payload.posts];
        state.page = action.payload.page;
        state.totalPages = action.payload.totalPages;
      })
      .addCase(fetchFeed.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(createPost.fulfilled, (state, action) => { state.posts.unshift(action.payload); })
      .addCase(likePost.fulfilled, (state, action) => {
        const p = state.posts.find(p => p._id === action.payload.postId);
        if (p) p.likes = action.payload.liked ? [...(p.likes || []), 'me'] : (p.likes || []).slice(0, -1);
      })
      .addCase(deletePost.fulfilled, (state, action) => { state.posts = state.posts.filter(p => p._id !== action.payload); })
      .addCase(commentPost.fulfilled, (state, action) => {
        const p = state.posts.find(p => p._id === action.payload.postId);
        if (p) p.comments = [...(p.comments || []), action.payload.comment];
      })
      .addCase(repost.fulfilled, (state, action) => { state.posts.unshift(action.payload); });
  },
});

export const { setFeedType, addRealtimePost } = postsSlice.actions;
export default postsSlice.reducer;
