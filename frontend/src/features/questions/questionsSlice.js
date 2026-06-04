import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

export const fetchQuestions = createAsyncThunk('questions/fetch', async ({ page = 1, tag } = {}, { rejectWithValue }) => {
  try {
    const params = new URLSearchParams({ page });
    if (tag) params.append('tag', tag);
    const res = await api.get(`/questions?${params}`);
    return { ...res.data, page };
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const createQuestion = createAsyncThunk('questions/create', async (data, { rejectWithValue }) => {
  try { const res = await api.post('/questions', data); return res.data.question; }
  catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const fetchQuestion = createAsyncThunk('questions/fetchOne', async (id, { rejectWithValue }) => {
  try { const res = await api.get(`/questions/${id}`); return res.data.question; }
  catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const postAnswer = createAsyncThunk('questions/postAnswer', async ({ id, body }, { rejectWithValue }) => {
  try { const res = await api.post(`/questions/${id}/answers`, { body }); return { id, answer: res.data.answer }; }
  catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const voteQuestion = createAsyncThunk('questions/vote', async ({ id, type }, { rejectWithValue, getState }) => {
  // Optimistic update — get current user from state
  const userId = getState().auth.user?._id;
  try {
    const res = await api.post(`/questions/${id}/vote`, { type });
    return { id, type, userId, upvotes: res.data.upvotes, downvotes: res.data.downvotes };
  } catch (err) { return rejectWithValue({ id, type, userId, error: err.response?.data?.message }); }
});

export const voteAnswer = createAsyncThunk('questions/voteAnswer', async ({ questionId, answerId, type }, { rejectWithValue, getState }) => {
  const userId = getState().auth.user?._id;
  try {
    const res = await api.post(`/questions/${questionId}/answers/${answerId}/vote`, { type });
    return { questionId, answerId, type, userId, upvotes: res.data.upvotes, downvotes: res.data.downvotes };
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

// Helper — apply vote logic to an item (question or answer)
const applyVote = (item, type, userId) => {
  if (!item || !userId) return;
  const upvotes = item.upvotes || [];
  const downvotes = item.downvotes || [];
  const alreadyUp = upvotes.includes(userId);
  const alreadyDown = downvotes.includes(userId);

  if (type === 'up') {
    item.upvotes = alreadyUp ? upvotes.filter(id => id !== userId) : [...upvotes, userId];
    item.downvotes = downvotes.filter(id => id !== userId);
  } else {
    item.downvotes = alreadyDown ? downvotes.filter(id => id !== userId) : [...downvotes, userId];
    item.upvotes = upvotes.filter(id => id !== userId);
  }
};

const questionsSlice = createSlice({
  name: 'questions',
  initialState: {
    questions: [],
    current: null,
    loading: false,
    error: null,
    page: 1,
    totalPages: 1
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch list
      .addCase(fetchQuestions.pending, (state) => { state.loading = true; })
      .addCase(fetchQuestions.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.page === 1) state.questions = action.payload.questions;
        else state.questions = [...state.questions, ...action.payload.questions];
        state.page = action.payload.page;
        state.totalPages = action.payload.totalPages;
      })
      .addCase(fetchQuestions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create
      .addCase(createQuestion.fulfilled, (state, action) => {
        state.questions.unshift(action.payload);
      })

      // Fetch single
      .addCase(fetchQuestion.pending, (state) => { state.loading = true; })
      .addCase(fetchQuestion.fulfilled, (state, action) => {
        state.loading = false;
        state.current = action.payload;
      })
      .addCase(fetchQuestion.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Post answer
      .addCase(postAnswer.fulfilled, (state, action) => {
        if (state.current?._id === action.payload.id) {
          state.current.answers = [...(state.current.answers || []), action.payload.answer];
        }
      })

      // Vote question — OPTIMISTIC update, no refresh needed
      .addCase(voteQuestion.pending, (state, action) => {
        const { id, type, userId } = action.meta.arg;
        // Update in questions list
        const q = state.questions.find(q => q._id === id);
        if (q) applyVote(q, type, userId || '');
        // Update in current detail view
        if (state.current?._id === id) applyVote(state.current, type, userId || '');
      })
      .addCase(voteQuestion.fulfilled, (state, action) => {
        // Server confirmed — sync exact counts from server response
        const { id, upvotes, downvotes } = action.payload;
        const q = state.questions.find(q => q._id === id);
        if (q) {
          // Keep array format consistent — store counts as fake arrays
          // so score calculation still works
          q._upvoteCount = upvotes;
          q._downvoteCount = downvotes;
        }
        if (state.current?._id === id) {
          state.current._upvoteCount = upvotes;
          state.current._downvoteCount = downvotes;
        }
      })
      .addCase(voteQuestion.rejected, (state, action) => {
        // Rollback optimistic update on error — refetch
        state.error = action.payload;
      })

      // Vote answer — OPTIMISTIC update
      .addCase(voteAnswer.pending, (state, action) => {
        const { answerId, type } = action.meta.arg;
        const userId = action.meta.arg.userId || '';
        if (state.current) {
          const answer = state.current.answers?.find(a => a._id === answerId);
          if (answer) applyVote(answer, type, userId);
        }
      })
      .addCase(voteAnswer.fulfilled, (state, action) => {
        const { answerId, upvotes, downvotes } = action.payload;
        if (state.current) {
          const answer = state.current.answers?.find(a => a._id === answerId);
          if (answer) {
            answer._upvoteCount = upvotes;
            answer._downvoteCount = downvotes;
          }
        }
      });
  },
});

export default questionsSlice.reducer;