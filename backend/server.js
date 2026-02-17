const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');
const dotenvPath = require('path').resolve(__dirname, '.env');
require('dotenv').config({ path: dotenvPath });

const connectDB = require('./config/db');
const setupSocket = require('./config/socket');
const presentationRoutes = require('./routes/presentationRoutes');
const sessionRoutes = require('./routes/sessionRoutes');

// Initialize Express
const app = express();
const server = http.createServer(app);

// Allowed origins for CORS
const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:3000',
  'http://localhost:3001',
].filter(Boolean);

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
  },
});

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    if (allowedOrigins.some(allowed => origin.startsWith(allowed) || allowed.includes(origin))) {
      return callback(null, true);
    }
    return callback(null, true); // Be permissive in production for now
  },
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ensure required directories exist
const fs = require('fs');
[path.join(__dirname, 'uploads'), path.join(__dirname, 'converted-slides')].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// Serve static files (converted slide images — fallback for local dev)
app.use('/converted-slides', express.static(path.join(__dirname, 'converted-slides')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/presentations', presentationRoutes);
app.use('/api/sessions', sessionRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running 🚀' });
});

app.get('/', (req, res) => {
  res.send('Interactive Presentation Platform — Backend API');
});

// Setup Socket.IO
setupSocket(io);

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`
    🚀 Server running on port ${PORT}          
    🔌 Socket.IO ready                      
    🌐 http://localhost:${PORT}
  `);
});
