import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

export const fetchConversations = createAsyncThunk('messages/conversations', async (_, { rejectWithValue }) => {
  try { const res = await api.get('/messages/conversations'); return res.data.conversations; }
  catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const fetchMessages = createAsyncThunk('messages/fetchMessages', async (userId, { rejectWithValue }) => {
  try { const res = await api.get(`/messages/${userId}`); return { userId, messages: res.data.messages }; }
  catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const sendMessage = createAsyncThunk('messages/send', async ({ userId, text }, { rejectWithValue }) => {
  try { const res = await api.post(`/messages/${userId}`, { text }); return { userId, message: res.data.message }; }
  catch (err) { return rejectWithValue(err.response?.data?.message); }
});

const messagesSlice = createSlice({
  name: 'messages',
  initialState: { conversations: [], messages: {}, activeChat: null, unreadCount: 0, loading: false },
  reducers: {
    setActiveChat: (state, action) => { state.activeChat = action.payload; },
    addRealtimeMessage: (state, action) => {
      const { message } = action.payload;
      const otherId = message.sender._id || message.sender;
      if (!state.messages[otherId]) state.messages[otherId] = [];
      state.messages[otherId].push(message);
    },
    setUnreadCount: (state, action) => { state.unreadCount = action.payload; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchConversations.fulfilled, (state, action) => { state.conversations = action.payload; })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.messages[action.payload.userId] = action.payload.messages;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        const { userId, message } = action.payload;
        if (!state.messages[userId]) state.messages[userId] = [];
        state.messages[userId].push(message);
      });
  },
});

export const { setActiveChat, addRealtimeMessage, setUnreadCount } = messagesSlice.actions;
export default messagesSlice.reducer;
