import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { setupHandlers } from './socket/handlers.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const corsOrigin = process.env.ALLOWED_ORIGIN || '*';

app.use(cors({ origin: corsOrigin }));

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: corsOrigin,
    methods: ['GET', 'POST']
  }
});

io.on('connection', (socket) => {
  console.log('Một người dùng kết nối:', socket.id);
  
  setupHandlers(io, socket);
});

const PORT = process.env.PORT || 3001;

// Phục vụ file giao diện (Frontend)
app.use(express.static(path.join(__dirname, '../../client/dist')));

// Xử lý React Router (Bắt tất cả các route còn lại)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../client/dist/index.html'));
});

httpServer.listen(PORT, () => {
  console.log(`Server chạy tại cổng ${PORT}`);
});
