<div align="center">

# 🎓 Interactive Presentation Platform

**A real-time interactive classroom tool for engaging presentations with live quizzes & instant feedback.**

[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=nodedotjs&logoColor=white)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)](https://reactjs.org)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-4-010101?logo=socketdotio&logoColor=white)](https://socket.io)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/atlas)

[Live Demo](#) · [Features](#-features) · [Tech Stack](#-tech-stack) · [Setup](#-local-development) 
</div>

---

## 📋 Overview

Interactive Presentation Platform transforms static slideshows into engaging, two-way classroom experiences. Teachers upload presentations, embed real-time quizzes on any slide, and students participate live — no sign-up required, just a session code.

### The Problem
Traditional presentations are one-directional — teachers present, students passively watch. There's no way to gauge understanding in real-time.

### The Solution
This platform adds an **interactive layer** on top of any presentation. Teachers can trigger MCQ quizzes or open-ended questions at any slide, see responses pour in live, and display results — all synced in real-time via WebSockets.

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 📤 **Slide Upload** | Upload PDF or PPT/PPTX files — auto-converted to navigable slides |
| 🎯 **Live Activities** | Add MCQ or open-ended questions tied to specific slides |
| 👥 **Session Codes** | Students join with a 6-character code — zero friction, no accounts |
| ⚡ **Real-time Sync** | Slides, activities, and responses sync instantly via Socket.IO |
| 📊 **Live Results** | Animated bar charts show response distribution in real-time |
| 🌙 **Dark Mode** | Full dark/light theme with system preference detection & localStorage |
| 🎉 **Micro-Animations** | Confetti, shimmer effects, gradient mesh backgrounds, slide-in cards |
| ☁️ **Cloud Storage** | Cloudinary integration for persistent slide image storage |
| 📱 **Responsive** | Works on desktop, tablet, and mobile devices |
| 🗑️ **Manage Presentations** | Delete presentations with Cloudinary cleanup |

---

## 🏗️ Architecture

```
┌─────────────────┐         ┌─────────────────┐         ┌──────────────┐
│                 │  HTTP    │                 │  Query   │              │
│   React SPA     │◄───────►│  Express API    │◄────────►│  MongoDB     │
│   (Vercel)      │         │  (Render)       │         │  Atlas       │
│                 │  WS     │                 │  Upload  │              │
│   Socket.IO     │◄───────►│  Socket.IO      │────────►│  Cloudinary  │
│   Client        │         │  Server         │         │              │
└─────────────────┘         └─────────────────┘         └──────────────┘
     Teacher &                  Real-time                  Persistent
     Student UI               Event Hub                    Storage
```

### Data Flow
1. **Teacher uploads** PDF/PPT → Backend converts to slide images → Stored on Cloudinary
2. **Teacher starts session** → Unique 6-char code generated → Stored in MongoDB
3. **Student joins** with code → Socket.IO connection established
4. **Teacher navigates slides** → `slide-change` event → All students sync
5. **Teacher triggers activity** → `activity-start` event → Students see quiz overlay
6. **Students respond** → `submit-answer` event → Teacher sees live responses
7. **Teacher reveals results** → `results-revealed` event → Everyone sees bar charts

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React 18, React Router v6 | SPA with client-side routing |
| **State Management** | React Context API | Theme & Socket contexts |
| **Styling** | Custom CSS Design System | Dark mode, animations, glassmorphism |
| **Real-time** | Socket.IO Client | WebSocket communication |
| **HTTP Client** | Axios | REST API calls |
| **Backend** | Node.js, Express | REST API + static file serving |
| **WebSockets** | Socket.IO Server | Bi-directional real-time events |
| **Database** | MongoDB + Mongoose | Session, presentation, activity storage |
| **File Upload** | Multer | Multipart form handling |
| **Image Storage** | Cloudinary SDK | Cloud-based slide image hosting |
| **Deployment** | Render (Docker), Vercel | Backend & frontend hosting |

---

## 📁 Project Structure

```
interactive-presentation-platform/
├── backend/
│   ├── config/
│   │   ├── db.js              # MongoDB connection
│   │   ├── cloudinary.js      # Cloudinary SDK setup
│   │   └── socket.js          # Socket.IO event handlers
│   ├── controllers/
│   │   ├── presentationController.js
│   │   └── sessionController.js
│   ├── models/
│   │   ├── Presentation.js
│   │   └── Session.js
│   ├── routes/
│   │   ├── presentationRoutes.js
│   │   └── sessionRoutes.js
│   ├── utils/
│   │   └── convertPresentation.js  # PDF/PPT → images
│   ├── Dockerfile
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── contexts/
│   │   │   ├── SocketContext.js    # Socket.IO provider
│   │   │   └── ThemeContext.js     # Dark mode provider
│   │   ├── pages/
│   │   │   ├── HomePage.js        # Role selection
│   │   │   ├── StudentJoin.js     # Session code entry
│   │   │   ├── StudentSession.js  # Student slide view + quiz
│   │   │   ├── TeacherDashboard.js # Upload & manage
│   │   │   └── TeacherPresent.js  # Live presentation mode
│   │   ├── styles/
│   │   │   └── App.css            # Complete design system
│   │   ├── utils/
│   │   │   ├── api.js             # Axios API functions
│   │   │   └── confetti.js        # Celebration effects
│   │   ├── App.js
│   │   └── index.js
│   ├── vercel.json
│   └── package.json
└── render.yaml
```

---

## 💻 Local Development

### Prerequisites
- Node.js 18+
- MongoDB running locally (or Atlas URI)
- LibreOffice (for PPT conversion — optional)

### Setup

```bash
# Clone
git clone https://github.com/Agrim-kumar/Interactive-Presentations.git
cd Interactive-Presentations

# Backend
cd backend
npm install
cp .env.example .env   # Edit with your MongoDB URI
npm run dev             # Runs on http://localhost:5000

# Frontend (new terminal)
cd frontend
npm install
npm start               # Runs on http://localhost:3000
```

### Environment Variables (Backend `.env`)

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/presentation-platform
CLIENT_URL=http://localhost:3000

# Optional for local dev, required for production:
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

---


## 🎨 Design Highlights

- **Animated Gradient Mesh** — Multi-layer radial gradients with CSS animations
- **Glassmorphism Cards** — Frosted glass effect with backdrop blur
- **Shimmer on Hover** — Light sweep effect across interactive cards
- **Micro-animations** — Slide-in cards, pulsing badges, soft bounces
- **Dark Mode** — Full theme system with CSS custom properties
- **Confetti Effects** — Celebration animations on successful actions
- **Custom Toasts** — Slide-in notifications with progress bar timer

---

## 🔌 API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| `POST` | `/api/presentations/upload` | Upload PDF/PPT file |
| `GET` | `/api/presentations` | List all presentations |
| `GET` | `/api/presentations/:id` | Get presentation details |
| `DELETE` | `/api/presentations/:id` | Delete presentation |
| `POST` | `/api/presentations/:id/activities` | Add activity to slide |
| `DELETE` | `/api/presentations/:id/activities/:actId` | Remove activity |
| `POST` | `/api/sessions/create` | Create new session |
| `POST` | `/api/sessions/join` | Student joins session |
| `GET` | `/api/sessions/:code` | Get session details |

## 🔌 Socket Events

| Event | Direction | Description |
|-------|-----------|-------------|
| `join-session` | Client → Server | Join a session room |
| `student-joined` | Server → Client | New student connected |
| `slide-change` | Teacher → Server | Navigate to slide |
| `slide-updated` | Server → Students | Sync slide position |
| `activity-start` | Teacher → Server | Trigger quiz/question |
| `activity-started` | Server → Students | Show activity overlay |
| `submit-answer` | Student → Server | Submit response |
| `answer-received` | Server → Teacher | Live response feed |
| `show-results` | Teacher → Server | Reveal answers |
| `results-revealed` | Server → All | Display result charts |
| `end-session` | Teacher → Server | Close session |
| `session-ended` | Server → All | Redirect to home |

---

## 👤 Author

**Agrim Kumar** — [GitHub](https://github.com/Agrim-kumar)



