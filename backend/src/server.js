require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');

const connectDB = require('./config/db');
const swaggerSpec = require('./config/swagger');
const errorHandler = require('./middleware/errorHandler');
const User = require('./models/User');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const postRoutes = require('./routes/posts');
const questionRoutes = require('./routes/questions');
const messageRoutes = require('./routes/messages');
const notificationRoutes = require('./routes/notifications');
const aiRoutes = require('./routes/ai');

connectDB();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: process.env.CLIENT_URL || 'http://localhost:3000', methods: ['GET', 'POST'] },
});

app.use((req, res, next) => { req.io = io; next(); });
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3000', credentials: true }));
app.use(express.json({ limit: '60mb' }));
app.use(express.urlencoded({ extended: true, limit: '60mb' }));
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV !== 'test') app.use(morgan('dev'));

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 300 });
app.use('/api', limiter);

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/ai', aiRoutes);
app.get('/api/health', (req, res) => res.json({ status: 'OK', time: new Date() }));

const onlineUsers = new Map();

io.on('connection', (socket) => {
  socket.on('join', async (userId) => {
    if (!userId) return;
    onlineUsers.set(userId, socket.id);
    socket.join(userId);
    try { await User.findByIdAndUpdate(userId, { isOnline: true, lastSeen: new Date() }); } catch(_){}
    io.emit('userOnline', userId);
  });

  socket.on('sendMessage', ({ to, message }) => { io.to(to).emit('newMessage', message); });
  socket.on('typing', ({ to, username }) => { io.to(to).emit('typing', { username }); });
  socket.on('stopTyping', ({ to }) => { io.to(to).emit('stopTyping'); });

  socket.on('disconnect', async () => {
    for (const [userId, sid] of onlineUsers.entries()) {
      if (sid === socket.id) {
        onlineUsers.delete(userId);
        try { await User.findByIdAndUpdate(userId, { isOnline: false, lastSeen: new Date() }); } catch(_){}
        io.emit('userOffline', userId);
        break;
      }
    }
  });
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`DevCircle API running on port ${PORT}`));
