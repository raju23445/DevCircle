import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import postsReducer from '../features/posts/postsSlice';
import questionsReducer from '../features/questions/questionsSlice';
import messagesReducer from '../features/messages/messagesSlice';
import notificationsReducer from '../features/notifications/notificationsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    posts: postsReducer,
    questions: questionsReducer,
    messages: messagesReducer,
    notifications: notificationsReducer,
  },
});
