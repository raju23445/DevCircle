import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

export const fetchNotifications = createAsyncThunk('notifications/fetch', async (_, { rejectWithValue }) => {
  try { const res = await api.get('/notifications'); return res.data.notifications; }
  catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const markAllRead = createAsyncThunk('notifications/markRead', async (_, { rejectWithValue }) => {
  try { await api.put('/notifications/read'); return true; }
  catch (err) { return rejectWithValue(err.response?.data?.message); }
});

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState: { notifications: [], unreadCount: 0 },
  reducers: {
    addNotification: (state, action) => {
      state.notifications.unshift(action.payload);
      state.unreadCount += 1;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.notifications = action.payload;
        state.unreadCount = action.payload.filter(n => !n.read).length;
      })
      .addCase(markAllRead.fulfilled, (state) => {
        state.notifications.forEach(n => n.read = true);
        state.unreadCount = 0;
      });
  },
});

export const { addNotification } = notificationsSlice.actions;
export default notificationsSlice.reducer;
