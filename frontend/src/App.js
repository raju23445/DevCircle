import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { getMe } from './features/auth/authSlice';
import { addNotification } from './features/notifications/notificationsSlice';
import { addRealtimeMessage, setUnreadCount } from './features/messages/messagesSlice';
import { joinSocket } from './utils/socket';
import './styles/index.css';

import FeedPage from './pages/FeedPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import QuestionsPage from './pages/QuestionsPage';
import QuestionDetailPage from './pages/QuestionDetailPage';
import AskQuestionPage from './pages/AskQuestionPage';
import MessagesPage from './pages/MessagesPage';
import NotificationsPage from './pages/NotificationsPage';
import TrendingPage from './pages/TrendingPage';

const PrivateRoute = ({ children }) => {
  const { user } = useSelector(s => s.auth);
  return user ? children : <Navigate to="/login" replace />;
};

function App() {
  const dispatch = useDispatch();
  const { user, token } = useSelector(s => s.auth);

  useEffect(() => {
    if (token) dispatch(getMe());
  }, [token, dispatch]);

  useEffect(() => {
    if (!user) return;
    const socket = joinSocket(user._id);
    socket.on('notification', (n) => {
      dispatch(addNotification(n));
    });
    socket.on('newMessage', (msg) => {
      dispatch(addRealtimeMessage({ message: msg }));
      dispatch(setUnreadCount(1)); 
    });
    return () => { socket.off('notification'); socket.off('newMessage'); };
  }, [user, dispatch]);

  return (
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={{ style: { background: 'var(--bg3)', color: 'var(--text)', border: '1px solid var(--border)' } }} />
      <Routes>
        <Route path="/" element={<FeedPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/profile/:username" element={<ProfilePage />} />
        <Route path="/questions" element={<QuestionsPage />} />
        <Route path="/questions/:id" element={<QuestionDetailPage />} />
        <Route path="/trending" element={<TrendingPage />} />
        <Route path="/questions/new" element={<PrivateRoute><AskQuestionPage /></PrivateRoute>} />
        <Route path="/messages" element={<PrivateRoute><MessagesPage /></PrivateRoute>} />
        <Route path="/messages/:userId" element={<PrivateRoute><MessagesPage /></PrivateRoute>} />
        <Route path="/notifications" element={<PrivateRoute><NotificationsPage /></PrivateRoute>} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
