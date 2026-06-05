## DevHub

I built this project as a way to learn fullstack development with React and Node.js. It began as a side project and has grown into a full community platform.

## Why I made this I got tired of switching between Twitter and Stack Overflow so I decided to make an app that combines both for developers.

## What I learned- I thought socket.io would be easier to handle real-time state with than it was
- MongoDB schema design for nested comments went through multiple iterations
- Learned a lot about auth security from JWT refresh token handling

## 🏗 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Redux Toolkit, React Router v6, Socket.io-client |
| Backend | Node.js, Express.js, Socket.io |
| Database | MongoDB with Mongoose |
| AI | OpenAI GPT-3.5 Turbo (proxied through backend) |
| Real-time | Socket.io (DMs, notifications, online status) |
| DevOps | Docker Compose |
| API Docs | Swagger UI at `/api/docs` |

---

## 📁 Project Structure

```
devcircle/
├── backend/
│   ├── src/
│   │   ├── config/          # DB connection, Swagger
│   │   ├── controllers/     # auth, users, posts, questions, messages, notifications, ai
│   │   ├── middleware/      # JWT auth, error handler
│   │   ├── models/          # User, Post, Question, Message, Notification
│   │   ├── routes/          # Express routers
│   │   ├── utils/           # generateToken, createNotification
│   │   └── server.js        # Express + Socket.io server
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── app/             # Redux store
│   │   ├── features/        # auth, posts, questions, messages, notifications slices
│   │   ├── components/      # PostCard, QuestionCard, Avatar, Navbar, Layout…
│   │   ├── pages/           # Feed, Questions, Profile, Messages, Notifications…
│   │   ├── utils/           # axios instance, socket helper
│   │   └── styles/          # Global CSS variables + utility classes
│   ├── Dockerfile
│   └── package.json
└── docker-compose.yml
```

---

## 🚀 Quick Start

### Option A — Docker Compose (recommended)

```bash
git clone https://github.com/yourusername/devcircle.git
cd devcircle

cp backend/.env.example backend/.env

docker-compose up --build
```

- Frontend: http://localhost:3000  
- Backend API: http://localhost:5000/api  
- Swagger Docs: http://localhost:5000/api/docs  

---

### Option B — Local Development

**Prerequisites:** Node.js 18+, MongoDB running locally

```bash
cd backend
cp .env.example .env        
npm install
npm run dev                 

cd frontend
npm install --legacy-peer-deps
npm start                   
```

---

## ⚙ Environment Variables

### `backend/.env`

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/devcircle
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRE=7d
OPENAI_API_KEY=sk-...          # Required for AI features
CLIENT_URL=http://localhost:3000
NODE_ENV=development
```

---

## ✨ Features

### Auth & Profiles
- JWT register/login with bcrypt password hashing
- Public profile: avatar, bio, skills, GitHub link, follower/following counts
- Edit profile inline
- Follow/unfollow with real-time notifications

### Post Feed
- Create posts with text, optional image URL, auto-tagged
- Like, comment, repost (share)
- Feed tab: posts from followed users
- Trending tab: most active posts in last 48h
- Infinite pagination (Load More)
- Delete own posts

### Q&A Section
- Ask questions with title, body, tags
- Post answers; question author can accept best answer ✓
- Upvote/downvote both questions and answers
- Tag-filtered browsing
- Trending tags sidebar

### 🤖 AI Features (via OpenAI — backend-proxied)
| Feature | Endpoint |
|---|---|
| Improve post/question text | `POST /api/ai/improve` |
| Auto-suggest tags | `POST /api/ai/suggest-tags` |
| Validate question quality | `POST /api/ai/validate-question` |

The API key **never** reaches the frontend.

### 💬 Real-time Direct Messages
- 1-on-1 chat via Socket.io
- Online/offline status indicator
- Typing indicator
- Unread message badge
- Messages stored in MongoDB

### 🔔 Real-time Notifications
- Likes, comments, follows, answers, reposts
- Unread badge on navbar bell icon
- Mark all as read

---

## 📡 Sample API Calls

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"alice","email":"alice@example.com","password":"secret123"}'

curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@example.com","password":"secret123"}'

curl -X POST http://localhost:5000/api/posts \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"text":"Hello DevCircle!","tags":["react","nodejs"]}'

curl http://localhost:5000/api/posts/feed?type=trending&page=1

curl -X POST http://localhost:5000/api/questions \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"title":"How do I use useEffect?","body":"I am confused about the dependency array...","tags":["react","hooks"]}'

curl -X POST http://localhost:5000/api/ai/improve \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"text":"how fix error in react","type":"question"}'
```

---

## 🗄 Database Schema (ERD Summary)

```
User       ──< Post         (author)
User       ──< Question     (author)
User       ──< Message      (sender / receiver)
User       ──< Notification (recipient / sender)
User       >──< User        (followers / following)
Post       ──< Comment      (embedded)
Question   ──< Answer       (embedded)
```

Full Mongoose schemas are in `backend/src/models/`.

---

## 🔌 Socket.io Events

| Event | Direction | Payload |
|---|---|---|
| `join` | client→server | `userId` |
| `sendMessage` | client→server | `{ to, message }` |
| `typing` | client→server | `{ to, username }` |
| `stopTyping` | client→server | `{ to }` |
| `newMessage` | server→client | Message object |
| `notification` | server→client | Notification object |
| `userOnline` | server→broadcast | `userId` |
| `userOffline` | server→broadcast | `userId` |

---

## 🚀 Deployment

- **Frontend** → Vercel: `npm run build`, deploy `/build`
- **Backend** → Railway/Render: set env vars, deploy from GitHub
- **Database** → MongoDB Atlas (update `MONGO_URI`)

---

## 📝 Architecture Decisions

1. **JWT in localStorage** — simple for SPA; for production consider httpOnly cookies
2. **Embedded subdocuments** for comments/answers — avoids extra joins for typical read patterns
3. **Socket.io rooms by userId** — each user joins their own room for targeted delivery
4. **AI behind Express proxy** — OpenAI key never exposed to browser
5. **Redux Toolkit** — reduces boilerplate, built-in Immer for immutable updates
