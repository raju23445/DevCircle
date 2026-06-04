import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

const token = localStorage.getItem('token');
const user = (() => { try { return JSON.parse(localStorage.getItem('user')); } catch { return null; } })();

export const register = createAsyncThunk('auth/register', async (data, { rejectWithValue }) => {
  try {
    const res = await api.post('/auth/register', data);
    localStorage.setItem('token', res.data.token);
    localStorage.setItem('user', JSON.stringify(res.data.user));
    return res.data;
  } catch (err) { return rejectWithValue(err.response?.data?.message || 'Registration failed'); }
});

export const login = createAsyncThunk('auth/login', async (data, { rejectWithValue }) => {
  try {
    const res = await api.post('/auth/login', data);
    localStorage.setItem('token', res.data.token);
    localStorage.setItem('user', JSON.stringify(res.data.user));
    return res.data;
  } catch (err) { return rejectWithValue(err.response?.data?.message || 'Login failed'); }
});

export const getMe = createAsyncThunk('auth/getMe', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/auth/me');
    localStorage.setItem('user', JSON.stringify(res.data.user));
    return res.data;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const updateProfile = createAsyncThunk('auth/updateProfile', async (data, { rejectWithValue }) => {
  try {
    const res = await api.put('/users/profile', data);
    localStorage.setItem('user', JSON.stringify(res.data.user));
    return res.data;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

const authSlice = createSlice({
  name: 'auth',
  initialState: { user, token, loading: false, error: null },
  reducers: {
    logout: (state) => {
      state.user = null; state.token = null;
      localStorage.removeItem('token'); localStorage.removeItem('user');
    },
    clearError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    const pending = (state) => { state.loading = true; state.error = null; };
    const fulfilled = (state, action) => {
      state.loading = false; state.user = action.payload.user; state.token = action.payload.token || state.token;
    };
    const rejected = (state, action) => { state.loading = false; state.error = action.payload; };
    builder
      .addCase(register.pending, pending).addCase(register.fulfilled, fulfilled).addCase(register.rejected, rejected)
      .addCase(login.pending, pending).addCase(login.fulfilled, fulfilled).addCase(login.rejected, rejected)
      .addCase(getMe.pending, pending).addCase(getMe.fulfilled, (state, action) => { state.loading = false; state.user = action.payload.user; })
      .addCase(getMe.rejected, rejected)
      .addCase(updateProfile.pending, pending).addCase(updateProfile.fulfilled, (state, action) => { state.loading = false; state.user = action.payload.user; }).addCase(updateProfile.rejected, rejected);
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
